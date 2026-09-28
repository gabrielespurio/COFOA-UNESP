'use server';

import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';
import { revalidatePath } from 'next/cache';

export async function createCoupon({
  userId,
  code,
  discountValue,
  discountType
}: {
  userId: string;
  code: string;
  discountValue: number;
  discountType: 'FIXED' | 'PERCENTAGE';
}) {
  const session = await getSession();
  if (!session || session.role !== 'ADMIN') {
    return { error: 'Não autorizado.' };
  }

  try {
    const existing = await prisma.coupon.findUnique({ where: { code } });
    if (existing) {
      return { error: 'Um cupom com este código já existe.' };
    }

    const coupon = await prisma.coupon.create({
      data: {
        code,
        userId,
        discountValue,
        discountType,
        maxUses: 1, // Geralmente cupons pessoais são de uso único
      },
      include: {
        user: {
          select: {
            email: true,
            participant: { select: { fullName: true } }
          }
        }
      }
    });

    revalidatePath('/admin/cupons');
    return { coupon };
  } catch (err: any) {
    console.error('Erro ao criar cupom:', err);
    return { error: 'Erro interno ao criar o cupom.' };
  }
}
