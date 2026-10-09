import 'dotenv/config';
import { prisma } from './src/lib/prisma';

async function main() {
  const names = [
    'Maria Vitória Domingos Perosso',
    'Nilton Miguel do Espírito Santo Pereira',
    'Giovanna Montilha de Flavis',
    'Louyse Vitória Oliveira Andreo',
    'Dyovana Souza Silva'
  ];

  console.log('Corrigindo os 5 usuários que geraram a inscrição antes do cupom...');

  const participants = await prisma.participant.findMany({ 
    include: { user: true, registration: { include: { coupon: true } } } 
  }); 

  const filtered = participants.filter(p => 
    names.some(n => p.fullName.toLowerCase() === n.toLowerCase())
  );

  for (const p of filtered) {
    if (!p.user) continue;

    console.log(`\nCorrigindo: ${p.fullName}`);

    // Delete pending registration so they can re-register and trigger the auto-coupon
    if (p.registration) {
      console.log(`Excluindo inscrição pendente (ID: ${p.registration.id})...`);
      await prisma.registration.delete({
        where: { id: p.registration.id }
      });
    }

    // Ensure coupon exists for this user
    const code = `DESC100-${p.fullName.split(' ')[0].toUpperCase()}`;
    
    await prisma.coupon.upsert({
      where: { code },
      update: {
        discountValue: 10000,
        active: true,
        userId: p.user.id,
        usedCount: 0
      },
      create: {
        code,
        discountType: 'FIXED',
        discountValue: 10000,
        maxUses: 1,
        active: true,
        userId: p.user.id
      }
    });

    console.log(`[OK] Inscrição resetada e Cupom ${code} garantido na conta!`);
  }

  console.log('\nFinalizado com sucesso!');
}

main().catch(console.error);
