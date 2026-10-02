'use client';

import { useState, useTransition } from 'react';
import { enrollInLecture } from '@/actions/lectures';
import { cn } from '@/lib/utils';
import styles from './page.module.css';

interface LectureData {
  id: string;
  title: string;
  description: string | null;
  speaker: string;
  location: string | null;
  startTime: string;
  endTime: string;
  _count: { enrollments: number };
}

interface LectureCardProps {
  lecture: LectureData;
  isEnrolled: boolean;
}

function formatDateTime(dateStr: string) {
  const date = new Date(dateStr);
  return date.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }) + ' às ' + date.toLocaleTimeString('pt-BR', {
    hour: '2-digit',
    minute: '2-digit',
  });
}

function formatTime(dateStr: string) {
  const date = new Date(dateStr);
  return date.toLocaleTimeString('pt-BR', {
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function LectureCard({ lecture, isEnrolled }: LectureCardProps) {
  const [enrolled, setEnrolled] = useState(isEnrolled);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const handleEnroll = () => {
    setError(null);
    startTransition(async () => {
      const result = await enrollInLecture(lecture.id);
      if (result.error) {
        setError(result.error);
      } else {
        setEnrolled(true);
      }
    });
  };

  const startDate = new Date(lecture.startTime);
  const endDate = new Date(lecture.endTime);
  const isSameDay = startDate.toDateString() === endDate.toDateString();

  return (
    <div className={cn(styles.lectureCard, enrolled && styles.lectureCardEnrolled)}>
      <div className={styles.cardHeader}>
        <div className={styles.cardInfo}>
          <div className={styles.lectureTitle}>{lecture.title}</div>
          <div className={styles.lectureSpeaker}>
            <span>🎤</span> {lecture.speaker}
          </div>
          {lecture.description && (
            <div className={styles.lectureDescription}>{lecture.description}</div>
          )}
          <div className={styles.metaRow}>
            <div className={styles.metaItem}>
              <span className={styles.metaIcon}>📅</span>
              {formatDateTime(lecture.startTime)}
              {isSameDay && ` - ${formatTime(lecture.endTime)}`}
            </div>
            {lecture.location && (
              <div className={styles.metaItem}>
                <span className={styles.metaIcon}>📍</span>
                {lecture.location}
              </div>
            )}
            <div className={styles.enrolledCount}>
              <span className={styles.metaIcon}>👥</span>
              {lecture._count.enrollments} inscrito{lecture._count.enrollments !== 1 ? 's' : ''}
            </div>
          </div>
        </div>

        <div className={styles.cardActions}>
          {enrolled ? (
            <span className={styles.enrolledBadge}>
              ✓ Inscrito
            </span>
          ) : (
            <button
              className={cn(styles.enrollBtn, styles.enrollBtnPrimary)}
              onClick={handleEnroll}
              disabled={isPending}
            >
              {isPending ? 'Inscrevendo...' : 'Inscrever-se'}
            </button>
          )}
        </div>
      </div>

      {error && (
        <div style={{ color: 'var(--color-error)', fontSize: 'var(--text-sm)', marginTop: 'var(--space-2)' }}>
          {error}
        </div>
      )}
    </div>
  );
}
