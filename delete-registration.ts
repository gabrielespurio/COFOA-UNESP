import dotenv from 'dotenv';
dotenv.config();
import ws from 'ws';
import { neonConfig } from '@neondatabase/serverless';
neonConfig.webSocketConstructor = ws;

async function run() {
  const { prisma } = await import('./src/lib/prisma');
  
  const email = 'mateus.kayamori@uel.br';
  
  const user = await prisma.user.findUnique({
    where: { email },
    include: { participant: { include: { registration: true } } }
  });

  if (!user || !user.participant) {
    console.log(`User ${email} or participant not found!`);
    return;
  }

  if (!user.participant.registration) {
    console.log(`User ${email} has no registration!`);
    return;
  }

  const reg = user.participant.registration;

  // Delete registration (cascades to payment)
  await prisma.registration.delete({
    where: { id: reg.id }
  });
  console.log(`Deleted registration ${reg.id}`);

  // Reset coupon if they used one
  if (reg.couponId) {
    await prisma.coupon.update({
      where: { id: reg.couponId },
      data: { usedCount: { decrement: 1 } }
    });
    console.log(`Decremented used count for coupon ${reg.couponId}`);
  }

  console.log('Registration successfully deleted and reset!');
  
  await prisma.$disconnect();
}
run();
