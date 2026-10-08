import { prisma } from './src/lib/prisma';

async function main() {
  const batch = await prisma.registrationBatch.findFirst({
    where: { status: 'ACTIVE' }
  });
  console.log(batch);
}

main().catch(console.error).finally(() => prisma.$disconnect());
