'use client';

import React, { useState, useMemo, useEffect } from 'react';
import styles from './BancaEvaluatorsCard.module.css';

export type EvaluatorItem = {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  institution: string;
  areaOrCourse: string | null;
  category: string;
  createdAt: string;
};

interface BancaEvaluatorsCardProps {
  evaluators: EvaluatorItem[];
}

export function BancaEvaluatorsCard({ evaluators }: BancaEvaluatorsCardProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 12;

  // Fecha com a tecla Escape
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  // Bloqueia o scroll do body quando o modal estiver aberto
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

  // Filtra avaliadores conforme a busca
  const filteredEvaluators = useMemo(() => {
    if (!searchTerm.trim()) return evaluators;
    const term = searchTerm.toLowerCase().trim();
    return evaluators.filter(item => {
      const matchName = item.name.toLowerCase().includes(term);
      const matchEmail = item.email.toLowerCase().includes(term);
      const matchInst = item.institution.toLowerCase().includes(term);
      const matchArea = item.areaOrCourse ? item.areaOrCourse.toLowerCase().includes(term) : false;
      const matchCat = item.category.toLowerCase().includes(term);
      const matchPhone = item.phone ? item.phone.toLowerCase().includes(term) : false;
      return matchName || matchEmail || matchInst || matchArea || matchCat || matchPhone;
    });
  }, [evaluators, searchTerm]);

  // Reseta paginação quando o termo de busca mudar
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  const totalPages = Math.ceil(filteredEvaluators.length / itemsPerPage) || 1;
  const paginatedEvaluators = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredEvaluators.slice(start, start + itemsPerPage);
  }, [filteredEvaluators, currentPage, itemsPerPage]);

  // Exportar para CSV
  function handleExportCSV() {
    const headers = ['Nome', 'E-mail', 'Telefone', 'Instituição', 'Área / Curso', 'Categoria', 'Data de Cadastro'];
    const rows = filteredEvaluators.map(e => [
      `"${(e.name || '').replace(/"/g, '""')}"`,
      `"${(e.email || '').replace(/"/g, '""')}"`,
      `"${(e.phone || '').replace(/"/g, '""')}"`,
      `"${(e.institution || '').replace(/"/g, '""')}"`,
      `"${(e.areaOrCourse || '').replace(/"/g, '""')}"`,
      `"${(e.category || '').replace(/"/g, '""')}"`,
      `"${new Date(e.createdAt).toLocaleDateString('pt-BR')}"`,
    ]);

    const csvContent = '\uFEFF' + [headers.join(';'), ...rows.map(r => r.join(';'))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `banca_avaliadora_cofoa_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  return (
    <>
      {/* Card indicador no grid */}
      <div 
        className={styles.card} 
        onClick={() => setIsOpen(true)}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') setIsOpen(true); }}
        title="Clique para ver os usuários da Banca Avaliadora"
      >
        <div className={styles.cardTop}>
          <div className={styles.cardTitle}>
            <span>⚖️ Banca Avaliadora</span>
          </div>
          <span className={styles.badgeClickable}>
            Ver lista ➔
          </span>
        </div>
        
        <div className={styles.cardValue}>
          {evaluators.length}
        </div>

        <div className={styles.cardFooter}>
          <span>Usuários habilitados</span>
          <span style={{ fontSize: '0.75rem', textDecoration: 'underline' }}>Clique para abrir</span>
        </div>
      </div>

      {/* Modal interativo com a listagem completa */}
      {isOpen && (
        <div 
          className={styles.overlay} 
          onClick={() => setIsOpen(false)}
          role="dialog"
          aria-modal="true"
        >
          <div 
            className={styles.modal} 
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className={styles.modalHeader}>
              <div className={styles.headerInfo}>
                <h2 className={styles.modalTitle}>
                  <span>⚖️ Membros da Banca Avaliadora</span>
                </h2>
                <p className={styles.modalSubtitle}>
                  {evaluators.length} usuário{evaluators.length === 1 ? '' : 's'} cadastrado{evaluators.length === 1 ? '' : 's'} e habilitado{evaluators.length === 1 ? '' : 's'} para avaliar apresentações no congresso.
                </p>
              </div>
              <button 
                type="button" 
                className={styles.closeButton} 
                onClick={() => setIsOpen(false)}
                title="Fechar (Esc)"
              >
                ✕
              </button>
            </div>

            {/* Toolbar: Busca e Exportação */}
            <div className={styles.toolbar}>
              <div className={styles.searchBox}>
                <span className={styles.searchIcon}>🔍</span>
                <input
                  type="text"
                  placeholder="Buscar por nome, e-mail, instituição ou categoria..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className={styles.searchInput}
                  autoFocus
                />
              </div>

              <button
                type="button"
                onClick={handleExportCSV}
                className={styles.exportButton}
                title="Exportar listagem para Excel / CSV"
              >
                📥 Exportar CSV
              </button>
            </div>

            {/* Tabela de Avaliadores */}
            <div className={styles.tableContainer}>
              {paginatedEvaluators.length === 0 ? (
                <div className={styles.emptyState}>
                  Nenhum avaliador encontrado para a busca &quot;{searchTerm}&quot;.
                </div>
              ) : (
                <table className={styles.table}>
                  <thead>
                    <tr>
                      <th>Avaliador</th>
                      <th>Instituição</th>
                      <th>Área / Curso</th>
                      <th>Categoria</th>
                      <th>Contato</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedEvaluators.map((ev) => (
                      <tr key={ev.id}>
                        <td>
                          <span className={styles.evaluatorName}>{ev.name}</span>
                          <span className={styles.evaluatorEmail}>{ev.email}</span>
                        </td>
                        <td>{ev.institution}</td>
                        <td style={{ fontSize: '0.8125rem', color: '#4b5563' }}>
                          {ev.areaOrCourse || '—'}
                        </td>
                        <td>
                          <span className={styles.categoryTag}>
                            {ev.category}
                          </span>
                        </td>
                        <td style={{ fontSize: '0.8125rem' }}>
                          {ev.phone ? (
                            <a 
                              href={`https://wa.me/55${ev.phone.replace(/\D/g, '')}`} 
                              target="_blank" 
                              rel="noreferrer"
                              style={{ color: '#059669', fontWeight: 500 }}
                              title="Conversar no WhatsApp"
                            >
                              📱 {ev.phone}
                            </a>
                          ) : (
                            <span style={{ color: '#9ca3af' }}>—</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>

            {/* Rodapé com paginação */}
            <div className={styles.modalFooter}>
              <div className={styles.footerCount}>
                Mostrando {paginatedEvaluators.length > 0 ? (currentPage - 1) * itemsPerPage + 1 : 0}–
                {Math.min(currentPage * itemsPerPage, filteredEvaluators.length)} de{' '}
                <strong>{filteredEvaluators.length}</strong> avaliador{filteredEvaluators.length === 1 ? '' : 'es'}
                {searchTerm && ` (filtrado de ${evaluators.length})`}
              </div>

              {totalPages > 1 && (
                <div className={styles.pagination}>
                  <button
                    type="button"
                    className={styles.pageBtn}
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                  >
                    ← Anterior
                  </button>
                  <span className={styles.pageInfo}>
                    Página <strong>{currentPage}</strong> de <strong>{totalPages}</strong>
                  </span>
                  <button
                    type="button"
                    className={styles.pageBtn}
                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                  >
                    Próxima →
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
