import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const email = searchParams.get('email');

  if (!email) return NextResponse.json({ error: 'No email' });

  const user = await prisma.user.findUnique({
    where: { email },
    include: { participant: { include: { registration: true } } }
  });

  if (!user || !user.participant || !user.participant.registration) {
    return NextResponse.json({ error: 'No registration found' });
  }

  await prisma.registration.delete({
    where: { id: user.participant.registration.id }
  });

  return NextResponse.json({ success: true, deletedId: user.participant.registration.id });
}
