import 'dotenv/config';
import { prisma } from './src/lib/prisma';

async function main() {
  const result = await prisma.scientificWork.updateMany({
    where: {
      status: 'SUBMITTED'
    },
    data: {
      status: 'UNDER_REVIEW'
    }
  });
  console.log(`Updated ${result.count} works.`);
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    // await prisma.$disconnect();
  });
