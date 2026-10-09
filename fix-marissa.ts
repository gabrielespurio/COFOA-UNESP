import 'dotenv/config';
import { prisma } from './src/lib/prisma';

async function main() {
  const email = 'marissa.timpurim@unesp.br';
  
  const user = await prisma.user.findUnique({
    where: { email },
    include: { participant: { include: { registration: true } } }
  });

  if (!user || !user.participant) {
    console.log('User or participant not found');
    return;
  }

  const registration = user.participant.registration;

  if (registration) {
    console.log('Deleting registration...', registration.id);
    await prisma.registration.delete({
      where: { id: registration.id }
    });
    console.log('Registration deleted successfully.');
  } else {
    console.log('No pending registration found to delete.');
  }

  const code = 'COFOA-MARISSA';
  const coupon = await prisma.coupon.upsert({
    where: { code },
    update: { 
      discountValue: 5000, 
      active: true, 
      userId: user.id, 
      usedCount: 0 
    },
    create: {
      code,
      discountType: 'FIXED',
      discountValue: 5000,
      maxUses: 1,
      active: true,
      userId: user.id
    }
  });

  console.log('Coupon ready:', coupon);
}

main().catch(console.error);
