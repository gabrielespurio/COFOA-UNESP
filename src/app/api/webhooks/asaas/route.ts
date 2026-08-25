import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: Request) {
  try {
    // In a real production scenario, you MUST validate the Asaas Webhook Token (asaas-access-token header)
    // const asaasToken = request.headers.get('asaas-access-token');
    // if (asaasToken !== process.env.ASAAS_WEBHOOK_SECRET) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const payload = await request.json();

    // We only care about payment receipts/confirmations
    if (payload.event === 'PAYMENT_RECEIVED' || payload.event === 'PAYMENT_CONFIRMED') {
      const paymentId = payload.payment.id; // asaas payment id
      
      const payment = await prisma.payment.findFirst({
        where: { gatewayId: paymentId }
      });

      if (!payment) {
        console.error('Webhook Error: Payment not found in database for gatewayId:', paymentId);
        return NextResponse.json({ error: 'Payment not found' }, { status: 404 });
      }

      // Update payment status
      await prisma.payment.update({
        where: { id: payment.id },
        data: {
          status: 'PAID',
          paidAt: new Date(),
          method: payload.payment.billingType,
          gatewayResponse: payload.payment as any
        }
      });

      // Update registration status and save receipt url
      await prisma.registration.update({
        where: { id: payment.registrationId },
        data: { 
          status: 'CONFIRMED',
          paymentReceiptUrl: payload.payment.transactionReceiptUrl || payload.payment.invoiceUrl || null
        }
      });

      console.log(`Webhook Success: Payment ${paymentId} confirmed!`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Webhook Parsing Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
