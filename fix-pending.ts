import 'dotenv/config';
import { prisma } from './src/lib/prisma';

async function main() {
  const names = [
    'Nicoly Cordeiro',
    'Ana Laura Gavaldão'
  ];

  for (const q of names) {
    const p = await prisma.participant.findFirst({
      where: { fullName: { contains: q, mode: 'insensitive' } },
      include: { user: true }
    });

    if (p && p.user) {
      const code = `DESC100-${p.fullName.split(' ')[0].toUpperCase()}`;
      await prisma.coupon.upsert({
        where: { code },
        update: { discountValue: 10000, active: true, userId: p.user.id, usedCount: 0 },
        create: { code, discountType: 'FIXED', discountValue: 10000, maxUses: 1, active: true, userId: p.user.id }
      });
      console.log(`[OK] Cupom garantido para: ${p.fullName} - ${code}`);
    } else {
      console.log(`[ERRO] Não achou: ${q}`);
    }
  }
}
main().catch(console.error);
