import { Metadata } from 'next';
import { SectionHeading } from '@/components/ui/SectionHeading/SectionHeading';
import { prisma } from '@/lib/prisma';
import { ParticipantesTable } from './ParticipantesTable';

export const metadata: Metadata = {
  title: 'Participantes | Admin',
};

export default async function AdminParticipantesPage() {
  const participants = await prisma.participant.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
      user: { select: { email: true, role: true } },
      registration: { select: { status: true, paymentReceiptUrl: true } }
    }
  });

  return (
    <div>
      <SectionHeading title="Participantes" subtitle="Lista de todos os usuários cadastrados no sistema." />
      <ParticipantesTable participants={participants} />
    </div>
  );
}
