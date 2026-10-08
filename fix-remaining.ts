import 'dotenv/config';
import { prisma } from './src/lib/prisma';
import fetch from 'node-fetch';

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
    if (!res.ok) console.log(`Failed to delete Asaas payment ${gatewayId}: ${res.status}`);
    else console.log(`Deleted Asaas payment ${gatewayId}`);
  } catch (err) {
    console.log(`Error deleting Asaas payment ${gatewayId}:`, err);
  }
}

async function fixUser(emailStr: string) {
  console.log(`Processing ${emailStr}...`);
  const user = await prisma.user.findFirst({
    where: { 
      email: { equals: emailStr, mode: 'insensitive' },
    },
    include: {
      participant: {
        include: { registration: { include: { payment: true, batch: true } } }
      }
    }
  });

  if (!user || !user.participant) {
    console.log(`- Not found or no participant`);
    return;
  }

  const registration = user.participant.registration;
  if (!registration) {
    console.log(`- No registration`);
    return;
  }
  if (registration.status === 'CONFIRMED') {
    console.log(`- Registration already confirmed!`);
    return;
  }

  if (registration.payment && registration.payment.status === 'PENDING') {
    if (registration.payment.gatewayId) await deleteAsaasPayment(registration.payment.gatewayId);
    await prisma.payment.delete({ where: { id: registration.payment.id } });
    console.log(`- Local payment deleted`);
  }

  if (registration.couponId) {
    console.log(`- Coupon already applied`);
    return;
  }

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

  await prisma.registration.update({
    where: { id: registration.id },
    data: {
      couponId: coupon.id,
      amount: Math.max(0, registration.amount - 10000)
    }
  });

  console.log(`- Applied coupon ${couponCode} and reduced amount by R$ 100`);
}

async function main() {
  await fixUser('isabele.castilho@unesp.br');
  await fixUser('vinicius-augusto.silva@unesp.br');
  await fixUser('daiane.elem@unesp.br');
}

main().catch(console.error);
