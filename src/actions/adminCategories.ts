'use server';

import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';
import { revalidatePath } from 'next/cache';
import { CategoryType, PriceTier } from '@prisma/client';

async function checkAdmin() {
  const session = await getSession();
  if (!session) throw new Error('Unauthorized');
  const user = await prisma.user.findUnique({ where: { id: session.userId }});
  if (user?.role !== 'ADMIN') throw new Error('Forbidden');
}

export async function getCategories() {
  await checkAdmin();
  return prisma.registrationCategory.findMany({
    orderBy: { sortOrder: 'asc' }
  });
}

export async function createCategory(data: {
  name: string;
  type: CategoryType;
  priceTier: PriceTier;
  requiresCRO: boolean;
  requiresStudentProof: boolean;
  requiresAbroadProof: boolean;
  active: boolean;
}) {
  await checkAdmin();
  
  try {
    // Get highest sort order
    const lastCategory = await prisma.registrationCategory.findFirst({
      orderBy: { sortOrder: 'desc' }
    });
    const nextSortOrder = (lastCategory?.sortOrder ?? 0) + 1;

    await prisma.registrationCategory.create({
      data: {
        ...data,
        sortOrder: nextSortOrder
      }
    });
    
    revalidatePath('/admin/categorias');
    return { success: true };
  } catch (error) {
    console.error('Error creating category:', error);
    return { error: 'Falha ao criar categoria' };
  }
}

export async function toggleCategoryStatus(id: string, active: boolean) {
  await checkAdmin();
  try {
    await prisma.registrationCategory.update({
      where: { id },
      data: { active }
    });
    revalidatePath('/admin/categorias');
    return { success: true };
  } catch (error) {
    return { error: 'Falha ao atualizar categoria' };
  }
}
