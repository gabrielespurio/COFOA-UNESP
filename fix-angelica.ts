import 'dotenv/config';
import { prisma } from './src/lib/prisma';

async function main() {
  const email = 'angelicajesus@ufpi.edu.br';
  console.log(`Corrigindo usuário: ${email}`);

  const user = await prisma.user.findUnique({
    where: { email },
    include: { participant: { include: { registration: true } } }
  });

  if (!user) {
    console.log(`[ERRO] Usuário não encontrado: ${email}`);
    return;
  }

  if (user.participant?.registration) {
    console.log(`Deletando inscrição pendente...`);
    await prisma.registration.delete({
      where: { id: user.participant.registration.id }
    });
  }

  const firstName = user.participant?.fullName 
      ? user.participant.fullName.split(' ')[0].toUpperCase()
      : email.split('@')[0].toUpperCase().replace(/[^A-Z]/g, '');

  const code = `DESC100-${firstName}`;

  await prisma.coupon.upsert({
    where: { code },
    update: {
      discountValue: 10000,
      active: true,
      userId: user.id,
      usedCount: 0
    },
    create: {
      code,
      discountType: 'FIXED',
      discountValue: 10000,
      maxUses: 1,
      active: true,
      userId: user.id
    }
  });

  console.log(`[OK] Cupom gerado: ${code}`);
}

main().catch(console.error);
