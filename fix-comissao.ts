import 'dotenv/config';
import { prisma } from './src/lib/prisma';
import bcrypt from 'bcryptjs';

async function main() {
  const emailStr = 'comissao@cofoa.com';
  console.log(`Processing ${emailStr}...`);

  let user = await prisma.user.findFirst({
    where: { email: { equals: emailStr, mode: 'insensitive' } },
    include: { participant: true }
  });

  if (!user) {
    console.log('User not found. Creating user...');
    const passwordHash = await bcrypt.hash('123456', 10);
    user = await prisma.user.create({
      data: {
        email: emailStr,
        passwordHash,
        roles: ['PARTICIPANT', 'COMMITTEE']
      },
      include: { participant: true }
    });
    console.log('User created with password 123456.');
  } else {
    if (!user.roles.includes('COMMITTEE')) {
      await prisma.user.update({
        where: { id: user.id },
        data: { roles: { push: 'COMMITTEE' } }
      });
      console.log('Added COMMITTEE role.');
    }
  }

  // Ensure Participant profile exists
  if (!user.participant) {
    await prisma.participant.create({
      data: {
        userId: user.id,
        fullName: 'Membro da Comissão',
        cpf: '000.000.000-00',
        phone: '(00) 00000-0000',
        institution: 'FOA UNESP',
        city: 'Araçatuba',
        state: 'SP'
      }
    });
    console.log('Created mock Participant profile.');
  } else {
    console.log('Participant profile already exists.');
  }

  console.log('Done!');
}

main().catch(console.error);
