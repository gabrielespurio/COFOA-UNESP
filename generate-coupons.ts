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
].map(e => e.toLowerCase().trim()); // remove duplicates just in case
const uniqueEmails = [...new Set(emails)];

async function main() {
  const { prisma } = await import('./src/lib/prisma');
  console.log(`Buscando ${uniqueEmails.length} emails no banco...`);
  
  let successCount = 0;
  let notFoundCount = 0;

  for (const email of uniqueEmails) {
    const user = await prisma.user.findUnique({
      where: { email },
      include: { participant: true }
    });

    if (!user) {
      console.log(`Usuário não encontrado: ${email}`);
      notFoundCount++;
      continue;
    }

    const baseName = user.participant?.fullName 
      ? user.participant.fullName.split(' ')[0].toUpperCase() 
      : email.split('@')[0].toUpperCase().replace(/[^A-Z0-9]/g, '');
    
    // Generate code: COFOA-<NAME>-<RANDOM3>
    const randomStr = Math.random().toString(36).substring(2, 5).toUpperCase();
    const code = `COFOA-${baseName}-${randomStr}`;

    const existingCoupon = await prisma.coupon.findFirst({
      where: { userId: user.id }
    });

    if (existingCoupon) {
      console.log(`Usuário ${email} já possui cupom: ${existingCoupon.code}`);
      continue;
    }

    try {
      await prisma.coupon.create({
        data: {
          code,
          userId: user.id,
          discountValue: 10000, // 100 Reais em centavos
          discountType: 'FIXED',
          maxUses: 1
        }
      });
      console.log(`Cupom criado para ${email}: ${code}`);
      successCount++;
    } catch (err: any) {
      console.error(`Erro ao criar cupom para ${email}:`, err.message);
    }
  }

  console.log(`\nResumo:`);
  console.log(`Sucesso: ${successCount} cupons gerados.`);
  console.log(`Não encontrados: ${notFoundCount} usuários (ainda não se cadastraram).`);
  await prisma.$disconnect();
}

main().catch(console.error);
