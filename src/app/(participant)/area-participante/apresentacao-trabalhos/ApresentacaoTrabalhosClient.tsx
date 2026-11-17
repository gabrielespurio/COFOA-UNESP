'use client';

import React, { useState, useMemo } from 'react';
import { Badge } from '@/components/ui/Badge/Badge';
import { Button } from '@/components/ui/Button/Button';
import {
  PRESENTATION_SCHEDULE,
  PresentationItem,
} from '@/lib/presentationsData';
import styles from './page.module.css';

export function ApresentacaoTrabalhosClient() {
  const [selectedDayKey, setSelectedDayKey] = useState<string>('2026-11-25');
  const [selectedShift, setSelectedShift] = useState<'TODOS' | 'MANHÃ' | 'TARDE'>('TODOS');
  const [selectedArea, setSelectedArea] = useState<string>('TODAS');
  const [selectedRoom, setSelectedRoom] = useState<string>('TODAS');
  const [selectedCategory, setSelectedCategory] = useState<string>('TODAS');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [viewMode, setViewMode] = useState<'grouped' | 'table'>('grouped');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Active day schedule
  const activeDay = useMemo(() => {
    return PRESENTATION_SCHEDULE.find((d) => d.key === selectedDayKey) || PRESENTATION_SCHEDULE[0];
  }, [selectedDayKey]);

  // List of unique areas in the active day
  const availableAreas = useMemo(() => {
    const set = new Set<string>();
    activeDay.presentations.forEach((p) => set.add(p.area));
    return Array.from(set).sort();
  }, [activeDay]);

  // List of unique rooms in the active day
  const availableRooms = useMemo(() => {
    const set = new Set<string>();
    activeDay.presentations.forEach((p) => set.add(p.room));
    return Array.from(set).sort((a, b) => {
      const numA = parseInt(a.replace(/\D/g, ''), 10) || 0;
      const numB = parseInt(b.replace(/\D/g, ''), 10) || 0;
      return numA - numB;
    });
  }, [activeDay]);

  // Turno counts
  const shiftCounts = useMemo(() => {
    let manha = 0;
    let tarde = 0;
    activeDay.presentations.forEach((p) => {
      if (p.shift === 'MANHÃ') manha++;
      if (p.shift === 'TARDE') tarde++;
    });
    return {
      TODOS: activeDay.presentations.length,
      MANHÃ: manha,
      TARDE: tarde,
    };
  }, [activeDay]);

  // Filtered presentations
  const filteredPresentations = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();

    return activeDay.presentations.filter((item) => {
      // Shift filter
      if (selectedShift !== 'TODOS' && item.shift !== selectedShift) {
        return false;
      }
      // Area filter
      if (selectedArea !== 'TODAS' && item.area !== selectedArea) {
        return false;
      }
      // Room filter
      if (selectedRoom !== 'TODAS' && item.room !== selectedRoom) {
        return false;
      }
      // Category filter
      if (selectedCategory !== 'TODAS' && item.category !== selectedCategory) {
        return false;
      }
      // Search query
      if (q) {
        const matchTitle = item.title.toLowerCase().includes(q);
        const matchAuthors = item.authors.toLowerCase().includes(q);
        const matchPresenter = item.presenter?.toLowerCase().includes(q) || false;
        const matchArea = item.area.toLowerCase().includes(q);
        const matchRoom = item.room.toLowerCase().includes(q) || item.roomFullName.toLowerCase().includes(q);
        if (!matchTitle && !matchAuthors && !matchPresenter && !matchArea && !matchRoom) {
          return false;
        }
      }

      return true;
    });
  }, [
    activeDay,
    selectedShift,
    selectedArea,
    selectedRoom,
    selectedCategory,
    searchQuery,
  ]);

  // Group presentations by Room + Shift
  const groupedRooms = useMemo(() => {
    interface RoomGroup {
      roomKey: string;
      room: string;
      roomFullName: string;
      area: string;
      category: string;
      shift: 'MANHÃ' | 'TARDE';
      presentations: PresentationItem[];
    }

    const groupsMap = new Map<string, RoomGroup>();

    filteredPresentations.forEach((item) => {
      const groupKey = `${item.shift}-${item.room}-${item.area}`;
      if (!groupsMap.has(groupKey)) {
        groupsMap.set(groupKey, {
          roomKey: groupKey,
          room: item.room,
          roomFullName: item.roomFullName,
          area: item.area,
          category: item.category,
          shift: item.shift,
          presentations: [],
        });
      }
      groupsMap.get(groupKey)!.presentations.push(item);
    });

    return Array.from(groupsMap.values());
  }, [filteredPresentations]);

  const hasActiveFilters =
    selectedShift !== 'TODOS' ||
    selectedArea !== 'TODAS' ||
    selectedRoom !== 'TODAS' ||
    selectedCategory !== 'TODAS' ||
    searchQuery !== '';

  const handleResetFilters = () => {
    setSelectedShift('TODOS');
    setSelectedArea('TODAS');
    setSelectedRoom('TODAS');
    setSelectedCategory('TODAS');
    setSearchQuery('');
  };

  const handleCopyTitle = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => {
      setCopiedId(null);
    }, 2000);
  };

  return (
    <div className={styles.container}>
      {/* Banner de Orientações */}
      <div className={styles.infoBanner}>
        <div className={styles.infoBannerIcon}>💻</div>
        <div className={styles.infoBannerText}>
          <strong>Atenção:</strong> As apresentações do dia <strong>25/11</strong> são realizadas de forma <strong>100% ONLINE</strong> nas salas virtuais. Conecte-se com pelo menos 10 minutos de antecedência ao horário previsto do seu trabalho.
        </div>
      </div>

      {/* Seletor de Datas (Tabs) */}
      <div className={styles.dayTabsWrapper}>
        <div className={styles.dayTabs}>
          {PRESENTATION_SCHEDULE.map((day) => {
            const isActive = day.key === selectedDayKey;
            return (
              <button
                key={day.key}
                type="button"
                className={`${styles.dayTabBtn} ${isActive ? styles.dayTabActive : ''} ${
                  !day.isAvailable ? styles.dayTabDisabled : ''
                }`}
                onClick={() => {
                  setSelectedDayKey(day.key);
                  handleResetFilters();
                }}
              >
                <div className={styles.dayTabTitle}>
                  {day.dateStr}
                  <span className={styles.dayTabBadge}>
                    {day.format === 'Online' ? '🌐 Online' : '🏛️ Totens Presenciais'}
                  </span>
                </div>
                <div className={styles.dayTabSubtitle}>
                  {day.dayOfWeek} {day.isAvailable ? `• ${day.presentations.length} apresentações` : '• Em breve'}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Se o dia não estiver disponível (ex: dias futuros presenciais) */}
      {!activeDay.isAvailable ? (
        <div className={styles.emptyState}>
          <div className={styles.emptyIcon}>⏳</div>
          <div className={styles.emptyTitle}>Grade em Preparação</div>
          <div className={styles.emptyText}>
            {activeDay.notes || 'A programação de totens e horários para este dia será divulgada em breve pela comissão organizadora.'}
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setSelectedDayKey('2026-11-25')}
          >
            ← Voltar para as apresentações de 25/11
          </Button>
        </div>
      ) : (
        <>
          {/* Seção de Controles e Filtros */}
          <div className={styles.controlsSection}>
            {/* Campo de Busca Rápida */}
            <div className={styles.searchBar}>
              <span className={styles.searchIcon}>🔍</span>
              <input
                type="text"
                className={styles.searchInput}
                placeholder="Pesquisar por título, autor, apresentador, sala ou área temática..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              {searchQuery && (
                <button
                  type="button"
                  className={styles.clearSearchBtn}
                  onClick={() => setSearchQuery('')}
                  title="Limpar busca"
                >
                  ✕
                </button>
              )}
            </div>

            {/* Filtro de Turno */}
            <div className={styles.shiftRow}>
              <span className={styles.filterSectionLabel}>Turno:</span>
              <div className={styles.shiftPills}>
                {(['TODOS', 'MANHÃ', 'TARDE'] as const).map((shift) => (
                  <button
                    key={shift}
                    type="button"
                    className={`${styles.shiftPill} ${
                      selectedShift === shift ? styles.shiftPillActive : ''
                    }`}
                    onClick={() => setSelectedShift(shift)}
                  >
                    {shift === 'TODOS' ? 'Todos os turnos' : shift === 'MANHÃ' ? '☀️ Manhã' : '🌙 Tarde'}
                    <span className={styles.shiftCount}>{shiftCounts[shift]}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Grid de Dropdowns (Área, Sala, Nível) */}
            <div className={styles.dropdownGrid}>
              {/* Filtro de Área */}
              <div className={styles.selectWrapper}>
                <label htmlFor="areaSelect" className={styles.selectLabel}>Área Temática:</label>
                <select
                  id="areaSelect"
                  className={styles.customSelect}
                  value={selectedArea}
                  onChange={(e) => setSelectedArea(e.target.value)}
                >
                  <option value="TODAS">Todas as Áreas ({availableAreas.length})</option>
                  {availableAreas.map((area) => (
                    <option key={area} value={area}>
                      {area}
                    </option>
                  ))}
                </select>
              </div>

              {/* Filtro de Sala / Totem */}
              <div className={styles.selectWrapper}>
                <label htmlFor="roomSelect" className={styles.selectLabel}>Sala / Totem:</label>
                <select
                  id="roomSelect"
                  className={styles.customSelect}
                  value={selectedRoom}
                  onChange={(e) => setSelectedRoom(e.target.value)}
                >
                  <option value="TODAS">Todas as Salas ({availableRooms.length})</option>
                  {availableRooms.map((room) => (
                    <option key={room} value={room}>
                      {room}
                    </option>
                  ))}
                </select>
              </div>

              {/* Filtro de Nível */}
              <div className={styles.selectWrapper}>
                <label htmlFor="catSelect" className={styles.selectLabel}>Nível Acadêmico:</label>
                <select
                  id="catSelect"
                  className={styles.customSelect}
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                >
                  <option value="TODAS">Todos os Níveis</option>
                  <option value="Graduação">Graduação</option>
                  <option value="Pós-Graduação">Pós-Graduação</option>
                  <option value="Graduação e Pós-Graduação">Graduação e Pós-Graduação</option>
                </select>
              </div>
            </div>

            {/* Sub-controles: Contador de resultados + Alternador de Visualização */}
            <div className={styles.subControls}>
              <div className={styles.resultsCount}>
                Exibindo <strong>{filteredPresentations.length}</strong> de <strong>{activeDay.presentations.length}</strong> apresentações
                {hasActiveFilters && (
                  <button
                    type="button"
                    className={styles.resetBtn}
                    onClick={handleResetFilters}
                  >
                    Limpar filtros
                  </button>
                )}
              </div>

              <div className={styles.viewSwitchers}>
                <button
                  type="button"
                  className={`${styles.viewBtn} ${viewMode === 'grouped' ? styles.viewBtnActive : ''}`}
                  onClick={() => setViewMode('grouped')}
                  title="Visualizar agrupado por Sala e Totem"
                >
                  🗂️ Por Sala / Totem
                </button>
                <button
                  type="button"
                  className={`${styles.viewBtn} ${viewMode === 'table' ? styles.viewBtnActive : ''}`}
                  onClick={() => setViewMode('table')}
                  title="Visualizar em formato de Tabela / Lista"
                >
                  📋 Tabela Completa
                </button>
              </div>
            </div>
          </div>

          {/* Nenhum resultado encontrado */}
          {filteredPresentations.length === 0 ? (
            <div className={styles.emptyState}>
              <div className={styles.emptyIcon}>🔍</div>
              <div className={styles.emptyTitle}>Nenhuma apresentação encontrada</div>
              <div className={styles.emptyText}>
                Não encontramos nenhum trabalho correspondente aos filtros ou termos pesquisados.
              </div>
              <Button variant="outline" size="sm" onClick={handleResetFilters}>
                Redefinir Filtros
              </Button>
            </div>
          ) : viewMode === 'grouped' ? (
            /* Visualização Agrupada por Sala / Totem */
            <div className={styles.roomGroupSection}>
              {groupedRooms.map((group) => (
                <div key={group.roomKey} className={styles.roomCard}>
                  {/* Cabeçalho da Sala */}
                  <div className={styles.roomHeader}>
                    <div className={styles.roomTitleGroup}>
                      <span className={styles.roomNumberBadge}>{group.room}</span>
                      <h3 className={styles.roomTitle}>{group.area}</h3>
                    </div>
                    <div className={styles.roomMetaBadges}>
                      <span className={styles.roomShiftBadge}>
                        {group.shift === 'MANHÃ' ? '☀️ Manhã' : '🌙 Tarde'}
                      </span>
                      <span className={styles.roomCategoryBadge}>
                        {group.category}
                      </span>
                      <span className={styles.roomPresentationCount}>
                        ({group.presentations.length} {group.presentations.length === 1 ? 'trabalho' : 'trabalhos'})
                      </span>
                    </div>
                  </div>

                  {/* Lista de Apresentações da Sala */}
                  <div className={styles.roomPresentationsList}>
                    {group.presentations.map((item) => (
                      <div key={item.id} className={styles.presentationItem}>
                        <div className={styles.itemHeader}>
                          <span className={styles.timeBadge}>
                            ⏰ {item.time}
                          </span>
                          <div className={styles.itemBadges}>
                            <Badge variant="outline" size="sm">
                              {item.room}
                            </Badge>
                            <Badge variant="gold" size="sm">
                              {item.category}
                            </Badge>
                          </div>
                        </div>

                        <h4 className={styles.itemTitle}>{item.title}</h4>

                        <div className={styles.itemAuthors}>
                          <strong>Autores:</strong> {item.authors}
                        </div>

                        {item.presenter && (
                          <div>
                            <span className={styles.presenterTag}>
                              👤 Apresentador(a): <strong>{item.presenter}</strong>
                            </span>
                          </div>
                        )}

                        <div className={styles.itemFooter}>
                          <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)' }}>
                            Modalidade: Online
                          </span>
                          <button
                            type="button"
                            className={styles.copyBtn}
                            onClick={() => handleCopyTitle(item.id, item.title)}
                          >
                            {copiedId === item.id ? '✓ Título copiado!' : 'Copiar título'}
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            /* Visualização em Formato Tabela */
            <div className={styles.tableContainer}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>Horário</th>
                    <th>Sala / Totem</th>
                    <th>Área</th>
                    <th>Nível</th>
                    <th>Título do Trabalho & Autores</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredPresentations.map((item) => (
                    <tr key={item.id}>
                      <td className={styles.tableTime}>
                        ⏰ {item.time}
                        <div style={{ fontSize: '0.6875rem', color: 'var(--color-text-muted)', fontWeight: 'normal' }}>
                          {item.shift === 'MANHÃ' ? 'Manhã' : 'Tarde'}
                        </div>
                      </td>
                      <td className={styles.tableRoom}>
                        {item.room}
                      </td>
                      <td>
                        <span className={styles.tableArea}>{item.area}</span>
                      </td>
                      <td>
                        <span className={styles.tableCategory}>{item.category}</span>
                      </td>
                      <td>
                        <div className={styles.tableTitle}>{item.title}</div>
                        <div className={styles.tableAuthors}>
                          <strong>Autores:</strong> {item.authors}
                        </div>
                        {item.presenter && (
                          <div style={{ marginTop: '4px' }}>
                            <span className={styles.presenterTag}>
                              👤 Apresentador(a): {item.presenter}
                            </span>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}
    </div>
  );
}
