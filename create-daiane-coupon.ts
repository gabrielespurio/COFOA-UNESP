import 'dotenv/config';
import { prisma } from './src/lib/prisma';

async function main() {
  const user = await prisma.user.findFirst({
    where: { email: { equals: 'daiane.elem@unesp.br', mode: 'insensitive' } },
    include: { participant: true }
  });
  if (!user) return console.log('User not found');
  
  const couponCode = 'COFOA-DAIANE-100';
  const existing = await prisma.coupon.findUnique({ where: { code: couponCode } });
  if (!existing) {
    await prisma.coupon.create({
      data: {
        code: couponCode,
        description: 'Cupom de R$ 100,00 gerado para Daiane',
        discountType: 'FIXED',
        discountValue: 10000,
        maxUses: 1,
        usedCount: 0,
        active: true,
        userId: user.id
      }
    });
    console.log('Created coupon: ' + couponCode);
  } else {
    console.log('Coupon already exists: ' + couponCode);
  }
}

main().catch(console.error);
