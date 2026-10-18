'use client';

import React, { useState, useEffect } from 'react';
import { CrachaCard } from '@/components/common/CrachaCard/CrachaCard';
import styles from './page.module.css';

interface ParticipantData {
  id: string;
  fullName: string;
  cpf: string;
  institution: string | null;
  user: {
    email: string;
  };
  registration: {
    status: string;
    category: {
      name: string;
    } | null;
  } | null;
}

export function CrachasClient({ participants }: { participants: ParticipantData[] }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'CONFIRMED' | 'PENDING'>('CONFIRMED');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [modalParticipant, setModalParticipant] = useState<ParticipantData | null>(null);
  const [isBatchPrinting, setIsBatchPrinting] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 15;

  // Filter
  const filtered = participants.filter((p) => {
    const term = searchTerm.toLowerCase();
    const nameMatch = p.fullName.toLowerCase().includes(term);
    const cpfMatch = p.cpf.includes(term);
    const emailMatch = p.user.email.toLowerCase().includes(term);
    const matchesSearch = nameMatch || cpfMatch || emailMatch;

    const status = p.registration?.status;
    if (statusFilter === 'CONFIRMED') {
      return matchesSearch && status === 'CONFIRMED';
    }
    if (statusFilter === 'PENDING') {
      return matchesSearch && status !== 'CONFIRMED';
    }
    return matchesSearch;
  });

  const totalPages = Math.ceil(filtered.length / itemsPerPage) || 1;
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginated = filtered.slice(startIndex, startIndex + itemsPerPage);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, statusFilter]);

  const toggleSelectAll = () => {
    if (selectedIds.length === filtered.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filtered.map((p) => p.id));
    }
  };

  const toggleSelectOne = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handlePrintBatch = () => {
    if (selectedIds.length === 0) {
      alert('Selecione ao menos um participante para imprimir o crachá.');
      return;
    }
    setIsBatchPrinting(true);
    setTimeout(() => {
      window.print();
      setIsBatchPrinting(false);
    }, 300);
  };

  const selectedParticipants = participants.filter((p) => selectedIds.includes(p.id));

  return (
    <>
      <div className={styles.noPrint}>
        {/* Controls Toolbar */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem', flexWrap: 'wrap', marginBottom: '1.25rem' }}>
          <input
            type="text"
            placeholder="Buscar por nome, CPF ou e-mail..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              flex: '1 1 300px',
              maxWidth: '450px',
              padding: '0.75rem 1rem',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--color-border)',
              fontSize: 'var(--text-sm)',
            }}
          />

          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
            <button
              type="button"
              onClick={() => setStatusFilter('CONFIRMED')}
              style={{
                padding: '0.45rem 0.85rem',
                borderRadius: '6px',
                border: statusFilter === 'CONFIRMED' ? '1px solid #10b981' : '1px solid #e2e8f0',
                background: statusFilter === 'CONFIRMED' ? '#10b981' : '#ffffff',
                color: statusFilter === 'CONFIRMED' ? '#ffffff' : '#475569',
                fontWeight: 600,
                fontSize: '0.8125rem',
                cursor: 'pointer',
              }}
            >
              Inscrições Confirmadas
            </button>
            <button
              type="button"
              onClick={() => setStatusFilter('ALL')}
              style={{
                padding: '0.45rem 0.85rem',
                borderRadius: '6px',
                border: statusFilter === 'ALL' ? '1px solid #0f172a' : '1px solid #e2e8f0',
                background: statusFilter === 'ALL' ? '#0f172a' : '#ffffff',
                color: statusFilter === 'ALL' ? '#ffffff' : '#475569',
                fontWeight: 600,
                fontSize: '0.8125rem',
                cursor: 'pointer',
              }}
            >
              Todos os Cadastrados ({participants.length})
            </button>
          </div>
        </div>

        {/* Batch Actions Bar */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', padding: '0.75rem 1rem', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 'var(--radius-md)', flexWrap: 'wrap', gap: '0.75rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '0.875rem', color: '#475569' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', cursor: 'pointer', fontWeight: 600 }}>
              <input
                type="checkbox"
                checked={filtered.length > 0 && selectedIds.length === filtered.length}
                onChange={toggleSelectAll}
                style={{ width: '16px', height: '16px', cursor: 'pointer' }}
              />
              Selecionar todos os {filtered.length} filtrados
            </label>
            {selectedIds.length > 0 && (
              <span style={{ color: '#0369a1', fontWeight: 600 }}>
                ({selectedIds.length} selecionado{selectedIds.length > 1 ? 's' : ''})
              </span>
            )}
          </div>

          {selectedIds.length > 0 && (
            <button
              type="button"
              onClick={handlePrintBatch}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem',
                background: '#0f172a',
                color: '#ffffff',
                border: 'none',
                padding: '0.5rem 1rem',
                borderRadius: '6px',
                fontSize: '0.8125rem',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              🖨️ Imprimir {selectedIds.length} Crachá{selectedIds.length > 1 ? 's' : ''} em Lote
            </button>
          )}
        </div>

        {/* Participants Table */}
        <div className={styles.tableWrapper}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th style={{ width: '40px', textAlign: 'center' }}>
                  <input
                    type="checkbox"
                    checked={filtered.length > 0 && selectedIds.length === filtered.length}
                    onChange={toggleSelectAll}
                    style={{ cursor: 'pointer' }}
                  />
                </th>
                <th>Nome do Participante</th>
                <th>CPF</th>
                <th>E-mail</th>
                <th>Categoria</th>
                <th>Status</th>
                <th style={{ textAlign: 'center' }}>Ações</th>
              </tr>
            </thead>
            <tbody>
              {paginated.length === 0 && (
                <tr>
                  <td colSpan={7} style={{ textAlign: 'center', padding: '2.5rem', color: '#64748b' }}>
                    Nenhum participante encontrado com os filtros selecionados.
                  </td>
                </tr>
              )}
              {paginated.map((p) => {
                const isSelected = selectedIds.includes(p.id);
                const isConfirmed = p.registration?.status === 'CONFIRMED';
                return (
                  <tr key={p.id} style={{ background: isSelected ? '#f0fdf4' : 'inherit' }}>
                    <td style={{ textAlign: 'center' }}>
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => toggleSelectOne(p.id)}
                        style={{ cursor: 'pointer' }}
                      />
                    </td>
                    <td>
                      <strong style={{ color: '#0f172a' }}>{p.fullName}</strong>
                      {p.institution && (
                        <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{p.institution}</div>
                      )}
                    </td>
                    <td>{p.cpf}</td>
                    <td>{p.user.email}</td>
                    <td>{p.registration?.category?.name || 'Não selecionada'}</td>
                    <td>
                      {isConfirmed ? (
                        <span className={styles.badgeSuccess}>✓ Confirmada</span>
                      ) : (
                        <span className={styles.badgeWarning}>⏳ {p.registration?.status || 'Pendente'}</span>
                      )}
                    </td>
                    <td style={{ textAlign: 'center' }}>
                      <button
                        type="button"
                        onClick={() => setModalParticipant(p)}
                        className={styles.actionBtn}
                        title="Ver e imprimir crachá com QR Code"
                      >
                        📇 Ver Crachá
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '1rem', marginTop: '1.5rem' }}>
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              style={{
                padding: '0.45rem 0.9rem',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--color-border)',
                background: currentPage === 1 ? 'var(--color-surface-alt)' : '#ffffff',
                cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
                color: currentPage === 1 ? 'var(--color-text-secondary)' : 'var(--color-text-primary)',
                fontWeight: 500,
                fontSize: '0.8125rem',
              }}
            >
              Anterior
            </button>
            <span style={{ fontSize: '0.8125rem', color: 'var(--color-text-secondary)' }}>
              Página <strong>{currentPage}</strong> de <strong>{totalPages}</strong>
            </span>
            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              style={{
                padding: '0.45rem 0.9rem',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--color-border)',
                background: currentPage === totalPages ? 'var(--color-surface-alt)' : '#ffffff',
                cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
                color: currentPage === totalPages ? 'var(--color-text-secondary)' : 'var(--color-text-primary)',
                fontWeight: 500,
                fontSize: '0.8125rem',
              }}
            >
              Próxima
            </button>
          </div>
        )}
      </div>

      {/* Individual Modal Preview */}
      {modalParticipant && (
        <div className={styles.modalBackdrop} onClick={() => setModalParticipant(null)}>
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <button className={styles.modalClose} onClick={() => setModalParticipant(null)}>
              ✕
            </button>
            <CrachaCard
              fullName={modalParticipant.fullName}
              categoryName={modalParticipant.registration?.category?.name || 'Participante'}
              institution={modalParticipant.institution}
              participantId={modalParticipant.id}
              cpf={modalParticipant.cpf}
              showPrintButton={true}
              qrSize={210}
            />
          </div>
        </div>
      )}

      {/* Batch Print Area (Only rendered during print when isBatchPrinting is true) */}
      {isBatchPrinting && (
        <div className={styles.batchPrintContainer}>
          {selectedParticipants.map((p) => (
            <div key={p.id} className={styles.batchPrintCard}>
              <CrachaCard
                fullName={p.fullName}
                categoryName={p.registration?.category?.name || 'Participante'}
                institution={p.institution}
                participantId={p.id}
                cpf={p.cpf}
                showPrintButton={false}
                qrSize={190}
              />
            </div>
          ))}
        </div>
      )}
    </>
  );
}
