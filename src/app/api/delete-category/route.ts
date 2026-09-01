import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  const category = await prisma.registrationCategory.findFirst({
    where: { name: { contains: 'teste', mode: 'insensitive' } }
  });

  if (!category) {
    return NextResponse.json({ error: 'Categoria não encontrada.' });
  }

  await prisma.registration.deleteMany({
    where: { categoryId: category.id }
  });

  await prisma.registrationCategory.delete({
    where: { id: category.id }
  });

  return NextResponse.json({ success: true, message: 'Categoria de teste deletada com sucesso!' });
}
