import { PrismaClient, Role, RegistrationStatus } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { PrismaNeon } from '@prisma/adapter-neon';
import dotenv from 'dotenv';
dotenv.config();

const connectionString = process.env.DATABASE_URL!;
const adapter = new PrismaNeon({ connectionString });
const prisma = new PrismaClient({ adapter });

async function grantAccess() {
  const targetEmail = 'gabrielespurio@hotmail.com';
  console.log(`Configurando acesso completo para: ${targetEmail}`);

  let user = await prisma.user.findFirst({
    where: {
      email: {
        equals: targetEmail,
        mode: 'insensitive',
      },
    },
    include: {
      participant: {
        include: {
          registration: true,
        },
      },
    },
  });

  const passwordHash = await bcrypt.hash('cofoa2026', 10);

  if (!user) {
    console.log(`Criando usuário ${targetEmail}...`);
    user = await prisma.user.create({
      data: {
        email: targetEmail.toLowerCase(),
        passwordHash,
        roles: [Role.PARTICIPANT, Role.ADMIN],
      },
      include: {
        participant: {
          include: {
            registration: true,
          },
        },
      },
    });
  } else {
    // Add ADMIN and PARTICIPANT
    const rolesSet = new Set<Role>(user.roles);
    rolesSet.add(Role.PARTICIPANT);
    rolesSet.add(Role.ADMIN);

    user = await prisma.user.update({
      where: { id: user.id },
      data: {
        passwordHash: user.passwordHash || passwordHash, // Set password if not set
        roles: Array.from(rolesSet),
      },
      include: {
        participant: {
          include: {
            registration: true,
          },
        },
      },
    });
  }

  // Ensure Participant profile exists
  let participant = user.participant;
  if (!participant) {
    console.log('Criando participante...');
    participant = await prisma.participant.create({
      data: {
        userId: user.id,
        fullName: 'Gabriel Espurio Fernandes',
        cpf: '462.287.248-00',
        birthDate: new Date('1999-06-24'),
        phone: '(17) 99220-4822',
        institution: 'FOA UNESP',
        city: 'Araçatuba',
        state: 'SP',
        course: 'Odontologia',
      },
      include: {
        registration: true,
      },
    });
  }

  // Ensure Registration exists and is CONFIRMED
  if (!participant.registration) {
    console.log('Criando inscrição confirmada de teste...');
    const category = await prisma.registrationCategory.findFirst({ where: { active: true } });
    const batch = await prisma.registrationBatch.findFirst();

    if (category && batch) {
      await prisma.registration.create({
        data: {
          participantId: participant.id,
          categoryId: category.id,
          batchId: batch.id,
          amount: 0,
          status: RegistrationStatus.CONFIRMED,
        },
      });
      console.log('Inscrição confirmada criada com sucesso!');
    }
  } else if (participant.registration.status !== 'CONFIRMED') {
    await prisma.registration.update({
      where: { id: participant.registration.id },
      data: {
        status: RegistrationStatus.CONFIRMED,
      },
    });
    console.log('Inscrição atualizada para CONFIRMED!');
  }

  const finalUser = await prisma.user.findUnique({
    where: { id: user.id },
    include: {
      participant: {
        include: {
          registration: true,
        },
      },
    },
  });

  console.log('=== ACESSO CONFIGURADO COM SUCESSO ===');
  console.log('Email:', finalUser?.email);
  console.log('Roles:', finalUser?.roles);
  console.log('Nome:', finalUser?.participant?.fullName);
  console.log('Status da Inscrição:', finalUser?.participant?.registration?.status);
  console.log('Senha de acesso (se não entrar com Google): cofoa2026');
}

grantAccess()
  .catch((err) => {
    console.error('Erro:', err);
  })
  .finally(() => prisma.$disconnect());
