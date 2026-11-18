'use client';

import { useState, useTransition } from 'react';
import { enrollInLecture } from '@/actions/lectures';
import { cn } from '@/lib/utils';
import { formatBRTDate, formatBRTTime } from '@/lib/formatDate';
import { parseLectureConfig } from '@/lib/lectureConfig';
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
  return formatBRTDate(date) + ' às ' + formatBRTTime(date, false);
}

function formatTime(dateStr: string) {
  const date = new Date(dateStr);
  return formatBRTTime(date, false);
}

export function LectureCard({ lecture, isEnrolled }: LectureCardProps) {
  const [enrolled, setEnrolled] = useState(isEnrolled);
  const [enrollCount, setEnrollCount] = useState(lecture._count.enrollments);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const config = parseLectureConfig(lecture);
  const isFull = enrollCount >= config.maxCapacity;

  const handleEnroll = () => {
    setError(null);
    startTransition(async () => {
      const result = await enrollInLecture(lecture.id);
      if ('error' in result && result.error) {
        setError(result.error);
      } else {
        setEnrolled(true);
        setEnrollCount((prev) => prev + 1);
      }
    });
  };

  const startDate = new Date(lecture.startTime);
  const endDate = new Date(lecture.endTime);
  const isSameDay = startDate.toDateString() === endDate.toDateString();

  return (
    <div
      className={cn(
        styles.lectureCard,
        config.isHandsOn && styles.lectureCardHandsOn,
        enrolled && styles.lectureCardEnrolled
      )}
    >
      <div className={styles.cardHeader}>
        <div className={styles.cardInfo}>
          <div className={styles.titleRow}>
            {config.isHandsOn && (
              <span
                className={cn(
                  styles.activityBadge,
                  config.type === 'HANDS_ON' ? styles.badgeHandsOn : styles.badgeMiniHands
                )}
              >
                {config.type === 'HANDS_ON' ? '🛠️ HANDS-ON' : '🔬 MINI-HANDS'} • {config.maxCapacity} VAGAS
              </span>
            )}
            <h3 className={styles.lectureTitle}>{lecture.title}</h3>
          </div>

          <div className={styles.lectureSpeaker}>
            <span>👨‍⚕️</span> {lecture.speaker}
          </div>

          {config.cleanDescription && (
            <div className={styles.lectureDescription}>{config.cleanDescription}</div>
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
                <strong>{lecture.location}</strong>
              </div>
            )}

            {config.isHandsOn ? (
              <div
                className={cn(
                  styles.capacityIndicator,
                  isFull ? styles.capacityFull : styles.capacityAvailable
                )}
              >
                <span className={styles.metaIcon}>👥</span>
                {config.isOpen ? (
                  isFull ? (
                    <span className={styles.soldOutText}>
                      🛑 Bloqueado ({enrollCount}/{config.maxCapacity} vagas)
                    </span>
                  ) : (
                    <span>
                      Vagas:{' '}
                      <strong>
                        {enrollCount} / {config.maxCapacity}
                      </strong>{' '}
                      preenchidas ({config.maxCapacity - enrollCount} restantes até o bloqueio)
                    </span>
                  )
                ) : (
                  <span className={styles.offlineText}>
                    Bloqueio estrito em 20 vagas • Inscrições em breve
                  </span>
                )}
              </div>
            ) : (
              <div className={styles.enrolledCount}>
                <span className={styles.metaIcon}>👥</span>
                {enrollCount} inscrito{enrollCount !== 1 ? 's' : ''}
              </div>
            )}
          </div>
        </div>

        <div className={styles.cardActions}>
          {enrolled ? (
            <span className={styles.enrolledBadge}>✓ Inscrito</span>
          ) : !config.isOpen ? (
            <button
              className={cn(styles.enrollBtn, styles.enrollBtnDisabled)}
              disabled
              title="A comissão organizadora abrirá as inscrições para esta atividade prática em breve."
            >
              🔒 Inscrições em Breve
            </button>
          ) : isFull ? (
            <button
              className={cn(styles.enrollBtn, styles.enrollBtnSoldOut)}
              disabled
              title="Inscrições bloqueadas: o limite máximo de 20 vagas foi atingido."
            >
              🔒 Bloqueado (20 Vagas)
            </button>
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

      {error && <div className={styles.errorMessage}>⚠️ {error}</div>}
    </div>
  );
}
