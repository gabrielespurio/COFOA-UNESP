import { PrismaClient } from '@prisma/client';
import { PrismaNeon } from '@prisma/adapter-neon';
import { neonConfig } from '@neondatabase/serverless';
import ws from 'ws';
import dotenv from 'dotenv';
dotenv.config();

neonConfig.webSocketConstructor = ws;

const connectionString = process.env.DATABASE_URL!;
const adapter = new PrismaNeon({ connectionString });
const prisma = new PrismaClient({ adapter });

async function main() {
  const works = await prisma.scientificWork.findMany({
    where: { status: { not: 'DRAFT' } },
    select: { id: true, title: true, status: true, stage1Approved: true }
  });
  console.log('Works:', works);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
