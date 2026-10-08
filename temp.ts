import dotenv from 'dotenv';
dotenv.config();
import ws from 'ws';
import { neonConfig } from '@neondatabase/serverless';
neonConfig.webSocketConstructor = ws;

async function run() {
  const { prisma } = await import('./src/lib/prisma');
  
  const user = await prisma.user.findUnique({
    where: { email: 'gabrielespurio@hotmail.com' },
    include: { participant: { include: { registration: true } } }
  });

  if (!user || !user.participant) return;

  const coupon = await prisma.coupon.findFirst({
    where: { userId: user.id }
  });

  console.log('User found, deleting existing registration...');
  await prisma.registration.deleteMany({where: {participantId: user.participant.id}});
  
  const categoryId = 'grad-pos-foa';
  const batchId = 'cmt4t2ls80002xkv148mlz0p2'; // Lote Promocional
  let finalAmount = 17500;
  
  if (coupon) {
    finalAmount = finalAmount - coupon.discountValue;
  }

  const dueDateStr = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

  await prisma.registration.create({
    data: {
      participantId: user.participant.id,
      categoryId,
      batchId,
      couponId: coupon?.id,
      status: 'PENDING',
      amount: finalAmount,
      payment: {
        create: {
          gatewayId: 'mock-payment-id-for-testing',
          amount: finalAmount,
          status: 'PENDING',
          gatewayResponse: { mock: true, invoiceUrl: 'https://mock-invoice-url.com' } as any
        }
      }
    }
  });

  if (coupon) {
    await prisma.coupon.update({
      where: { id: coupon.id },
      data: { usedCount: { increment: 1 } }
    });
  }

  console.log('Fixed DB manually!');


  await prisma.$disconnect();
}
run();
