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
  const res = await prisma.scientificWork.updateMany({
    where: { 
      status: { not: 'DRAFT' },
      stage1Approved: false 
    },
    data: { stage1Approved: true }
  });
  console.log('Updated works:', res.count);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
