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
    await prisma.scientificWork.update({
      where: { id: workId },
      data: {
        status: finalStatus,
        reviewerComments: comments || null,
      }
    });

    revalidatePath('/comissao');
    revalidatePath('/comissao/trabalhos');
    revalidatePath(`/comissao/trabalhos/${workId}`);
  } catch (err) {
    console.error('Error evaluating work:', err);
    return { error: 'Ocorreu um erro ao salvar a avaliação.' };
  }

  return { success: true };
}
