import { prisma } from './src/lib/prisma';
import { CategoryType } from '@prisma/client';

async function main() {
  const extExists = await prisma.registrationCategory.findUnique({ where: { id: 'banca-ext' }});
  if (!extExists) {
    await prisma.registrationCategory.create({
      data: {
        id: 'banca-ext',
        name: 'Banca Avaliadora Externa',
        type: CategoryType.PRESENCIAL,
        priceTier: 'BANCA_EXTERNA' as any,
        requiresCRO: false,
        requiresStudentProof: false,
        requiresAbroadProof: false,
        sortOrder: 11,
        active: true
      }
    });
    console.log('Criado: Banca Avaliadora Externa');
  }
}

main().catch(console.error).finally(() => prisma.$disconnect());
