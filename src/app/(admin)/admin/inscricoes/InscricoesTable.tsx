'use client';

import React, { useState, useEffect } from 'react';
import styles from './page.module.css';
import { RegistrationActions } from './RegistrationActions';
import { ManageModalCategory } from './ManageRegistrationModal';

interface InscricoesTableProps {
  initialRegistrations: any[];
  categories: ManageModalCategory[];
}

export function InscricoesTable({ initialRegistrations, categories }: InscricoesTableProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'CONFIRMED' | 'PENDING' | 'CANCELLED'>('ALL');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 15;

  // Filtragem
  const filteredRegistrations = initialRegistrations.filter(r => {
    const searchLower = searchTerm.toLowerCase();
    const nameMatch = r.participant?.fullName?.toLowerCase().includes(searchLower);
    const emailMatch = r.participant?.user?.email?.toLowerCase().includes(searchLower);
    const cpfMatch = r.participant?.cpf?.includes(searchLower);
    const categoryMatch = r.category?.name?.toLowerCase().includes(searchLower);
    const couponMatch = r.coupon?.code?.toLowerCase().includes(searchLower);

    const matchesSearch = nameMatch || emailMatch || cpfMatch || categoryMatch || couponMatch;

    if (!matchesSearch) return false;

    if (statusFilter !== 'ALL' && r.status !== statusFilter) {
      return false;
    }

    return true;
  });

  // Paginação
  const totalPages = Math.ceil(filteredRegistrations.length / itemsPerPage) || 1;
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedRegistrations = filteredRegistrations.slice(startIndex, startIndex + itemsPerPage);

  // Resetar página ao mudar termo de busca ou filtro
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, statusFilter]);

  return (
    <>
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        marginBottom: '1.5rem', 
        gap: '1rem', 
        flexWrap: 'wrap',
        marginTop: '1.5rem'
      }}>
        <div style={{ display: 'flex', gap: '0.75rem', flex: '1 1 350px', flexWrap: 'wrap', alignItems: 'center' }}>
          <div style={{ position: 'relative', flex: '1 1 260px' }}>
            <input 
              type="text" 
              placeholder="Buscar por nome, e-mail ou CPF..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                width: '100%',
                padding: '0.75rem 1rem 0.75rem 2.25rem',
                borderRadius: 'var(--radius-md, 8px)',
                border: '1px solid var(--color-border, #d1d5db)',
                fontFamily: 'inherit',
                fontSize: '0.875rem',
                background: '#ffffff',
                boxShadow: '0 1px 2px rgba(0,0,0,0.03)'
              }}
            />
            <span style={{ 
              position: 'absolute', 
              left: '0.75rem', 
              top: '50%', 
              transform: 'translateY(-50%)', 
              color: '#9ca3af',
              fontSize: '0.95rem' 
            }}>
              🔍
            </span>
            {searchTerm && (
              <button
                type="button"
                onClick={() => setSearchTerm('')}
                style={{
                  position: 'absolute',
                  right: '0.75rem',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  color: '#9ca3af',
                  cursor: 'pointer',
                  fontSize: '0.9rem',
                  padding: '2px'
                }}
              >
                ✕
              </button>
            )}
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            style={{
              padding: '0.75rem 1rem',
              borderRadius: 'var(--radius-md, 8px)',
              border: '1px solid var(--color-border, #d1d5db)',
              fontFamily: 'inherit',
              fontSize: '0.875rem',
              background: '#ffffff',
              color: '#374151',
              cursor: 'pointer'
            }}
          >
            <option value="ALL">Todos os Status</option>
            <option value="CONFIRMED">Apenas Confirmadas</option>
            <option value="PENDING">Apenas Pendentes</option>
            <option value="CANCELLED">Apenas Canceladas</option>
          </select>
        </div>

        <div style={{ color: 'var(--color-text-secondary)', fontSize: '0.875rem', fontWeight: 500 }}>
          {filteredRegistrations.length} {filteredRegistrations.length === 1 ? 'inscrição encontrada' : 'inscrições encontradas'}
        </div>
      </div>

      <div className={styles.tableContainer} style={{ marginTop: '0' }}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Participante (CPF)</th>
              <th>Categoria</th>
              <th>Valor</th>
              <th>Status</th>
              <th>Comprovantes</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            {paginatedRegistrations.length === 0 && (
              <tr>
                <td colSpan={6} className={styles.emptyState} style={{ textAlign: 'center', padding: '3rem 1rem' }}>
                  <div style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>🔍</div>
                  <strong>Nenhuma inscrição encontrada</strong>
                  <div style={{ fontSize: '0.85rem', color: '#6b7280', marginTop: '0.25rem' }}>
                    Tente buscar por outro termo ou limpar o filtro.
                  </div>
                </td>
              </tr>
            )}

            {paginatedRegistrations.map(r => {
              const categoryProofUrl = r.participant.studentProofUrl || r.participant.croProofUrl;
              
              let asaasUrl = r.paymentReceiptUrl;
              if (!asaasUrl && r.payment?.gatewayResponse) {
                const response = r.payment.gatewayResponse as any;
                asaasUrl = response.transactionReceiptUrl || response.invoiceUrl;
              }
              
              let statusClass = styles.badgeNeutral;
              if (r.status === 'CONFIRMED') statusClass = styles.badgeSuccess;
              if (r.status === 'PENDING') statusClass = styles.badgeWarning;
              if (r.status === 'CANCELLED') statusClass = styles.badgeUser;

              return (
                <tr key={r.id}>
                  <td className={styles.nameCell}>
                    <strong>{r.participant.fullName}</strong> <br/>
                    <span style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)', fontWeight: 'normal' }}>
                      {r.participant.cpf} • {r.participant.user.email}
                    </span>
                  </td>
                  <td>
                    <span>{r.category.name}</span>
                    {r.coupon && (
                      <div style={{ fontSize: '0.75rem', color: '#0284c7', marginTop: '2px' }}>
                        Cupom: {r.coupon.code}
                      </div>
                    )}
                  </td>
                  <td style={{ fontWeight: 600 }}>
                    R$ {(r.amount / 100).toFixed(2).replace('.', ',')}
                  </td>
                  <td>
                    <span className={statusClass}>
                      {r.status === 'CONFIRMED' ? 'Confirmada' : r.status === 'PENDING' ? 'Pendente' : 'Cancelada'}
                    </span>
                  </td>
                  <td>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      {categoryProofUrl ? (
                        <a href={categoryProofUrl} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--color-primary)', textDecoration: 'underline', fontSize: '0.875rem' }}>
                          Vínculo Estudante/CRO
                        </a>
                      ) : null}
                      
                      {asaasUrl ? (
                        <a href={asaasUrl} target="_blank" rel="noopener noreferrer" style={{ color: '#059669', textDecoration: 'underline', fontSize: '0.875rem' }}>
                          Recibo Asaas
                        </a>
                      ) : null}
                      
                      {!categoryProofUrl && !asaasUrl && (
                        <span style={{ color: 'var(--color-text-muted)' }}>-</span>
                      )}
                    </div>
                  </td>
                  <td>
                    <RegistrationActions 
                      participant={r.participant}
                      registration={r}
                      categories={categories}
                    />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '1rem', marginTop: '1.5rem' }}>
          <button 
            type="button"
            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            style={{
              padding: '0.5rem 1rem',
              borderRadius: 'var(--radius-md, 6px)',
              border: '1px solid var(--color-border, #d1d5db)',
              background: currentPage === 1 ? 'var(--color-surface-alt, #f3f4f6)' : 'white',
              cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
              color: currentPage === 1 ? 'var(--color-text-secondary, #9ca3af)' : 'var(--color-text-primary, #111827)',
              fontWeight: 500
            }}
          >
            Anterior
          </button>
          
          <span style={{ fontSize: '0.875rem', color: 'var(--color-text-secondary)' }}>
            Página <strong>{currentPage}</strong> de <strong>{totalPages}</strong>
          </span>
          
          <button 
            type="button"
            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            style={{
              padding: '0.5rem 1rem',
              borderRadius: 'var(--radius-md, 6px)',
              border: '1px solid var(--color-border, #d1d5db)',
              background: currentPage === totalPages ? 'var(--color-surface-alt, #f3f4f6)' : 'white',
              cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
              color: currentPage === totalPages ? 'var(--color-text-secondary, #9ca3af)' : 'var(--color-text-primary, #111827)',
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
