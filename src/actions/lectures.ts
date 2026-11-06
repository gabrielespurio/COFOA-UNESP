'use server';

import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';
import { revalidatePath } from 'next/cache';
import { formatBRTDateTime, formatBRTTime } from '@/lib/formatDate';

// ─── Helpers ───────────────────────────────────────────────

async function getParticipantOrThrow() {
  const session = await getSession();
  if (!session) throw new Error('Usuário não autenticado.');
  const participant = await prisma.participant.findUnique({
    where: { userId: session.userId },
  });
  if (!participant) throw new Error('Perfil de participante não encontrado.');
  return { session, participant };
}

async function checkCommitteeOrAdmin() {
  const session = await getSession();
  if (!session) throw new Error('Unauthorized');
  const user = await prisma.user.findUnique({ where: { id: session.userId } });
  if (!user?.roles.some(r => r === 'COMMITTEE' || r === 'ADMIN')) {
    throw new Error('Forbidden');
  }
  return session;
}

// ─── Public Queries ────────────────────────────────────────

export async function getLectures() {
  const lectures = await prisma.lecture.findMany({
    where: { active: true },
    include: {
      _count: { select: { enrollments: { where: { status: { not: 'CANCELLED' } } } } },
    },
    orderBy: { startTime: 'asc' },
  });
  return lectures;
}

export async function getMyEnrollments() {
  const { participant } = await getParticipantOrThrow();

  const enrollments = await prisma.lectureEnrollment.findMany({
    where: {
      participantId: participant.id,
      status: { not: 'CANCELLED' },
    },
    include: {
      lecture: true,
    },
    orderBy: { lecture: { startTime: 'asc' } },
  });
  return enrollments;
}

export async function getMyEnrolledLectureIds() {
  const session = await getSession();
  if (!session) return [];
  const participant = await prisma.participant.findUnique({
    where: { userId: session.userId },
  });
  if (!participant) return [];

  const enrollments = await prisma.lectureEnrollment.findMany({
    where: {
      participantId: participant.id,
      status: { not: 'CANCELLED' },
    },
    select: { lectureId: true },
  });
  return enrollments.map((e: any) => e.lectureId);
}

// ─── Participant Actions ───────────────────────────────────

export async function enrollInLecture(lectureId: string) {
  const { participant } = await getParticipantOrThrow();

  // Check participant has a confirmed registration
  const registration = await prisma.registration.findUnique({
    where: { participantId: participant.id },
  });
  if (!registration || registration.status !== 'CONFIRMED') {
    return { error: 'Você precisa ter uma inscrição confirmada no evento para se inscrever em palestras.' };
  }

  // Check lecture exists and is active
  const lecture = await prisma.lecture.findUnique({ where: { id: lectureId } });
  if (!lecture || !lecture.active) {
    return { error: 'Palestra não encontrada ou não está disponível.' };
  }

  // Check not already enrolled
  const existing = await prisma.lectureEnrollment.findUnique({
    where: { participantId_lectureId: { participantId: participant.id, lectureId } },
  });
  if (existing && existing.status !== 'CANCELLED') {
    return { error: 'Você já está inscrito nesta palestra.' };
  }

  try {
    if (existing && existing.status === 'CANCELLED') {
      // Re-enroll
      await prisma.lectureEnrollment.update({
        where: { id: existing.id },
        data: { status: 'ENROLLED', checkedInAt: null },
      });
    } else {
      await prisma.lectureEnrollment.create({
        data: {
          participantId: participant.id,
          lectureId,
        },
      });
    }

    revalidatePath('/area-participante/programacao');
    revalidatePath('/area-participante/programacao/meus-qrcodes');
    return { success: true };
  } catch (err: any) {
    console.error('Error enrolling in lecture:', err);
    return { error: 'Erro ao se inscrever na palestra.' };
  }
}

