'use client';

import React, { useState, useEffect } from 'react';
import styles from './page.module.css';

function getStatusBadge(status: string) {
  switch (status) {
    case 'CONFIRMED':
      return <span className={styles.badgeSuccess}>Confirmada</span>;
    case 'PENDING':
      return <span className={styles.badgeWarning}>Pendente</span>;
    case 'CANCELLED':
      return <span className={styles.badgeError}>Cancelada</span>;
    default:
      return <span className={styles.badgeNeutral}>{status || 'Nenhuma'}</span>;
  }
}

export function ParticipantesTable({ participants }: { participants: any[] }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Filter participants
  const filteredParticipants = participants.filter(p => {
    const searchLower = searchTerm.toLowerCase();
    const nameMatch = p.fullName?.toLowerCase().includes(searchLower);
    const emailMatch = p.user.email?.toLowerCase().includes(searchLower);
    const cpfMatch = p.cpf?.includes(searchLower);
    return nameMatch || emailMatch || cpfMatch;
  });

  // Pagination
  const totalPages = Math.ceil(filteredParticipants.length / itemsPerPage) || 1;
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedParticipants = filteredParticipants.slice(startIndex, startIndex + itemsPerPage);

  // Reset page when search changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  return (
    <>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', gap: '1rem', flexWrap: 'wrap' }}>
        <input 
          type="text" 
          placeholder="Buscar por nome, e-mail ou CPF..." 
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{
            flex: '1 1 300px',
            maxWidth: '500px',
            padding: '0.75rem 1rem',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--color-border)',
            fontFamily: 'inherit',
            fontSize: 'var(--font-size-sm)'
          }}
        />
        <div style={{ color: 'var(--color-text-secondary)', fontSize: 'var(--font-size-sm)' }}>
          {filteredParticipants.length} {filteredParticipants.length === 1 ? 'participante encontrado' : 'participantes encontrados'}
        </div>
      </div>

      <div className={styles.tableContainer}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Nome</th>
              <th>E-mail</th>
              <th>CPF</th>
              <th>Celular</th>
              <th>Papel</th>
              <th>Inscrição</th>
              <th>Comprovante</th>
            </tr>
          </thead>
          <tbody>
            {paginatedParticipants.length === 0 && (
              <tr>
                <td colSpan={7} className={styles.emptyState} style={{ textAlign: 'center', padding: '2rem' }}>
                  Nenhum participante encontrado.
                </td>
              </tr>
            )}
            {paginatedParticipants.map(p => (
              <tr key={p.id}>
                <td className={styles.nameCell}><strong>{p.fullName}</strong></td>
                <td>{p.user.email}</td>
                <td>{p.cpf}</td>
                <td>{p.phone || '-'}</td>
                <td>
                  <span className={p.user.role === 'ADMIN' ? styles.badgeAdmin : styles.badgeUser}>
                    {p.user.role}
                  </span>
                </td>
                <td>
                  {p.registration ? getStatusBadge(p.registration.status) : <span className={styles.badgeNeutral}>Nenhuma</span>}
                </td>
                <td>
                  {p.registration?.paymentReceiptUrl ? (
                    <a 
                      href={p.registration.paymentReceiptUrl} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      style={{ color: 'var(--color-primary)', textDecoration: 'underline', fontWeight: 500 }}
                    >
                      Ver Recibo
                    </a>
                  ) : (
                    <span style={{ color: 'var(--color-text-secondary)' }}>-</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '1rem', marginTop: '1.5rem' }}>
          <button 
            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            style={{
              padding: '0.5rem 1rem',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--color-border)',
              background: currentPage === 1 ? 'var(--color-surface-alt)' : 'white',
              cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
              color: currentPage === 1 ? 'var(--color-text-secondary)' : 'var(--color-text-primary)',
              fontWeight: 500
            }}
          >
            Anterior
          </button>
          
          <span style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)' }}>
            Página <strong>{currentPage}</strong> de <strong>{totalPages}</strong>
          </span>
          
          <button 
            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            style={{
              padding: '0.5rem 1rem',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--color-border)',
              background: currentPage === totalPages ? 'var(--color-surface-alt)' : 'white',
              cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
              color: currentPage === totalPages ? 'var(--color-text-secondary)' : 'var(--color-text-primary)',
              fontWeight: 500
            }}
          >
            Próxima
          </button>
        </div>
      )}
    </>
  );
}
