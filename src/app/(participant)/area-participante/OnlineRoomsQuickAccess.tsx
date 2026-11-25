'use client';

import React, { useState, useMemo } from 'react';
import { ONLINE_ROOMS, OnlineRoom } from '@/lib/onlineRoomsData';
import styles from './OnlineRoomsQuickAccess.module.css';

interface OnlineRoomsQuickAccessProps {
  initialShift?: 'TODOS' | 'MANHÃ' | 'TARDE';
  title?: string;
  subtitle?: string;
  showFilters?: boolean;
}

export function OnlineRoomsQuickAccess({
  initialShift = 'TODOS',
  title = 'Salas Online — Apresentações de Trabalhos',
  subtitle = 'Links de acesso direto ao Google Meet, bancas avaliadoras e mediadores (25/11/2026)',
  showFilters = true
}: OnlineRoomsQuickAccessProps) {
  const [selectedShift, setSelectedShift] = useState<'TODOS' | 'MANHÃ' | 'TARDE'>(initialShift);
  const [searchQuery, setSearchQuery] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const filteredRooms = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();

    return ONLINE_ROOMS.filter((room) => {
      // Shift filter
      if (selectedShift !== 'TODOS' && room.shift !== selectedShift) {
        return false;
      }

      // Search query
      if (q) {
        const matchRoom = room.roomName.toLowerCase().includes(q);
        const matchArea = room.area.toLowerCase().includes(q);
        const matchMediator = room.mediator.toLowerCase().includes(q);
        const matchBanca = room.banca.some((b) => b.toLowerCase().includes(q));
        const matchSip = room.sip.toLowerCase().includes(q);

        return matchRoom || matchArea || matchMediator || matchBanca || matchSip;
      }

      return true;
    });
  }, [selectedShift, searchQuery]);

  const handleCopySip = (id: string, sip: string) => {
    navigator.clipboard.writeText(sip).then(() => {
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2500);
    });
  };

  const countManha = useMemo(() => ONLINE_ROOMS.filter((r) => r.shift === 'MANHÃ').length, []);
  const countTarde = useMemo(() => ONLINE_ROOMS.filter((r) => r.shift === 'TARDE').length, []);

  return (
    <section className={styles.container} id="salas-online">
      <div className={styles.header}>
        <div className={styles.titleArea}>
          <div className={styles.badgeLive}>
            <span className={styles.pulseDot} />
            Transmissão Online ao Vivo • 25/11/2026
          </div>
          <h2 className={styles.title}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: '#1a73e8' }}>
              <path d="M23 7l-7 5 7 5V7z" />
              <rect x="1" y="5" width="15" height="14" rx="2" ry="2" />
            </svg>
            {title}
          </h2>
          <p className={styles.subtitle}>{subtitle}</p>
        </div>
      </div>

      {showFilters && (
        <div className={styles.controls}>
          <div className={styles.shiftPills}>
            <button
              type="button"
              className={`${styles.shiftBtn} ${selectedShift === 'TODOS' ? styles.shiftBtnActive : ''}`}
              onClick={() => setSelectedShift('TODOS')}
            >
              Todas as Salas ({ONLINE_ROOMS.length})
            </button>
            <button
              type="button"
              className={`${styles.shiftBtn} ${selectedShift === 'MANHÃ' ? styles.shiftBtnActive : ''}`}
              onClick={() => setSelectedShift('MANHÃ')}
            >
              Manhã ({countManha})
            </button>
            <button
              type="button"
              className={`${styles.shiftBtn} ${selectedShift === 'TARDE' ? styles.shiftBtnActive : ''}`}
              onClick={() => setSelectedShift('TARDE')}
            >
              Tarde ({countTarde})
            </button>
          </div>

          <div className={styles.searchBox}>
            <svg className={styles.searchIcon} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <input
              type="text"
              placeholder="Buscar por área, sala, banca..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={styles.searchInput}
            />
          </div>
        </div>
      )}

      <div className={styles.grid}>
        {filteredRooms.length === 0 ? (
          <div className={styles.emptyState}>
            <p>Nenhuma sala encontrada para os filtros selecionados.</p>
          </div>
        ) : (
          filteredRooms.map((room) => {
            const isCopied = copiedId === room.id;

            return (
              <div key={room.id} className={styles.roomCard}>
                <div>
                  <div className={styles.cardTop}>
                    <span className={styles.roomTag}>{room.roomName}</span>
                    <span
                      className={`${styles.shiftTag} ${
                        room.shift === 'MANHÃ' ? styles.shiftManha : styles.shiftTarde
                      }`}
                    >
                      {room.shift === 'MANHÃ' ? '☀️ Manhã' : '🌤️ Tarde'} • {room.hours}
                    </span>
                  </div>

                  <h3 className={styles.areaTitle} style={{ marginTop: '0.75rem' }}>
                    {room.area}
                  </h3>

                  <div className={styles.metaInfo} style={{ marginTop: '0.75rem' }}>
                    <div className={styles.metaGroup}>
                      <span className={styles.metaLabel}>Banca Avaliadora</span>
                      <div className={styles.metaBancaList}>
                        {room.banca.map((name, i) => (
                          <span key={i} className={styles.bancaPill}>
                            {name}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className={styles.metaGroup}>
                      <span className={styles.metaLabel}>Mediador Científico</span>
                      <span className={styles.metaMediator}>{room.mediator}</span>
                    </div>
                  </div>
                </div>

                <div className={styles.cardActions}>
                  <a
                    href={room.meetUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={styles.meetBtn}
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <polygon points="23 7 16 12 23 17 23 7" fill="currentColor" />
                      <rect x="1" y="5" width="15" height="14" rx="2" ry="2" fill="currentColor" opacity="0.3" />
                    </svg>
                    Acessar Sala no Google Meet
                  </a>

                  <div className={styles.sipRow}>
                    <span className={styles.sipCode} title={room.sip}>
                      SIP: {room.sip.replace('sip:', '')}
                    </span>
                    <button
                      type="button"
                      className={styles.copyBtn}
                      onClick={() => handleCopySip(room.id, room.sip)}
                    >
                      {isCopied ? '✓ Copiado!' : 'Copiar SIP'}
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </section>
  );
}
