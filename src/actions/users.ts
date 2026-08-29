'use server';

import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';
import { revalidatePath } from 'next/cache';
import { Role } from '@prisma/client';

export async function updateUserRole(userId: string, newRole: Role) {
  try {
    const session = await getSession();
    if (!session) {
      return { error: 'Usuário não autenticado.' };
    }

    const caller = await prisma.user.findUnique({
      where: { id: session.userId }
    });

    if (!caller || caller.role !== 'ADMIN') {
      return { error: 'Acesso negado. Apenas administradores podem alterar perfis.' };
    }

    if (caller.id === userId) {
      return { error: 'Você não pode alterar o seu próprio perfil.' };
    }

    const validRoles: Role[] = ['PARTICIPANT', 'COMMITTEE', 'ADMIN'];
    if (!validRoles.includes(newRole)) {
      return { error: 'Perfil inválido.' };
    }

    await prisma.user.update({
      where: { id: userId },
      data: { role: newRole }
    });

    revalidatePath('/admin/usuarios');
    
    return { success: true };
  } catch (err: any) {
    console.error('Error updating user role:', err);
    return { error: 'Ocorreu um erro ao atualizar o perfil. Tente novamente.' };
  }
}
