import { PrismaClient } from '@prisma/client';
import { PrismaNeon } from '@prisma/adapter-neon';
import { neonConfig } from '@neondatabase/serverless';
import ws from 'ws';
import dotenv from 'dotenv';

dotenv.config();
neonConfig.webSocketConstructor = ws;

const connectionString = `${process.env.DATABASE_URL}`;
const adapter = new PrismaNeon({ connectionString });
const prisma = new PrismaClient({ adapter });

async function main() {
  const email = "gabrielespurio@hotmail.com";
  
  const user = await prisma.user.findUnique({
    where: { email },
    include: { participant: true }
  });

  if (!user) {
    console.log(`Usuário não encontrado: ${email}`);
    return;
  }

  if (!user.participant) {
    console.log(`Usuário não completou o perfil de participante ainda.`);
    return;
  }

  const participantId = user.participant.id;

  // 1. Excluir Trabalhos
  const deletedWorks = await prisma.scientificWork.deleteMany({
    where: { participantId }
  });
  console.log(`Excluídos ${deletedWorks.count} trabalhos científicos.`);

  // 2. Excluir Inscrição (cascata excluirá Pagamento)
  const deletedRegistrations = await prisma.registration.deleteMany({
    where: { participantId }
  });
  console.log(`Excluídas ${deletedRegistrations.count} inscrições.`);

  // 3. Criar cupom para ele testar
  const existingCoupon = await prisma.coupon.findFirst({
    where: { userId: user.id }
  });

  let codeToUse = '';
  if (existingCoupon) {
    // Reset usedCount just in case
    await prisma.coupon.update({
      where: { id: existingCoupon.id },
      data: { usedCount: 0 }
    });
    console.log(`Cupom de teste resetado e pronto para uso: ${existingCoupon.code}`);
    codeToUse = existingCoupon.code;
  } else {
    const code = `TESTE-GABRIEL-100`;
    await prisma.coupon.create({
      data: {
        code,
        userId: user.id,
        discountValue: 10000,
        discountType: 'FIXED',
        maxUses: 1
      }
    });
    console.log(`Novo cupom de teste criado: ${code}`);
    codeToUse = code;
  }
}

main().catch(console.error).finally(() => prisma.$disconnect());
