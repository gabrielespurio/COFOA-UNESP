import { PrismaClient } from '@prisma/client';
import crypto from 'crypto';
import { PrismaNeon } from '@prisma/adapter-neon';
import dotenv from 'dotenv';
dotenv.config();

const connectionString = process.env.DATABASE_URL!;
const adapter = new PrismaNeon({ connectionString });
const prisma = new PrismaClient({ adapter });

async function backfill() {
  const works = await prisma.scientificWork.findMany({
    where: { displayCode: null }
  });

  for (const work of works) {
    const code = `TRB-${crypto.randomBytes(3).toString('hex').toUpperCase()}`;
    await prisma.scientificWork.update({
      where: { id: work.id },
      data: { displayCode: code }
    });
    console.log(`Updated work ${work.title} with code ${code}`);
  }
  console.log('Done');
}

backfill().catch(console.error).finally(() => prisma.$disconnect());
