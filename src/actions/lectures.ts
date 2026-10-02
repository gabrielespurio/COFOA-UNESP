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

export async function checkInByQrToken(qrCodeToken: string) {
  await checkCommitteeOrAdmin();

  const enrollment = await prisma.lectureEnrollment.findUnique({
    where: { qrCodeToken },
    include: {
      participant: { select: { fullName: true, cpf: true } },
      lecture: { select: { id: true, title: true, startTime: true } },
    },
  });

  if (!enrollment) {
    return { error: 'QR Code inválido. Nenhuma inscrição encontrada para este código.' };
  }

  if (enrollment.status === 'CANCELLED') {
    return { error: 'Esta inscrição foi cancelada pelo participante.' };
  }

  if (enrollment.status === 'ATTENDED') {
    return {
      error: 'Presença já registrada anteriormente.',
      data: {
        participantName: enrollment.participant.fullName,
        lectureTitle: enrollment.lecture.title,
        checkedInAt: enrollment.checkedInAt?.toISOString() || null,
        alreadyCheckedIn: true,
      },
    };
  }

  try {
    const now = new Date();
    await prisma.lectureEnrollment.update({
      where: { id: enrollment.id },
      data: { status: 'ATTENDED', checkedInAt: now },
    });

    revalidatePath('/comissao/presenca');
    return {
      success: true,
      data: {
        participantName: enrollment.participant.fullName,
        lectureTitle: enrollment.lecture.title,
        lectureId: enrollment.lecture.id,
        checkedInAt: now.toISOString(),
      },
    };
  } catch (err: any) {
    console.error('Error checking in:', err);
    return { error: 'Erro ao registrar presença.' };
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
      enrollments: {
        where: { status: 'ATTENDED' },
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
    totalAttended: l.enrollments.length,
  }));
}

export async function getLectureAttendance(lectureId: string) {
  await checkCommitteeOrAdmin();

  const lecture = await prisma.lecture.findUnique({
    where: { id: lectureId },
    include: {
      enrollments: {
        where: { status: { not: 'CANCELLED' } },
        include: {
          participant: {
            select: { fullName: true, cpf: true, user: { select: { email: true } } },
          },
        },
        orderBy: { createdAt: 'asc' },
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
    enrollments: lecture.enrollments.map((e: any) => ({
      id: e.id,
      participantName: e.participant.fullName,
      participantEmail: e.participant.user.email,
      status: e.status,
      checkedInAt: e.checkedInAt,
    })),
  };
}
