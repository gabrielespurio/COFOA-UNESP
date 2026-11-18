'use client';

import React, { useState, useMemo, useEffect, useTransition } from 'react';
import { formatBRTDate, formatBRTTime } from '@/lib/formatDate';
import { toggleLectureEnrollmentStatus } from '@/actions/lectures';
import styles from './HandsOnEnrollmentsCard.module.css';

export type HandsOnEnrollmentItem = {
  id: string;
  participantId: string;
  name: string;
  email: string;
  phone: string | null;
  cpf: string;
  institution: string | null;
  category: string;
  registrationStatus: string;
  enrolledAt: string;
  workshopId: string;
  workshopTitle: string;
  workshopType: 'HANDS_ON' | 'MINI_HANDS' | 'LECTURE';
  workshopLocation: string | null;
  workshopStartTime: string;
  workshopEndTime: string;
};

export type HandsOnWorkshopItem = {
  id: string;
  title: string;
  speaker: string;
  location: string | null;
  startTime: string;
  endTime: string;
  type: 'HANDS_ON' | 'MINI_HANDS' | 'LECTURE';
  typeLabel: string;
  maxCapacity: number;
  isOpen: boolean;
  cleanDescription: string;
  enrolledCount: number;
  isFull: boolean;
};

interface HandsOnEnrollmentsCardProps {
  workshops: HandsOnWorkshopItem[];
  enrollments: HandsOnEnrollmentItem[];
}

function formatWorkshopDateTime(startStr: string, endStr: string) {
  const start = new Date(startStr);
  const end = new Date(endStr);
  return `${formatBRTDate(start)} das ${formatBRTTime(start, false)} às ${formatBRTTime(end, false)}`;
}

