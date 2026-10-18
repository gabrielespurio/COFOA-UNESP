import React from 'react';
import { SectionHeading } from '@/components/ui/SectionHeading/SectionHeading';
import { Button } from '@/components/ui/Button/Button';
import { getSession } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { redirect } from 'next/navigation';
import { CrachaCard } from '@/components/common/CrachaCard/CrachaCard';
import styles from './page.module.css';

export const metadata = {
  title: 'Meu QR Code — COFOA XV',
};

export default async function MeuQrCodePage() {
  const session = await getSession();
  if (!session) return redirect('/login');

  const participant = await prisma.participant.findUnique({
    where: { userId: session.userId },
    include: {
      registration: {
        include: {
          category: true,
        },
      },
    },
  });

  if (!participant) return redirect('/area-participante');

  const categoryName = participant.registration?.category?.name || 'Participante';

  return (
    <div className={styles.container}>
      <SectionHeading
        title="Meu QR Code / Crachá"
        subtitle="Apresente este código na entrada e na saída das atividades para registrar sua presença."
      />

      <div className={styles.infoBox}>
        <span className={styles.infoIcon}>💡</span>
        <div>
          No dia do evento, você pode mostrar este QR Code diretamente na tela do seu celular ou imprimir seu crachá com antecedência. Ele é único e serve para todas as atividades.
        </div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'flex-start', marginBottom: 'var(--space-4)' }}>
        <Button href="/area-participante/programacao" variant="outline" size="sm">
          ← Voltar para Programação
        </Button>
      </div>

      <div style={{ display: 'flex', justifyContent: 'center', margin: '2rem 0' }}>
        <CrachaCard 
          fullName={participant.fullName}
          categoryName={categoryName}
          institution={participant.institution}
          participantId={participant.id}
          cpf={participant.cpf}
          showPrintButton={true}
        />
      </div>
    </div>
  );
}
