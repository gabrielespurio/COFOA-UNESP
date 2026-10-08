import 'dotenv/config';
import { prisma } from './src/lib/prisma';

async function main() {
  const emailStr = 'comissao@cofoa.com.br';
  console.log(`Processing ${emailStr}...`);

  const user = await prisma.user.findFirst({
    where: { email: { equals: emailStr, mode: 'insensitive' } },
  });

  if (!user) {
    console.log('User not found!');
    return;
  }

  // Ensure COMMITTEE role
  if (!user.roles.includes('COMMITTEE')) {
    await prisma.user.update({
      where: { id: user.id },
      data: { roles: { push: 'COMMITTEE' } }
    });
    console.log('Added COMMITTEE role.');
  } else {
    console.log('User already has COMMITTEE role.');
  }

  console.log('Done!');
}

main().catch(console.error);
