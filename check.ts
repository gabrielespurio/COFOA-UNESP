import dotenv from 'dotenv';
dotenv.config();
import ws from 'ws';
import { neonConfig } from '@neondatabase/serverless';
neonConfig.webSocketConstructor = ws;

async function run() {
  const { prisma } = await import('./src/lib/prisma');
  
  const user = await prisma.user.findUnique({
    where: { email: 'gabrielespurio@hotmail.com' },
    include: { participant: true }
  });

  if (user?.participant?.id) {
    const res = await prisma.registration.deleteMany({
      where: { participantId: user.participant.id }
    });
    console.log('Deleted registrations:', res.count);

    await prisma.coupon.updateMany({
      where: { userId: user.id },
      data: { usedCount: 0 }
    });
    console.log('Reset coupon count');
  }

  await prisma.$disconnect();
}
run();
