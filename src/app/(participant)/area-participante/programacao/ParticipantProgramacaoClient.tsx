'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/Button/Button';
import { LectureCard } from './LectureCard';
import { parseLectureConfig } from '@/lib/lectureConfig';
import styles from './page.module.css';

interface LectureItem {
  id: string;
  title: string;
  description: string | null;
  speaker: string;
  location: string | null;
  startTime: string;
  endTime: string;
  _count: { enrollments: number };
}

interface ParticipantProgramacaoClientProps {
  lectures: LectureItem[];
  enrolledIds: string[];
}

export function ParticipantProgramacaoClient({
  lectures,
  enrolledIds,
}: ParticipantProgramacaoClientProps) {
  const [filterType, setFilterType] = useState<'all' | 'handson' | 'palestras'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const enrolledSet = useMemo(() => new Set(enrolledIds), [enrolledIds]);

  const filteredLectures = useMemo(() => {
    return lectures.filter((lecture) => {
      const config = parseLectureConfig(lecture);

      // Filter by tab
      if (filterType === 'handson' && !config.isHandsOn) return false;
      if (filterType === 'palestras' && config.isHandsOn) return false;

      // Filter by search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchTitle = lecture.title.toLowerCase().includes(q);
        const matchSpeaker = lecture.speaker.toLowerCase().includes(q);
        const matchLocation = lecture.location ? lecture.location.toLowerCase().includes(q) : false;
        const matchDesc = config.cleanDescription.toLowerCase().includes(q);
        return matchTitle || matchSpeaker || matchLocation || matchDesc;
      }

      return true;
    });
  }, [lectures, filterType, searchQuery]);

  const handsOnCount = useMemo(() => {
    return lectures.filter((l) => parseLectureConfig(l).isHandsOn).length;
  }, [lectures]);

  const palestrasCount = useMemo(() => {
    return lectures.filter((l) => !parseLectureConfig(l).isHandsOn).length;
  }, [lectures]);

  return (
    <div className={styles.clientContainer}>
      {/* Top Bar with Filter Tabs and QR Action */}
      <div className={styles.actionBar}>
        <div className={styles.categoryTabs}>
          <button
            type="button"
            className={`${styles.categoryTabBtn} ${filterType === 'all' ? styles.categoryTabBtnActive : ''}`}
            onClick={() => setFilterType('all')}
          >
            Todas as Atividades ({lectures.length})
          </button>
          <button
            type="button"
            className={`${styles.categoryTabBtn} ${styles.handsonTabBtn} ${
              filterType === 'handson' ? styles.categoryTabBtnActive : ''
            }`}
            onClick={() => setFilterType('handson')}
          >
            🛠️ Hands-On & Mini-Hands ({handsOnCount})
          </button>
          <button
            type="button"
            className={`${styles.categoryTabBtn} ${filterType === 'palestras' ? styles.categoryTabBtnActive : ''}`}
            onClick={() => setFilterType('palestras')}
          >
            🎓 Palestras ({palestrasCount})
          </button>
        </div>

        {enrolledIds.length > 0 && (
          <div className={styles.topActions}>
            <Button href="/area-participante/programacao/meus-qrcodes" variant="outline" size="sm">
              🎫 Meu QR Code ({enrolledIds.length} inscrita{enrolledIds.length > 1 ? 's' : ''})
            </Button>
          </div>
        )}
      </div>

      {/* Search Input */}
      <div className={styles.searchRow}>
        <input
          type="text"
          className={styles.searchInput}
          placeholder="Buscar por título, palestrante, sala ou tema..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        {searchQuery && (
          <button
            type="button"
            className={styles.clearSearchBtn}
            onClick={() => setSearchQuery('')}
          >
            ✕ Limpar
          </button>
        )}
      </div>

      {/* Hands-On Notice Banner */}
      {filterType === 'handson' && (
        <div className={styles.handsOnInfoBanner}>
          <div className={styles.bannerIcon}>⚠️</div>
          <div className={styles.bannerText}>
            <strong>Vagas estritamente limitadas a 20 participantes por atividade.</strong>
            <p>
              As inscrições para os workshops práticos (Hands-On e Mini-Hands) serão abertas em breve pela organização. As orientações completas de materiais necessários serão enviadas diretamente para o e-mail cadastrado dos congressistas inscritos.
            </p>
          </div>
        </div>
      )}

      {/* Grid of Lectures */}
      {filteredLectures.length === 0 ? (
        <div className={styles.emptyState}>
          <div className={styles.emptyIcon}>🔍</div>
          <div className={styles.emptyTitle}>Nenhuma atividade encontrada</div>
          <div className={styles.emptyText}>
            Não encontramos atividades correspondentes aos filtros selecionados.
          </div>
          <div style={{ marginTop: 'var(--space-4)' }}>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setFilterType('all');
                setSearchQuery('');
              }}
            >
              Restaurar Todos
            </Button>
          </div>
        </div>
      ) : (
        <div className={styles.lecturesGrid}>
          {filteredLectures.map((lecture) => (
            <LectureCard
              key={lecture.id}
              lecture={lecture}
              isEnrolled={enrolledSet.has(lecture.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
