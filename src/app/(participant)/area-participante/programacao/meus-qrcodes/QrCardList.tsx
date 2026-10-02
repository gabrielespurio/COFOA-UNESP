'use client';

import { useState, useTransition } from 'react';
import { cancelLectureEnrollment } from '@/actions/lectures';
import { QrCodeDisplay } from './QrCodeDisplay';
import { cn } from '@/lib/utils';
import styles from './page.module.css';

interface EnrollmentData {
  id: string;
  qrCodeToken: string;
  status: string;
  checkedInAt: string | null;
  lecture: {
    title: string;
    speaker: string;
    location: string | null;
    startTime: string;
    endTime: string;
  };
}

function formatDateTime(dateStr: string) {
  const date = new Date(dateStr);
  return date.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
  }) + ' às ' + date.toLocaleTimeString('pt-BR', {
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function QrCardList({ enrollments }: { enrollments: EnrollmentData[] }) {
  return (
    <div className={styles.qrGrid}>
      {enrollments.map((enrollment) => (
        <QrCard key={enrollment.id} enrollment={enrollment} />
      ))}
    </div>
  );
}

function QrCard({ enrollment }: { enrollment: EnrollmentData }) {
  const [cancelled, setCancelled] = useState(false);
  const [isPending, startTransition] = useTransition();

  const handleCancel = () => {
    if (!confirm('Tem certeza que deseja cancelar sua inscrição nesta palestra?')) return;
    startTransition(async () => {
      const result = await cancelLectureEnrollment(enrollment.id);
      if (result.success) {
        setCancelled(true);
      }
    });
  };

  if (cancelled) return null;

  const isAttended = enrollment.status === 'ATTENDED';

  return (
    <div className={cn(styles.qrCard, isAttended && styles.qrCardAttended)}>
      <div className={styles.qrCardInfo}>
        <div className={styles.qrLectureTitle}>{enrollment.lecture.title}</div>
        <div className={styles.qrSpeaker}>🎤 {enrollment.lecture.speaker}</div>
        <div className={styles.qrMeta}>
          <span>📅 {formatDateTime(enrollment.lecture.startTime)}</span>
          {enrollment.lecture.location && <span>📍 {enrollment.lecture.location}</span>}
        </div>
      </div>

      <div className={styles.qrCodeWrapper}>
        <QrCodeDisplay token={enrollment.qrCodeToken} size={180} />
      </div>

      <span className={cn(styles.statusBadge, isAttended ? styles.statusAttended : styles.statusEnrolled)}>
        {isAttended ? '✓ Presença Registrada' : '🎫 Inscrito'}
      </span>

      {isAttended && enrollment.checkedInAt && (
        <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)' }}>
          Check-in: {new Date(enrollment.checkedInAt).toLocaleString('pt-BR')}
        </span>
      )}

      {!isAttended && (
        <button
          className={styles.cancelBtn}
          onClick={handleCancel}
          disabled={isPending}
        >
          {isPending ? 'Cancelando...' : 'Cancelar inscrição'}
        </button>
      )}
    </div>
  );
}
