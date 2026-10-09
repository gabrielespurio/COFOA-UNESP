import 'dotenv/config';
import { prisma } from './src/lib/prisma';

const emails = [
  'julia.hillary@unesp.br',
  'elaine.cassimiro@unesp.br',
  'lucas.l.santana@unesp.br',
  'iasmin.c.oliveira@unesp.br',
  'richard.mendes@unesp.br',
  'maria-vitoria.perosso@unesp.br',
  'raissa.ros@unesp.br',
  'Helena.navarro@unesp.br',
  'Isabele.castilho@unesp.br',
  'thiany.neves@unesp.br',
  'leticia.ms.pereira@unesp.br',
  'giovanna.flavis@unesp.br',
  'plinio.lucas@unesp.br',
  'cd.batista@unesp.br',
  'mirella.luz@unesp.br',
  'vinicius-augusto.silva@unesp.br',
  'maria.gil@unesp.br',
  'lais.s.lopes@unesp.br',
  'joao.cavalcante-oliveira@unesp.br',
  'Dyovana.s.silva@unesp.br',
  'miguel.pereira@unesp.br',
  'Mj.filenga@unesp.br',
  'ana.laura2004@unesp.br',
  'louyse.andreo@unesp.br',
  'nicoly.basilio@unesp.br',
  'marissa.timpurim@unesp.br'
].map(e => e.toLowerCase().trim());

async function main() {
  console.log(`Iniciando processamento para ${emails.length} emails...`);

  // 1. Create a global coupon for these users or individual coupons.
  // We will create individual coupons named COFOA-[FIRSTNAME] for safety
  
  for (const email of emails) {
    const user = await prisma.user.findUnique({
      where: { email },
      include: { participant: { include: { registration: true } } }
    });

    if (!user) {
      console.log(`Usuário não encontrado: ${email}`);
      continue;
    }

    if (user.participant?.registration) {
      console.log(`Deletando inscrição de ${email}...`);
      await prisma.registration.delete({
        where: { id: user.participant.registration.id }
      });
    }

    const firstName = user.participant?.fullName 
      ? user.participant.fullName.split(' ')[0].toUpperCase()
      : email.split('@')[0].toUpperCase().replace(/[^A-Z]/g, '');
    
    // We append a random suffix to avoid duplicates for people with same first name
    const code = `DESC100-${firstName}`;

    await prisma.coupon.upsert({
      where: { code },
      update: {
        discountValue: 10000,
        active: true,
        userId: user.id,
        usedCount: 0
      },
      create: {
        code,
        discountType: 'FIXED',
        discountValue: 10000, // R$ 100,00
        maxUses: 1,
        active: true,
        userId: user.id
      }
    });

    console.log(`[OK] ${email} -> Cupom gerado: ${code}`);
  }
  
  // also update Marissa's old coupon just in case she tries to use the old one
  await prisma.coupon.updateMany({
    where: { code: 'COFOA-MARISSA' },
    data: { discountValue: 10000 }
  });

  console.log('Finalizado!');
}

main().catch(console.error);
