'use server';

import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';
import { revalidatePath } from 'next/cache';

export async function saveEvaluatorProfile(formData: FormData) {
  const session = await getSession();
  if (!session) return { error: 'Não autenticado.' };

  const user = await prisma.user.findUnique({ where: { id: session.userId } });
  if (!user || !user.roles.includes('EVALUATOR')) {
    return { error: 'Permissão negada.' };
  }

  const fullName = formData.get('fullName') as string;
  const institution = formData.get('institution') as string;
  const area = formData.get('area') as string;
  const phone = formData.get('phone') as string;

  if (!fullName || !institution || !area || !phone) {
    return { error: 'Todos os campos são obrigatórios.' };
  }

  try {
    await prisma.evaluatorProfile.upsert({
      where: { userId: session.userId },
      create: {
        userId: session.userId,
        fullName,
        institution,
        area,
        phone,
      },
      update: {
        fullName,
        institution,
        area,
        phone,
      }
    });

    revalidatePath('/avaliador');
    return { success: true };
  } catch (error) {
    console.error('Failed to save evaluator profile:', error);
    return { error: 'Ocorreu um erro ao salvar o perfil.' };
  }
}
