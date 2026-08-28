require('dotenv').config({ path: '.env' });
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const registrations = await prisma.registration.findMany({
    include: { category: true }
  });

  for (const reg of registrations) {
    if (reg.category.name.toLowerCase().includes('teste')) {
      console.log(`Deleting test registration ${reg.id} for amount ${reg.amount}`);
      await prisma.registration.delete({
        where: { id: reg.id }
      });
    }
  }
}

main()
  .catch(e => console.error(e))
  .finally(async () => {
    await prisma.$disconnect();
  });
