import dotenv from 'dotenv';
dotenv.config();
import ws from 'ws';
import { neonConfig } from '@neondatabase/serverless';
neonConfig.webSocketConstructor = ws;

const emailsToCancel = [
  "br.marques@unesp.br", // Beatriz Rossignoli Marques
  "ewelin.nunes@unesp.br", // Evelin Theodoro
  "bianca.s.ribeiro@unesp.br", // Bianca Santana Ribeiro
  "anny.ribeiro@unesp.br", // Anny Caroliny Silva Ribeiro
  "Willian-batista.santos@unesp.br", // Willian Batista dos Santos
  "maria.cavichioni@unesp.br", // Maria Eduarda de Oliveira Cavichioni Gomes
  "amanda.biancheti@unesp.br", // Amanda Maria Biancheti Girotto
  "fernanda.carolliny@unesp.br", // Fernanda Carolliny Garcia da Silva
  "me.thomaz@unesp.br", // Maria Eloiza de Souza Thomaz
  "ana-beatriz.viana@unesp.br", // Ana Beatriz de Souza Viana
  "paola.v.camargo@unesp.br", // Paola Vittoria Camargo
  "beatriz.zanon@unesp.br", // Beatriz Souza Zanon
  "ryan.t.coelho@unesp.br", // Ryan Teh Coelho
  "plinio.lucas@unesp.br", // Plinio Lucas Dias
  "emanuelly.beraldo@unesp.br", // Emanuelly Beraldo
  "caio.jesus@unesp.br" // Caio Jesus de Souza
].map(e => e.toLowerCase());

async function run() {
  const { prisma } = await import('./src/lib/prisma');
  
  for (const email of emailsToCancel) {
    const user = await prisma.user.findUnique({
      where: { email },
      include: { participant: { include: { registration: true } } }
    });

    if (!user || !user.participant) {
      console.log(`[SKIPPED] User ${email} not found or no participant profile.`);
      continue;
    }

    if (!user.participant.registration) {
      console.log(`[SKIPPED] User ${email} has no registration to delete.`);
      continue;
    }

    const reg = user.participant.registration;

    // Delete registration (cascades to payment)
    await prisma.registration.delete({
      where: { id: reg.id }
    });
    console.log(`[DELETED] Registration for ${email}`);

    // Reset coupon if they used one
    if (reg.couponId) {
      await prisma.coupon.update({
        where: { id: reg.couponId },
        data: { usedCount: { decrement: 1 } }
      });
      console.log(`[RESET] Coupon used count reset for ${email}`);
    }
  }

  console.log('All requested cancellations processed!');
  
  await prisma.$disconnect();
}
run();
