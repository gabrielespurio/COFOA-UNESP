import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const email = searchParams.get('email');

  if (!email) return NextResponse.json({ error: 'No email' });

  const user = await prisma.user.findUnique({
    where: { email },
    include: { participant: { include: { registration: { include: { payment: true } } } } }
  });

  if (!user || !user.participant || !user.participant.registration) {
    return NextResponse.json({ error: 'No registration found' });
  }

  const regId = user.participant.registration.id;
  
  await prisma.registration.update({
    where: { id: regId },
    data: { status: 'PENDING' }
  });

  if (user.participant.registration.payment) {
    await prisma.payment.update({
      where: { id: user.participant.registration.payment.id },
      data: { status: 'PENDING' }
    });
  }

  return NextResponse.json({ success: true, message: 'Inscrição revertida para PENDENTE com sucesso!' });
}
