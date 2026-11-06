'use client';

import React from 'react';
import { Button } from '@/components/ui/Button/Button';
import styles from './page.module.css';

interface CompanionDinnerCardProps {
  ticket: {
    id: string;
    status: string;
    companionName: string | null;
    invoiceUrl?: string | null;
    checkedInAt?: Date | null;
  } | null;
  isConfirmedParticipant: boolean;
}

export function CompanionDinnerCard({ ticket, isConfirmedParticipant }: CompanionDinnerCardProps) {
  return (
    <div className={styles.card}>
      <div className={styles.cardTitle}>Jantar Acompanhante</div>

      {ticket && ticket.status === 'PAID' ? (
        <>
          <div className={`${styles.cardValue} ${styles.statusActive}`}>
            {ticket.checkedInAt ? 'Utilizado' : 'Confirmado'}
          </div>
          <div className={styles.cardDesc}>
            {ticket.companionName ? `Acompanhante: ${ticket.companionName}` : '1 Convite de Acompanhante'}
          </div>
          <Button href="/area-participante/jantar" variant="primary" size="sm" style={{ marginTop: '1rem' }}>
            Ver QR Code do Convite
          </Button>
        </>
      ) : ticket && ticket.status === 'PENDING' ? (
        <>
          <div className={`${styles.cardValue} ${styles.statusPending}`}>
            Pendente
          </div>
          <div className={styles.cardDesc}>
            Aguardando pagamento (R$ 185,00)
          </div>
          <Button href="/area-participante/jantar" variant="primary" size="sm" style={{ marginTop: '1rem' }}>
            Efetuar Pagamento
          </Button>
        </>
      ) : (
        <>
          <div className={styles.cardValue} style={{ fontSize: '1.25rem', color: '#1B2D5B' }}>
            R$ 185,00
          </div>
          <div className={styles.cardDesc}>
            Compre o convite do jantar para seu cônjuge/acompanhante
          </div>
          <Button href="/area-participante/jantar" variant="outline" size="sm" style={{ marginTop: '1rem' }}>
            Comprar Convite
          </Button>
        </>
      )}
    </div>
  );
}
