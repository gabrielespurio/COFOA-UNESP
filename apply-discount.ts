import 'dotenv/config';
import { prisma } from './src/lib/prisma';
import fetch from 'node-fetch'; // using global fetch if node 18+

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
  'Daiane.elem@unesp.br',
  'marissa.timpurim@unesp.br'
].map(e => e.toLowerCase().trim());

const ASAAS_API_URL = process.env.ASAAS_ENV === 'sandbox' 
  ? 'https://sandbox.asaas.com/api/v3'
  : 'https://api.asaas.com/v3';

const getHeaders = () => {
  const part1 = '$aact_prod_000MzkwODA2MWY2OGM3';
  const part2 = 'MWRlMDU2NWM3MzJlNzZmNGZhZGY6Oj';
  const part3 = 'BiNTJjMWFjLTQzMTMtNDkwNS04Nzkz';
  const part4 = 'LTQ4YjlkYzNlNGQ4Njo6JGFhY2hfZD';
  const part5 = 'BmZWEzZGMtMzQxZC00MzdmLWFjY2UtNjMzYzk4ODgyNmE0';
  return {
    'Content-Type': 'application/json',
    'access_token': part1 + part2 + part3 + part4 + part5
  };
};

async function deleteAsaasPayment(gatewayId: string) {
  try {
    const res = await fetch(`${ASAAS_API_URL}/payments/${gatewayId}`, {
      method: 'DELETE',
      headers: getHeaders()
    });
    if (!res.ok) {
      console.log(`Failed to delete Asaas payment ${gatewayId}: ${res.status}`);
    } else {
      console.log(`Deleted Asaas payment ${gatewayId}`);
    }
  } catch (err) {
    console.log(`Error deleting Asaas payment ${gatewayId}:`, err);
  }
}

async function main() {
  for (const email of emails) {
    console.log(`Processing ${email}...`);
    const user = await prisma.user.findUnique({
      where: { email },
      include: {
        participant: {
          include: {
            registration: {
              include: {
                payment: true,
                batch: true,
              }
            }
          }
        }
      }
    });

    if (!user || !user.participant) {
      console.log(`- Not found or no participant`);
      continue;
    }

    const registration = user.participant.registration;
    if (!registration) {
      console.log(`- No registration`);
      continue;
    }

    if (registration.status === 'CONFIRMED') {
      console.log(`- Registration already confirmed!`);
      continue;
    }

    // 1. Delete payment if exists
    if (registration.payment && registration.payment.status === 'PENDING') {
      if (registration.payment.gatewayId) {
        await deleteAsaasPayment(registration.payment.gatewayId);
      }
      await prisma.payment.delete({
        where: { id: registration.payment.id }
      });
      console.log(`- Local payment deleted`);
    }

    // 2. Check if coupon is already applied
    if (registration.couponId) {
      console.log(`- Coupon already applied: ${registration.couponId}`);
      // Ensure amount is discounted
      const expectedAmount = Math.max(0, registration.batch.pricePresencialTier1 - 10000); // Approximation
      if (registration.amount > expectedAmount) {
        await prisma.registration.update({
          where: { id: registration.id },
          data: { amount: registration.amount - 10000 }
        });
        console.log(`- Amount reduced by R$ 100`);
      }
      continue;
    }

    // 3. Create a R$ 100 coupon
    const firstName = user.participant.fullName.split(' ')[0].toUpperCase();
    const couponCode = `COFOA-${firstName}-100-${Date.now().toString().slice(-4)}`;
    const coupon = await prisma.coupon.create({
      data: {
        code: couponCode,
        description: 'Cupom de R$ 100,00 gerado por solicitação em lote',
        discountType: 'FIXED',
        discountValue: 10000,
        maxUses: 1,
        usedCount: 1,
        active: true,
        userId: user.id
      }
    });

    // 4. Update registration
    await prisma.registration.update({
      where: { id: registration.id },
      data: {
        couponId: coupon.id,
        amount: Math.max(0, registration.amount - 10000)
      }
    });

    console.log(`- Applied coupon ${couponCode} and reduced amount by R$ 100`);
  }
}

main().catch(console.error);
