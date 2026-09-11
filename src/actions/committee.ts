'use server';

import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';
import { revalidatePath } from 'next/cache';
import { WorkStatus } from '@prisma/client';

export async function evaluateWork(formData: FormData) {
  const session = await getSession();
  if (!session || session.role !== 'COMMITTEE') {
    return { error: 'Usuário sem permissão.' };
  }

  const workId = formData.get('workId') as string;
  const decision = formData.get('decision') as string;
  const comments = formData.get('comments') as string;

  if (!workId || !decision) {
    return { error: 'Dados incompletos.' };
  }

  const work = await prisma.scientificWork.findUnique({ where: { id: workId } });
  if (!work) {
    return { error: 'Trabalho não encontrado.' };
  }

  if (work.status === 'ACCEPTED' && (decision === 'REJECT' || decision === 'REVISION')) {
    return { error: 'Um trabalho já aprovado não pode ser reprovado ou alterado para ressalva.' };
  }

  let finalStatus: WorkStatus = 'UNDER_REVIEW';

  if (decision === 'APPROVE') {
    finalStatus = 'ACCEPTED';
  } else if (decision === 'REJECT') {
    finalStatus = 'REJECTED';
  } else if (decision === 'REVISION') {
    finalStatus = 'REVISION_REQUESTED';
    if (!comments || comments.trim().length === 0) {
      return { error: 'Ao aprovar com ressalva, é obrigatório preencher o parecer (comentários).' };
    }
  }

  try {
    await prisma.$transaction([
      prisma.scientificWork.update({
        where: { id: workId },
        data: {
          status: finalStatus,
          reviewerComments: comments || null,
          lockedById: null,
          lockedAt: null,
        }
      }),
      prisma.workEvaluation.create({
        data: {
          workId,
          evaluatorId: session.userId,
          status: finalStatus,
          comments: comments || null,
        }
      })
    ]);

    revalidatePath('/comissao');
    revalidatePath('/comissao/trabalhos');
    revalidatePath(`/comissao/trabalhos/${workId}`);
  } catch (err) {
    console.error('Error evaluating work:', err);
    return { error: 'Ocorreu um erro ao salvar a avaliação.' };
  }

  return { success: true };
}

export async function lockWork(workId: string) {
  const session = await getSession();
  if (!session || session.role !== 'COMMITTEE') {
    return { error: 'Usuário sem permissão.' };
  }

  const work = await prisma.scientificWork.findUnique({ where: { id: workId } });
  if (!work) return { error: 'Trabalho não encontrado.' };

  const now = new Date();
  const sixtyMinutesAgo = new Date(now.getTime() - 60 * 60 * 1000);

  // Se estiver travado por outro usuário e a trava ainda não expirou (60 min)
  if (
    work.lockedById && 
    work.lockedById !== session.userId && 
    work.lockedAt && 
    work.lockedAt > sixtyMinutesAgo
  ) {
    return { error: 'Este trabalho já está sendo avaliado por outro membro da comissão neste exato momento.' };
  }

  // Adquire a trava
  await prisma.scientificWork.update({
    where: { id: workId },
    data: {
      lockedById: session.userId,
      lockedAt: now
    }
  });

  revalidatePath('/comissao/trabalhos');
  return { success: true };
}

export async function unlockWork(workId: string) {
  const session = await getSession();
  if (!session) return { error: 'Usuário não autenticado.' };

  const work = await prisma.scientificWork.findUnique({ where: { id: workId } });
  
  // Apenas destrava se a trava pertencer ao usuário atual
  if (work && work.lockedById === session.userId) {
    await prisma.scientificWork.update({
      where: { id: workId },
      data: {
        lockedById: null,
        lockedAt: null
      }
    });
    revalidatePath('/comissao/trabalhos');
  }
  
  return { success: true };
}
