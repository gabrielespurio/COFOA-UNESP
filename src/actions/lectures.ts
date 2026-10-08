'use server';

import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';
import { revalidatePath } from 'next/cache';

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

export async function registerAttendance(participantId: string, lectureId: string, type: 'ENTRY' | 'EXIT') {
  await checkCommitteeOrAdmin();

  const participant = await prisma.participant.findUnique({
    where: { id: participantId },
    include: { user: { select: { email: true } } },
  });

  if (!participant) {
    return { error: 'QR Code inválido. Participante não encontrado.' };
  }

  const lecture = await prisma.lecture.findUnique({
    where: { id: lectureId },
  });

  if (!lecture) {
    return { error: 'Palestra não selecionada ou não encontrada.' };
  }

  try {
    const attendance = await prisma.lectureAttendance.create({
      data: {
        participantId,
        lectureId,
        type,
      },
    });

    revalidatePath('/comissao/presenca');
    return {
      success: true,
      data: {
        participantName: participant.fullName,
        participantEmail: participant.user.email,
        lectureTitle: lecture.title,
        lectureId: lecture.id,
        type,
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

  return lectures.map((l: any) => ({
    id: l.id,
    title: l.title,
    speaker: l.speaker,
    startTime: l.startTime,
    endTime: l.endTime,
    location: l.location,
    totalEnrolled: l._count.enrollments,
    totalAttended: l.attendances.length,
  }));
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
    attendances: lecture.attendances.map((a: any) => ({
      id: a.id,
      participantName: a.participant.fullName,
      participantEmail: a.participant.user.email,
      type: a.type,
      scannedAt: a.scannedAt,
    })),
  };
}
