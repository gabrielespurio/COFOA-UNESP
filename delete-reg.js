const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const email = 'gabrielespurio@hotmail.com';
  console.log(`Buscando usuário com email ${email}...`);
  const user = await prisma.user.findUnique({
    where: { email },
    include: { participant: { include: { registration: true } } }
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

  console.log(`Deletando inscrição ${registration.id}...`);
  await prisma.registration.delete({
    where: { id: registration.id }
  });
  console.log('Inscrição deletada com sucesso!');
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
