import 'dotenv/config';
import { prisma } from './src/lib/prisma';

async function main() {
  const names = [
    'Nilton Miguel',
    'Dyovana Souza Silva'
  ];

  for (const q of names) {
    const p = await prisma.participant.findFirst({
      where: { fullName: { contains: q, mode: 'insensitive' } },
      include: { user: true, registration: true }
    });

    if (p && p.user) {
      if (p.registration) {
        await prisma.registration.delete({ where: { id: p.registration.id } });
      }
      const code = `DESC100-${p.fullName.split(' ')[0].toUpperCase()}`;
      await prisma.coupon.upsert({
        where: { code },
        update: { discountValue: 10000, active: true, userId: p.user.id, usedCount: 0 },
        create: { code, discountType: 'FIXED', discountValue: 10000, maxUses: 1, active: true, userId: p.user.id }
      });
      console.log(`[OK] Corrigido: ${p.fullName} - ${code}`);
    } else {
      console.log(`[ERRO] Não achou: ${q}`);
    }
  }
}
main().catch(console.error);