export async function cancelLectureEnrollment(enrollmentId: string) {
  const { participant } = await getParticipantOrThrow();

  const enrollment = await prisma.lectureEnrollment.findUnique({
    where: { id: enrollmentId },
  });

  if (!enrollment || enrollment.participantId !== participant.id) {
    return { error: 'Inscrição não encontrada.' };
  }

  if (enrollment.status === 'ATTENDED') {
    return { error: 'Não é possível cancelar uma inscrição com presença já registrada.' };
  }

  try {
    await prisma.lectureEnrollment.update({
      where: { id: enrollmentId },
      data: { status: 'CANCELLED' },
    });

    revalidatePath('/area-participante/programacao');
    revalidatePath('/area-participante/programacao/meus-qrcodes');
    return { success: true };
  } catch (err: any) {
    console.error('Error cancelling lecture enrollment:', err);
    return { error: 'Erro ao cancelar inscrição na palestra.' };
  }
}

// ─── Committee Actions ─────────────────────────────────────

export async function registerAttendance(rawParticipantId: string, lectureId: string, requestedType: 'ENTRY' | 'EXIT') {
  await checkCommitteeOrAdmin();

  const cleanId = rawParticipantId.trim();
  const cleanCpf = cleanId.replace(/\D/g, '');

  const participant = await prisma.participant.findFirst({
    where: {
      OR: [
        { id: cleanId },
        ...(cleanCpf.length === 11 ? [{ cpf: cleanCpf }] : [])
      ]
    },
    include: {
      user: { select: { email: true } },
      registration: { select: { status: true } },
    },
  });

  if (!participant) {
    return { error: 'QR Code inválido. Participante não encontrado.' };
  }

  const lecture = await prisma.lecture.findUnique({
    where: { id: lectureId },
  });

  if (!lecture) {
    return { error: 'Atividade não selecionada ou não encontrada.' };
  }

  // Verifica se é a atividade especial de "Retirada de Brinde"
  const isKitPickup =
    lecture.id === 'credenciamento-brinde' ||
    lecture.title.toLowerCase().includes('brinde') ||
    lecture.title.toLowerCase().includes('kit');

  // CASO 1: RETIRADA DE BRINDE (Apenas ENTRADA - Uso Único por Participante)
  if (isKitPickup) {
    // 1.1 Verificar se a inscrição do participante está confirmada
    if (participant.registration?.status !== 'CONFIRMED') {
      return {
        error: `Inscrição não confirmada. Somente congressistas confirmados podem retirar o brinde.`,
      };
    }

    // 1.2 Verificar se já retirou o brinde
    const existingKit = await prisma.lectureAttendance.findFirst({
      where: {
        participantId: participant.id,
        lectureId: lecture.id,
      },
      orderBy: { scannedAt: 'desc' },
    });

    if (existingKit) {
      const formattedDate = formatBRTDateTime(existingKit.scannedAt);
      return {
        error: `ATENÇÃO: O brinde deste participante JÁ FOI RETIRADO em ${formattedDate}! Não entregar novamente.`,
        alreadyClaimed: true,
      };
    }

    // 1.3 Registrar retirada do brinde
    try {
      const attendance = await prisma.lectureAttendance.create({
        data: {
          participantId: participant.id,
          lectureId: lecture.id,
          type: 'ENTRY',
        },
      });

      revalidatePath('/comissao/presenca');
      revalidatePath(`/comissao/presenca/${lecture.id}`);

      return {
        success: true,
        data: {
          participantName: participant.fullName,
          participantEmail: participant.user.email,
          lectureTitle: lecture.title,
          lectureId: lecture.id,
          type: 'ENTRY' as const,
          checkedInAt: attendance.scannedAt.toISOString(),
          message: 'Brinde/Kit retirado com sucesso!',
        },
      };
    } catch (err: any) {
      console.error('Error registering kit pickup:', err);
      return { error: 'Erro ao registrar retirada de brinde.' };
    }
  }

  // CASO 2: ATIVIDADES NORMAIS (Regra de alternância: ENTRADA -> SAÍDA -> ENTRADA)
  const lastAttendance = await prisma.lectureAttendance.findFirst({
    where: {
      participantId: participant.id,
      lectureId: lecture.id,
    },
    orderBy: { scannedAt: 'desc' },
  });

  if (requestedType === 'ENTRY') {
    // Não permite registrar ENTRADA se a última leitura já tiver sido ENTRADA
    if (lastAttendance && lastAttendance.type === 'ENTRY') {
      const timeStr = formatBRTTime(lastAttendance.scannedAt);
      return {
        error: `O participante já registrou ENTRADA nesta atividade (às ${timeStr}). É necessário registrar a SAÍDA antes de uma nova entrada.`,
      };
    }
  } else if (requestedType === 'EXIT') {
    // Não permite registrar SAÍDA se não houver ENTRADA prévia ativa
    if (!lastAttendance || lastAttendance.type === 'EXIT') {
      return {
        error: `Não há registro de ENTRADA pendente para este participante nesta atividade (ou a saída já foi realizada anteriormente).`,
      };
    }
  }

  try {
    const attendance = await prisma.lectureAttendance.create({
      data: {
        participantId: participant.id,
        lectureId: lecture.id,
        type: requestedType,
      },
    });

    revalidatePath('/comissao/presenca');
    revalidatePath(`/comissao/presenca/${lecture.id}`);

    return {
      success: true,
      data: {
        participantName: participant.fullName,
        participantEmail: participant.user.email,
        lectureTitle: lecture.title,
        lectureId: lecture.id,
        type: requestedType,
        checkedInAt: attendance.scannedAt.toISOString(),
      },
    };
  } catch (err: any) {
    console.error('Error registering attendance:', err);
    return { error: 'Erro ao registrar leitura.' };
  }
}

