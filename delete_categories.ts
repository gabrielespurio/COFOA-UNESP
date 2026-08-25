import { prisma } from './src/lib/prisma';

async function main() {
  const result = await prisma.registrationCategory.deleteMany({
    where: {
      id: {
        in: ['com-ext-banca', 'foa-ext-banca']
      }
    }
  });
  console.log(`Deleted ${result.count} categories from database.`);
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
