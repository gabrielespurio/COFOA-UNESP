'use server';

import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';
import { revalidatePath } from 'next/cache';
import { Role } from '@prisma/client';

export async function updateUserRoles(userId: string, newRoles: Role[]) {
  try {
    const session = await getSession();
    if (!session) {
      return { error: 'Usuário não autenticado.' };
    }

    const caller = await prisma.user.findUnique({
      where: { id: session.userId }
    });

    if (!caller || !caller.roles.includes('ADMIN')) {
      return { error: 'Acesso negado. Apenas administradores podem alterar perfis.' };
    }

    if (caller.id === userId) {
      return { error: 'Você não pode alterar o seu próprio perfil.' };
    }

    const validRoles: Role[] = ['PARTICIPANT', 'COMMITTEE', 'ADMIN', 'SCREENER'];
    const invalidRoles = newRoles.filter(role => !validRoles.includes(role));
    
    if (invalidRoles.length > 0) {
      return { error: 'Perfil inválido selecionado.' };
    }
    
    // Fallback: everyone is a participant
    const finalRoles = newRoles.includes('PARTICIPANT') ? newRoles : [...newRoles, 'PARTICIPANT'];

    await prisma.user.update({
      where: { id: userId },
      data: { roles: finalRoles as Role[] }
    });

    revalidatePath('/admin/usuarios');
    
    return { success: true };
  } catch (err: any) {
    console.error('Error updating user roles:', err);
    return { error: 'Ocorreu um erro ao atualizar o perfil. Tente novamente.' };
  }
}