export async function getLecturesForAttendance() {
  await checkCommitteeOrAdmin();

  // Garante que a atividade "Participante Congresso — Retirada de Brinde" exista
  let kitLecture = await prisma.lecture.findFirst({
    where: {
      OR: [
        { id: 'credenciamento-brinde' },
        { title: { contains: 'Retirada de Brinde', mode: 'insensitive' } },
        { title: { contains: 'Brinde', mode: 'insensitive' } }
      ]
    }
  });

  if (!kitLecture) {
    try {
      kitLecture = await prisma.lecture.create({
        data: {
          id: 'credenciamento-brinde',
          title: 'Participante Congresso — Retirada de Brinde',
          speaker: 'Secretaria / Recepção',
          location: 'Credenciamento',
          startTime: new Date('2026-11-06T07:00:00-03:00'),
          endTime: new Date('2026-11-08T22:00:00-03:00'),
          active: true,
        }
      });
    } catch (e) {
      console.warn('Could not auto-create kit lecture:', e);
    }
  }

  const lectures = await prisma.lecture.findMany({
    where: { active: true },
    include: {
      _count: {
        select: {
          enrollments: true,
        },
      },
      attendances: {
        select: { id: true },
      },
    },
    orderBy: { startTime: 'asc' },
  });

  // Ordena para que a "Retirada de Brinde" fique sempre no topo
  const formatted = lectures.map((l: any) => {
    const isKit = l.id === 'credenciamento-brinde' || l.title.toLowerCase().includes('brinde');
    return {
      id: l.id,
      title: l.title,
      speaker: l.speaker,
      startTime: l.startTime,
      endTime: l.endTime,
      location: l.location,
      totalEnrolled: l._count.enrollments,
      totalAttended: l.attendances.length,
      isKitPickup: isKit,
    };
  });

  formatted.sort((a, b) => {
    if (a.isKitPickup) return -1;
    if (b.isKitPickup) return 1;
    return new Date(a.startTime).getTime() - new Date(b.startTime).getTime();
  });

  return formatted;
}

export async function getLectureAttendance(lectureId: string) {
  await checkCommitteeOrAdmin();

  const lecture = await prisma.lecture.findUnique({
    where: { id: lectureId },
    include: {
      attendances: {
        include: {
          participant: {
            select: { fullName: true, cpf: true, user: { select: { email: true } } },
          },
        },
        orderBy: { scannedAt: 'desc' },
      },
    },
  });

  if (!lecture) return null;

  return {
    id: lecture.id,
    title: lecture.title,
    speaker: lecture.speaker,
    startTime: lecture.startTime,
    endTime: lecture.endTime,
    location: lecture.location,
    isKitPickup: lecture.id === 'credenciamento-brinde' || lecture.title.toLowerCase().includes('brinde'),
    attendances: lecture.attendances.map((a: any) => ({
      id: a.id,
      participantName: a.participant.fullName,
      participantEmail: a.participant.user.email,
      type: a.type,
      scannedAt: a.scannedAt,
    })),
  };
}
