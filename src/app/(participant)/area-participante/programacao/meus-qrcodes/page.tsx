import React from 'react';
import { SectionHeading } from '@/components/ui/SectionHeading/SectionHeading';
import { Button } from '@/components/ui/Button/Button';
import { getSession } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { redirect } from 'next/navigation';
import { QrCodeDisplay } from './QrCodeDisplay';
import styles from './page.module.css';

export const metadata = {
  title: 'Meu QR Code — COFOA XV',
};

export default async function MeuQrCodePage() {
  const session = await getSession();
  if (!session) return redirect('/login');

  const participant = await prisma.participant.findUnique({
    where: { userId: session.userId }
  });

  if (!participant) return redirect('/area-participante');

  return (
    <div className={styles.container}>
      <SectionHeading
        title="Meu QR Code"
        subtitle="Apresente este código na entrada e na saída das atividades para registrar sua presença."
      />

      <div className={styles.infoBox}>
        <span className={styles.infoIcon}>💡</span>
        <div>
          No dia do evento, abra esta página no seu celular e mostre este QR Code único para a comissão. 
          Ele serve para todas as atividades. Recomendamos tirar um print da tela para usar offline.
        </div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'flex-start', marginBottom: 'var(--space-4)' }}>
        <Button href="/area-participante/programacao" variant="outline" size="sm">
          ← Voltar para Programação
        </Button>
      </div>

      <div style={{ display: 'flex', justifyContent: 'center', margin: '2rem 0' }}>
        <div style={{ padding: '2rem', background: 'white', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-md)' }}>
           <QrCodeDisplay token={participant.id} size={250} />
           <p style={{ textAlign: 'center', marginTop: '1rem', fontWeight: 600, color: 'var(--color-text)' }}>
             {participant.fullName}
           </p>
        </div>
      </div>
    </div>
  );
}
