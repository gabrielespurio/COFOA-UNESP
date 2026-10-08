import dotenv from 'dotenv';
dotenv.config();
import ws from 'ws';
import { neonConfig } from '@neondatabase/serverless';
neonConfig.webSocketConstructor = ws;

const emails = [
  "amanda.biancheti@unesp.br",
  "ana.caboclo@unesp.br",
  "ana-beatriz.viana@unesp.br",
  "helena.navarro@unesp.br",
  "ana.la.costa@unesp.br",
  "ana.laura2004@unesp.br",
  "anny.ribeiro@unesp.br",
  "beatriz.laguna@unesp.br",
  "Beatriz-Ramos.alves@unesp.br",
  "br.marques@unesp.br",
  "beatriz.zanon@unesp.br",
  "betina.manzato@unesp.br",
  "bianca.chiarioni@unesp.br",
  "bianca.s.ribeiro@unesp.br",
  "caio.jesus@unesp.br",
  "cd.batista@unesp.br",
  "caroline.hs.oliveira@unesp.br",
  "cristiano.gama@unesp.br",
  "d.fagundes@unesp.br",
  "Dyovana.s.silva@unesp.br",
  "edilaine.a.silva@unesp.br",
  "e.berti@unesp.br",
  "elaine.cassimiro@unesp.br",
  "emanuelly.beraldo@unesp.br",
  "ewelin.nunes@unesp.br",
  "fernanda.carolliny@unesp.br",
  "gabriel.hm.ramos@unesp.br",
  "gabriel.serafim@unesp.br",
  "gabriela.fg.silva@unesp.br",
  "gabriela.queiroz@unesp.br",
  "Giovana.baranek@unesp.br",
  "giovanna.flavis@unesp.br",
  "guilherme.isaac@unesp.br",
  "iasmin.c.oliveira@unesp.br",
  "isabele.castilho@unesp.br",
  "isabella.cairin@unesp.br",
  "Jennifer.domene@unesp.br",
  "joao.cavalcante-oliveira@unesp.br",
  "j.narciso@unesp.br",
  "julia.hillary@unesp.br",
  "kaio.buchanelli@unesp.br",
  "keisy.argerino@unesp.br",
  "keisy.argerino@unesp.br",
  "lais.s.lopes@unesp.br",
  "li.oliveira@unesp.br",
  "lara.c.prado@unesp.br",
  "lauana.sarti@unesp.br",
  "leticia.andrade-rocha@unesp.br",
  "leticia.ms.pereira@unesp.br",
  "livia.vv.silva@unesp.br",
  "louyse.andreo@unesp.br",
  "lucas.l.santana@unesp.br",
  "lucas.gregui@unesp.br",
  "marcela.f.caprio@unesp.br",
  "alice.ferreira@unesp.br",
  "maria.duca@unesp.br",
  "maria.cavichioni@unesp.br",
  "dias.leonezi@unesp.br",
  "maria.gil@unesp.br",
  "me.thomaz@unesp.br",
  "mj.filenga@unesp.br",
  "maria.maltezo@unesp.br",
  "mariana.e@unesp.br",
  "mirella.luz@unesp.br",
  "m.vargas@unesp.br",
  "nicole.bq.oliveira@unesp.br",
  "Nicoly.basilio@unesp.br",
  "miguel.pereira@unesp.br",
  "paola.v.camargo@unesp.br",
  "pietra.botelho@unesp.br",
  "plinio.lucas@unesp.br",
  "raissa.ros@unesp.br",
  "richard.mendes@unesp.br",
  "ryan.t.coelho@unesp.br",
  "marquesi.santos@unesp.br",
  "tamiris.ferreira@unesp.br",
  "thiany.neves@unesp.br",
  "valentina.alencar@unesp.br",
  "vinicius-augusto.silva@unesp.br",
  "vinicius.ramos-alves@unesp.br",
  "Willian-batista.santos@unesp.br"
].map(e => e.toLowerCase().trim());
const uniqueEmails = [...new Set(emails)];

async function run() {
  const { prisma } = await import('./src/lib/prisma');
  
  let validCoupons = 0;
  let missingAccounts: string[] = [];
  let missingCoupons = 0;

  for (const email of uniqueEmails) {
    const user = await prisma.user.findUnique({
      where: { email }
    });

    if (!user) {
      missingAccounts.push(email);
      continue;
    }

    const coupon = await prisma.coupon.findFirst({
      where: { userId: user.id }
    });

    if (coupon) {
      if (coupon.discountValue === 10000 && coupon.maxUses === 1 && coupon.active === true) {
        validCoupons++;
      }
    } else {
      missingCoupons++;
    }
  }

  console.log(`\nResults:`);
  console.log(`Valid Coupons: ${validCoupons}`);
  console.log(`Users missing accounts (${missingAccounts.length}):`);
  missingAccounts.forEach(email => console.log(`- ${email}`));
  console.log(`Users with accounts but NO coupon: ${missingCoupons}`);
  
  await prisma.$disconnect();
}
run();
