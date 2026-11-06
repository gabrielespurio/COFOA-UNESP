import { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { getSession } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { SectionHeading } from '@/components/ui/SectionHeading/SectionHeading';
import { getDinnerGuestList } from '@/actions/dinner';
import { DinnerScannerClient } from './DinnerScannerClient';

export const metadata: Metadata = {
  title: 'Jantar Acompanhantes — Comissão COFOA XV',
};

export default async function ComissaoJantarPage() {
  const session = await getSession();
  if (!session) redirect('/login');

  const user = await prisma.user.findUnique({ where: { id: session.userId } });
  if (!user?.roles.some((r) => r === 'COMMITTEE' || r === 'ADMIN')) {
    redirect('/area-participante');
  }

  const { tickets, stats } = await getDinnerGuestList();

  return (
    <div>
      <SectionHeading
        overline="Secretaria e Portaria"
        title="Jantar de Confraternização — Acompanhantes"
        subtitle="Valide convites de uso único na portaria do evento e acompanhe a lista de convidados em tempo real."
        alignment="left"
      />

      <div style={{ marginTop: '1.5rem' }}>
        <DinnerScannerClient
          initialTickets={tickets as any}
          stats={stats}
        />
      </div>
    </div>
  );
}
