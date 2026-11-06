import { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { getSession } from '@/lib/auth';
import { SectionHeading } from '@/components/ui/SectionHeading/SectionHeading';
import { Button } from '@/components/ui/Button/Button';
import { getMyCompanionDinnerTicket } from '@/actions/dinner';
import { DinnerClient } from './DinnerClient';
import styles from './page.module.css';

export const metadata: Metadata = {
  title: 'Jantar Acompanhante — COFOA XV',
};

export default async function JantarPage() {
  const session = await getSession();
  if (!session) redirect('/login');

  const data = await getMyCompanionDinnerTicket();
  if (!data) redirect('/area-participante');

  return (
    <div className={styles.container}>
      <SectionHeading 
        overline="Eventos Sociais"
        title="Jantar do Congresso"
        subtitle="Gerencie o convite de acompanhante e acesse seu QR Code de entrada para o jantar oficial."
      />

      <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
        <Button href="/area-participante" variant="outline" size="sm">
          ← Voltar para o Painel
        </Button>
      </div>

      <DinnerClient 
        initialTicket={data.ticket ? {
          id: data.ticket.id,
          amount: data.ticket.amount,
          status: data.ticket.status,
          companionName: data.ticket.companionName,
          invoiceUrl: data.ticket.invoiceUrl,
          qrCodeToken: data.ticket.qrCodeToken,
          paidAt: data.ticket.paidAt,
          checkedInAt: data.ticket.checkedInAt,
        } : null}
        participantName={data.participantName}
        isParticipantConfirmed={data.isParticipantConfirmed}
      />
    </div>
  );
}
