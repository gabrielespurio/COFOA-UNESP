import React from 'react';
import { SectionHeading } from '@/components/ui/SectionHeading/SectionHeading';
import { Button } from '@/components/ui/Button/Button';
import { getMyEnrollments } from '@/actions/lectures';
import { QrCardList } from './QrCardList';
import styles from './page.module.css';

export const metadata = {
  title: 'Meus QR Codes — COFOA XV',
};

export default async function MeusQrCodesPage() {
  const enrollments = await getMyEnrollments();

  return (
    <div className={styles.container}>
      <SectionHeading
        title="Meus QR Codes"
        subtitle="Apresente estes códigos na entrada de cada palestra para registrar sua presença."
      />

      <div className={styles.infoBox}>
        <span className={styles.infoIcon}>💡</span>
        <div>
          No dia do evento, abra esta página no seu celular e mostre o QR Code correspondente para a comissão. 
          Você também pode tirar um print da tela para usar offline.
        </div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'flex-start', marginBottom: 'var(--space-2)' }}>
        <Button href="/area-participante/programacao" variant="outline" size="sm">
          ← Voltar para Programação
        </Button>
      </div>

      {enrollments.length === 0 ? (
        <div className={styles.emptyState}>
          <div className={styles.emptyIcon}>🎫</div>
          <div className={styles.emptyTitle}>Nenhuma inscrição encontrada</div>
          <div className={styles.emptyText}>
            Você ainda não se inscreveu em nenhuma palestra.
          </div>
          <Button href="/area-participante/programacao" variant="primary">
            Ver Programação
          </Button>
        </div>
      ) : (
        <QrCardList
          enrollments={enrollments.map((e: any) => ({
            id: e.id,
            qrCodeToken: e.qrCodeToken,
            status: e.status,
            checkedInAt: e.checkedInAt ? e.checkedInAt.toISOString() : null,
            lecture: {
              title: e.lecture.title,
              speaker: e.lecture.speaker,
              location: e.lecture.location,
              startTime: e.lecture.startTime.toISOString(),
              endTime: e.lecture.endTime.toISOString(),
            }
          }))}
        />
      )}
    </div>
  );
}
