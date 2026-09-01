import { prisma } from './src/lib/prisma';

async function main() {
  const email = 'gabrielespurio@hotmail.com';
  const user = await prisma.user.findUnique({
    where: { email },
    include: { participant: { include: { registration: { include: { payment: true } } } } }
  });

  if (!user || !user.participant) {
    console.log('Usuário/Participante não encontrado');
    return;
  }

  if (!user.participant.registration) {
    console.log('Sem Inscrição. Crie uma na interface primeiro!');
    return;
  }

  const regId = user.participant.registration.id;
  await prisma.registration.update({
    where: { id: regId },
    data: { status: 'CONFIRMED' }
  });

  if (user.participant.registration.payment) {
    await prisma.payment.update({
      where: { id: user.participant.registration.payment.id },
      data: { status: 'PAID' }
    });
    console.log('Pagamento e inscrição atualizados!');
  } else {
    console.log('Inscrição atualizada, mas não há pagamento vinculado.');
  }
}

main().catch(console.error).finally(() => prisma.$disconnect());
