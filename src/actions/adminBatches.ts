'use server';

import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';
import { revalidatePath } from 'next/cache';
import { BatchStatus } from '@prisma/client';

async function checkAdmin() {
  const session = await getSession();
  if (!session) throw new Error('Unauthorized');
  const user = await prisma.user.findUnique({ where: { id: session.userId }});
  if (user?.role !== 'ADMIN') throw new Error('Forbidden');
}

export async function getBatches() {
  await checkAdmin();
  return prisma.registrationBatch.findMany({
    orderBy: { createdAt: 'desc' }
  });
}

export async function createBatch(data: {
  name: string;
  status: BatchStatus;
  pricePresencialTier1: number;
  pricePresencialTier2: number;
  pricePresencialTier3: number;
  priceOnlineTier1: number;
  priceOnlineTier2: number;
}) {
  await checkAdmin();
  
  try {
    await prisma.registrationBatch.create({
      data: {
        name: data.name,
        status: data.status,
        pricePresencialTier1: Math.round(data.pricePresencialTier1 * 100),
        pricePresencialTier2: Math.round(data.pricePresencialTier2 * 100),
        pricePresencialTier3: Math.round(data.pricePresencialTier3 * 100),
        priceOnlineTier1: Math.round(data.priceOnlineTier1 * 100),
        priceOnlineTier2: Math.round(data.priceOnlineTier2 * 100),
      }
    });
    
    revalidatePath('/admin/lotes');
    return { success: true };
  } catch (error) {
    console.error('Error creating batch:', error);
    return { error: 'Falha ao criar lote' };
  }
}

export async function toggleBatchStatus(id: string, status: BatchStatus) {
  await checkAdmin();
  try {
    await prisma.registrationBatch.update({
      where: { id },
      data: { status }
    });
    revalidatePath('/admin/lotes');
    return { success: true };
  } catch (error) {
    return { error: 'Falha ao atualizar lote' };
  }
}