export function HandsOnEnrollmentsCard({
  workshops: initialWorkshops,
  enrollments,
}: HandsOnEnrollmentsCardProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [workshops, setWorkshops] = useState(initialWorkshops);
  const [selectedWorkshopId, setSelectedWorkshopId] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [isPending, startTransition] = useTransition();
  const itemsPerPage = 12;

  // Sync state if initialWorkshops update
  useEffect(() => {
    setWorkshops(initialWorkshops);
  }, [initialWorkshops]);

  // Total enrollments
  const totalEnrolled = useMemo(() => enrollments.length, [enrollments]);

  // Close with Escape key
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  // Block body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  // Toggle workshop registration open/closed status
  const handleToggleStatus = (workshopId: string, currentStatus: boolean, e: React.MouseEvent) => {
    e.stopPropagation();
    const newStatus = !currentStatus;

    // Optimistic update
    setWorkshops((prev) =>
      prev.map((w) => (w.id === workshopId ? { ...w, isOpen: newStatus } : w))
    );

    startTransition(async () => {
      const res = await toggleLectureEnrollmentStatus(workshopId, newStatus);
      if (res?.error) {
        // Rollback if error
        alert(`Erro ao alterar status: ${res.error}`);
        setWorkshops((prev) =>
          prev.map((w) => (w.id === workshopId ? { ...w, isOpen: currentStatus } : w))
        );
      }
    });
  };

  // Filter enrollments by workshop and search query
  const filteredEnrollments = useMemo(() => {
    let list = enrollments;

    if (selectedWorkshopId !== 'all') {
      list = list.filter((e) => e.workshopId === selectedWorkshopId);
    }

    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase().trim();
      list = list.filter((e) => {
        const matchName = e.name.toLowerCase().includes(term);
        const matchEmail = e.email.toLowerCase().includes(term);
        const matchCpf = e.cpf.toLowerCase().includes(term);
        const matchCat = e.category.toLowerCase().includes(term);
        const matchPhone = e.phone ? e.phone.toLowerCase().includes(term) : false;
        const matchWorkshop = e.workshopTitle.toLowerCase().includes(term);
        return matchName || matchEmail || matchCpf || matchCat || matchPhone || matchWorkshop;
      });
    }

    return list;
  }, [enrollments, selectedWorkshopId, searchTerm]);

  // Reset pagination on filter change
  useEffect(() => {
    setCurrentPage(1);
  }, [selectedWorkshopId, searchTerm]);

  const totalPages = Math.ceil(filteredEnrollments.length / itemsPerPage) || 1;
  const paginatedEnrollments = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredEnrollments.slice(start, start + itemsPerPage);
  }, [filteredEnrollments, currentPage, itemsPerPage]);

  // Export to CSV for Excel
  const handleExportCSV = () => {
    const headers = [
      'Atividade',
      'Tipo',
      'Local',
      'Data e Horário',
      'Nome do Congressista',
      'E-mail',
      'Telefone',
      'CPF',
      'Instituição',
      'Categoria',
      'Status Congresso',
      'Data Inscrição Hands-On',
      'Assinatura de Presença',
    ];

    const rows = filteredEnrollments.map((e) => [
      `"${(e.workshopTitle || '').replace(/"/g, '""')}"`,
      `"${e.workshopType === 'HANDS_ON' ? 'Hands-On' : 'Mini-Hands'}"`,
      `"${(e.workshopLocation || '').replace(/"/g, '""')}"`,
      `"${formatWorkshopDateTime(e.workshopStartTime, e.workshopEndTime)}"`,
      `"${(e.name || '').replace(/"/g, '""')}"`,
      `"${(e.email || '').replace(/"/g, '""')}"`,
      `"${(e.phone || '').replace(/"/g, '""')}"`,
      `"${(e.cpf || '').replace(/"/g, '""')}"`,
      `"${(e.institution || '').replace(/"/g, '""')}"`,
      `"${(e.category || '').replace(/"/g, '""')}"`,
      `"${e.registrationStatus === 'CONFIRMED' ? 'Confirmado' : 'Pendente'}"`,
      `"${formatBRTDate(e.enrolledAt)}"`,
      '""', // Blank for physical signature sheet
    ]);

    const csvContent = '\uFEFF' + [headers.join(';'), ...rows.map((r) => r.join(';'))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    const filenamePrefix =
      selectedWorkshopId !== 'all' ? `handson_${selectedWorkshopId}` : 'todos_handson';
    link.setAttribute(
      'download',
      `${filenamePrefix}_lista_presenca_${new Date().toISOString().slice(0, 10)}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <>
      {/* Dashboard Card */}
      <div
        className={styles.card}
        onClick={() => setIsOpen(true)}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') setIsOpen(true);
        }}
        title="Clique para gerenciar as inscrições e vagas dos Hands-On e Mini-Hands"
      >
        <div className={styles.cardTop}>
          <div className={styles.cardTitle}>
            <span>🛠️ Hands-On & Mini-Hands</span>
          </div>
          <span className={styles.badgeClickable}>Gerenciar & Exportar ➔</span>
        </div>

        <div className={styles.cardValue}>{totalEnrolled}</div>
        <div className={styles.cardSubtitle}>
          {workshops.length} atividades práticas laboratoriais (20 vagas cada)
        </div>

        <div className={styles.cardFooter}>
          <span>{workshops.filter((w) => w.isOpen).length} de {workshops.length} abertas</span>
          <span>Excel / Presença 📋</span>
        </div>
      </div>

      {/* Modal Dialog */}
      {isOpen && (
        <div className={styles.overlay} onClick={() => setIsOpen(false)}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            {/* Modal Header */}
            <div className={styles.modalHeader}>
              <div className={styles.headerInfo}>
                <h2 className={styles.modalTitle}>
                  <span>🛠️</span> Gerenciamento de Hands-On & Mini-Hands
                </h2>
                <p className={styles.modalSubtitle}>
                  Controle as vagas (20 por atividade), altere status de abertura e exporte listas de presença para o Excel.
                </p>
              </div>
              <button
                className={styles.closeButton}
                onClick={() => setIsOpen(false)}
                title="Fechar (Esc)"
              >
                ✕
              </button>
            </div>

            {/* Workshops Grid (Quick Overview & Open/Close Toggle) */}
            <div className={styles.workshopsSection}>
              <div className={styles.workshopsSectionTitle}>
                <span>Painel das 6 Atividades (Clique para filtrar)</span>
                <span>Limite: 20 vagas / turma</span>
              </div>

              <div className={styles.workshopsGrid}>
                {workshops.map((w) => {
                  const isSelected = selectedWorkshopId === w.id;
                  const isMini = w.type === 'MINI_HANDS';

                  return (
                    <div
                      key={w.id}
                      className={`${styles.workshopCard} ${isSelected ? styles.workshopCardSelected : ''}`}
                      onClick={() => setSelectedWorkshopId(isSelected ? 'all' : w.id)}
                    >
                      <div className={styles.workshopCardHeader}>
                        <div className={styles.workshopCardTitle}>{w.title}</div>
                        <span
                          className={`${styles.workshopBadge} ${
                            isMini ? styles.badgeMini : styles.badgeHands
                          }`}
                        >
                          {isMini ? 'MINI' : 'HANDS'}
                        </span>
                      </div>

                      <div className={styles.workshopMeta}>
                        <span>👨‍⚕️ {w.speaker}</span>
                        <span>📍 {w.location || 'A definir'} • 📅 {formatWorkshopDateTime(w.startTime, w.endTime)}</span>
                      </div>

                      <div className={styles.workshopCardFooter}>
                        <span className={styles.vacanciesCount}>
                          👥 {w.enrolledCount} / {w.maxCapacity} vagas
                        </span>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <span
                            className={`${styles.statusIndicator} ${
                              w.isOpen ? styles.statusOpen : styles.statusClosed
                            }`}
                          >
                            {w.isOpen ? '● Aberta' : '○ Off-line'}
                          </span>

                          <button
                            type="button"
                            className={styles.toggleStatusBtn}
                            onClick={(e) => handleToggleStatus(w.id, w.isOpen, e)}
                            title={w.isOpen ? 'Clique para fechar inscrições' : 'Clique para abrir inscrições'}
                            disabled={isPending}
                          >
                            {w.isOpen ? '🔒 Fechar' : '🔓 Abrir'}
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Toolbar Filters & Export Button */}
            <div className={styles.toolbar}>
              <div className={styles.filtersLeft}>
                <select
                  className={styles.workshopSelect}
                  value={selectedWorkshopId}
                  onChange={(e) => setSelectedWorkshopId(e.target.value)}
                >
                  <option value="all">Todas as Atividades ({totalEnrolled} inscritos)</option>
                  {workshops.map((w) => (
                    <option key={w.id} value={w.id}>
                      {w.title.slice(0, 45)}... ({w.enrolledCount}/20)
                    </option>
                  ))}
                </select>

                <div className={styles.searchBox}>
                  <span className={styles.searchIcon}>🔍</span>
                  <input
                    type="text"
                    className={styles.searchInput}
                    placeholder="Buscar congressista por nome, e-mail, CPF, categoria..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>

              <button
                type="button"
                className={styles.exportButton}
                onClick={handleExportCSV}
                title="Exportar dados com nomes, e-mails e espaço de assinatura para o Excel"
              >
                📊 Exportar Lista Excel (.csv)
              </button>
            </div>

            {/* Table of Enrolled Participants */}
            <div className={styles.tableContainer}>
              {filteredEnrollments.length === 0 ? (
                <div className={styles.emptyState}>
                  {workshops.length === 0
                    ? 'Nenhum workshop cadastrado.'
                    : enrollments.length === 0
                    ? 'Nenhum participante inscrito ainda. As inscrições estão atualmente em modo Off-line (em breve).'
                    : 'Nenhum participante encontrado com os filtros selecionados.'}
                </div>
              ) : (
                <table className={styles.table}>
                  <thead>
                    <tr>
                      <th>Atividade</th>
                      <th>Congressista</th>
                      <th>Contato</th>
                      <th>CPF</th>
                      <th>Categoria</th>
                      <th>Inscrição</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedEnrollments.map((item) => (
                      <tr key={item.id}>
                        <td style={{ maxWidth: '240px' }}>
                          <span className={styles.workshopColumnTitle}>{item.workshopTitle}</span>
                          <span className={styles.workshopColumnMeta}>
                            📍 {item.workshopLocation} • {formatWorkshopDateTime(item.workshopStartTime, item.workshopEndTime)}
                          </span>
                        </td>
                        <td>
                          <span className={styles.participantName}>{item.name}</span>
                          <span className={styles.participantEmail}>{item.email}</span>
                        </td>
                        <td>
                          <span style={{ fontSize: '0.8125rem' }}>{item.phone || 'Não informado'}</span>
                        </td>
                        <td>
                          <span style={{ fontSize: '0.8125rem', fontFamily: 'monospace' }}>
                            {item.cpf}
                          </span>
                        </td>
                        <td>
                          <span className={styles.categoryTag}>{item.category}</span>
                        </td>
                        <td>
                          <span style={{ fontSize: '0.8125rem', color: '#6b7280' }}>
                            {formatBRTDate(item.enrolledAt)}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>

            {/* Modal Footer */}
            <div className={styles.modalFooter}>
              <div className={styles.footerCount}>
                Mostrando <strong>{paginatedEnrollments.length}</strong> de{' '}
                <strong>{filteredEnrollments.length}</strong> inscrições filtradas (Total:{' '}
                {totalEnrolled})
              </div>

              {totalPages > 1 && (
                <div className={styles.pagination}>
                  <button
                    className={styles.pageBtn}
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                  >
                    Anterior
                  </button>
                  <span className={styles.pageInfo}>
                    Página {currentPage} de {totalPages}
                  </span>
                  <button
                    className={styles.pageBtn}
                    onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                  >
                    Próxima
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
