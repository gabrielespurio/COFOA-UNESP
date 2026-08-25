import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { PrismaNeon } from '@prisma/adapter-neon';
import dotenv from 'dotenv';
dotenv.config();

const connectionString = process.env.DATABASE_URL!;
const adapter = new PrismaNeon({ connectionString });
const prisma = new PrismaClient({ adapter });

async function createCommittee() {
  const existing = await prisma.user.findUnique({ where: { email: 'comissao@cofoa.com.br' } });
  if (existing) {
    console.log('Already exists');
    return;
  }
  const passwordHash = await bcrypt.hash('cofoa2026', 10);
  await prisma.user.create({
    data: {
      email: 'comissao@cofoa.com.br',
      passwordHash,
      role: 'COMMITTEE'
    }
  });
  console.log('Created comissao@cofoa.com.br');
}

createCommittee().catch(console.error).finally(() => prisma.$disconnect());
