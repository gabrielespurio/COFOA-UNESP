import React from 'react';
import { SectionHeading } from '@/components/ui/SectionHeading/SectionHeading';
import { Button } from '@/components/ui/Button/Button';
import { getLectures, getMyEnrolledLectureIds } from '@/actions/lectures';
import { LectureCard } from './LectureCard';
import styles from './page.module.css';

export const metadata = {
  title: 'Programação — COFOA XV',
};

export default async function ProgramacaoPage() {
  const [lectures, enrolledIds] = await Promise.all([
    getLectures(),
    getMyEnrolledLectureIds(),
  ]);

  const enrolledSet = new Set(enrolledIds);

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      <SectionHeading
        title="Programação do Evento"
        subtitle="Confira as palestras disponíveis e inscreva-se nas que mais combinam com a sua jornada acadêmica."
      />

      {enrolledIds.length > 0 && (
        <div className={styles.topActions}>
          <Button href="/area-participante/programacao/meus-qrcodes" variant="outline" size="sm">
            🎫 Meus QR Codes ({enrolledIds.length})
          </Button>
        </div>
      )}

      {lectures.length === 0 ? (
        <div className={styles.emptyState}>
          <div className={styles.emptyIcon}>📋</div>
          <div className={styles.emptyTitle}>Em Breve</div>
          <div className={styles.emptyText}>
            A grade científica do COFOA XV está sendo cuidadosamente preparada.<br />
            Em breve divulgaremos todos os detalhes das palestras.
          </div>
        </div>
      ) : (
        <div className={styles.lecturesGrid}>
          {lectures.map((lecture: any) => (
            <LectureCard
              key={lecture.id}
              lecture={{
                ...lecture,
                startTime: lecture.startTime.toISOString(),
                endTime: lecture.endTime.toISOString(),
              }}
              isEnrolled={enrolledSet.has(lecture.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
