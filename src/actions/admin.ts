'use server';

import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';
import { revalidatePath } from 'next/cache';
import { RegistrationStatus } from '@prisma/client';

async function checkAdmin() {
  const session = await getSession();
  if (!session) throw new Error('Unauthorized');
  const user = await prisma.user.findUnique({ where: { id: session.userId }});
  if (!user?.roles.includes('ADMIN')) throw new Error('Forbidden');
}

export async function updateRegistrationStatus(registrationId: string, status: RegistrationStatus) {
  await checkAdmin();

  try {
    const updatedReg = await prisma.registration.update({
      where: { id: registrationId },
      data: { status },
      include: { participant: true, category: true }
    });

    if (status === 'CONFIRMED' && (updatedReg.category.id === 'banca-int' || updatedReg.category.id === 'banca-ext')) {
      const user = await prisma.user.findUnique({ where: { id: updatedReg.participant.userId }});
      if (user && !user.roles.includes('EVALUATOR')) {
        await prisma.user.update({
          where: { id: user.id },
          data: { roles: { push: 'EVALUATOR' } }
        });
      }
    }

    revalidatePath('/admin/inscricoes');
    revalidatePath('/admin');
    return { success: true };
  } catch (error) {
    console.error(error);
    return { error: 'Falha ao atualizar o status' };
  }
}

export async function evaluateWorkStage1(formData: FormData) {
  const session = await getSession();
  if (!session) throw new Error('Unauthorized');
  const user = await prisma.user.findUnique({ where: { id: session.userId }});
  if (!user?.roles.includes('ADMIN') && !user?.roles.includes('SCREENER')) throw new Error('Forbidden');

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

  if (decision === 'APPROVE') {
    try {
      await prisma.scientificWork.update({
        where: { id: workId },
        data: { stage1Approved: true, status: 'UNDER_REVIEW' }
      });
      revalidatePath('/triagem');
      revalidatePath('/comissao/trabalhos');
      return { success: true };
    } catch (err) {
      console.error(err);
      return { error: 'Erro ao aprovar a triagem.' };
    }
  } else if (decision === 'REJECT') {
    if (!comments || comments.trim().length === 0) {
      return { error: 'Ao reprovar na triagem, é obrigatório preencher o motivo (ressalva).' };
    }

    try {
      await prisma.scientificWork.update({
        where: { id: workId },
        data: {
          status: 'REVISION_REQUESTED',
          reviewerComments: comments,
          stage1Approved: false
        }
      });
      revalidatePath('/triagem');
      return { success: true };
    } catch (err) {
      console.error(err);
      return { error: 'Erro ao reprovar a triagem.' };
    }
  }

  return { error: 'Decisão inválida.' };
}
