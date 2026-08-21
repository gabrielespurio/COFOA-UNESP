'use server';

import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';
import { revalidatePath } from 'next/cache';
import { RegistrationStatus } from '@prisma/client';

async function checkAdmin() {
  const session = await getSession();
  if (!session) throw new Error('Unauthorized');
  const user = await prisma.user.findUnique({ where: { id: session.userId }});
  if (user?.role !== 'ADMIN') throw new Error('Forbidden');
}

export async function updateRegistrationStatus(registrationId: string, status: RegistrationStatus) {
  await checkAdmin();

  try {
    await prisma.registration.update({
      where: { id: registrationId },
      data: { status }
    });
    revalidatePath('/admin/inscricoes');
    revalidatePath('/admin');
    return { success: true };
  } catch (error) {
    console.error(error);
    return { error: 'Falha ao atualizar o status' };
  }
}
