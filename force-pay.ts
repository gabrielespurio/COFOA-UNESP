import { prisma } from './src/lib/prisma';

async function main() {
  const email = 'gabrielespurio@hotmail.com';
  console.log(`Buscando usuário com email ${email}...`);
  const user = await prisma.user.findUnique({
    where: { email },
    include: { participant: { include: { registration: { include: { payment: true } } } } }
  });

  if (!user) {
    console.log('Usuário não encontrado.');
    return;
  }

  if (!user.participant) {
    console.log('Usuário não tem perfil de participante.');
    return;
  }

  const registration = user.participant.registration;
  if (!registration) {
    console.log('Usuário não tem inscrição ativa.');
    return;
  }

  console.log(`Atualizando inscrição ${registration.id} para CONFIRMED...`);
  await prisma.registration.update({
    where: { id: registration.id },
    data: { status: 'CONFIRMED' }
  });

  if (registration.payment) {
    console.log(`Atualizando pagamento ${registration.payment.id} para PAID...`);
    await prisma.payment.update({
      where: { id: registration.payment.id },
      data: { status: 'PAID' }
    });
  }

  console.log('Inscrição e pagamento atualizados com sucesso!');
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
