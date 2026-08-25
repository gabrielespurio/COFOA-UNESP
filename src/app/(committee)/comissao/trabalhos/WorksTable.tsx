'use client';

import React, { useState, useEffect } from 'react';
import { Badge } from '@/components/ui/Badge/Badge';
import { EvaluationForm } from './EvaluationForm';
import { useRouter } from 'next/navigation';
import styles from '../page.module.css';

function getStatusBadge(status: string) {
  switch (status) {
    case 'SUBMITTED':
      return <Badge variant="warning">Pendente</Badge>;
    case 'UNDER_REVIEW':
      return <Badge variant="info">Em Análise</Badge>;
    case 'REVISION_REQUESTED':
      return <Badge variant="warning">Com Ressalva</Badge>;
    case 'ACCEPTED':
      return <Badge variant="success">Aprovado</Badge>;
    case 'REJECTED':
      return <Badge variant="error">Reprovado</Badge>;
    default:
      return <Badge variant="info">{status}</Badge>;
  }
}

function WorkEvaluationModal({ work, onClose }: { work: any, onClose: () => void }) {
  const router = useRouter();

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = 'unset'; };
  }, []);

  let authors = [];
  try {
    authors = JSON.parse(work.authors);
  } catch (e) {
    // fallback
  }

  return (
    <div style={{
      position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.6)', 
      backdropFilter: 'blur(4px)', zIndex: 100, display: 'flex', 
      alignItems: 'center', justifyContent: 'center', padding: '1rem'
    }}>
      <div style={{
        background: 'var(--color-surface)', width: '100%', maxWidth: '800px', 
        maxHeight: '90vh', overflowY: 'auto', borderRadius: 'var(--radius-lg)', 
        boxShadow: 'var(--shadow-lg)', display: 'flex', flexDirection: 'column'
      }}>
        {/* Header */}
        <div style={{ 
          padding: '1.5rem', borderBottom: '1px solid var(--color-border)', 
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          position: 'sticky', top: 0, background: 'var(--color-surface)', zIndex: 10
        }}>
          <div>
            <h2 style={{ fontSize: '1.5rem', color: 'var(--color-primary-dark)', margin: 0 }}>Análise de Trabalho</h2>
            <p style={{ color: 'var(--color-text-secondary)', margin: '0.25rem 0 0 0', fontSize: '0.875rem' }}>Revise as informações antes de dar seu parecer.</p>
          </div>
          <button 
            onClick={onClose}
            style={{ 
              background: 'var(--color-surface-alt)', border: 'none', width: '36px', height: '36px', 
              borderRadius: '50%', cursor: 'pointer', display: 'flex', alignItems: 'center', 
              justifyContent: 'center', fontSize: '1.25rem', color: 'var(--color-text-primary)'
            }}
          >
            ✕
          </button>
        </div>
        
        {/* Content */}
        <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          
          {/* Work Data */}
          <div style={{ background: 'var(--color-surface-alt)', padding: '1.5rem', borderRadius: 'var(--radius-md)', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
              <span style={{ padding: '0.25rem 0.5rem', background: 'var(--color-primary-light)', color: 'var(--color-primary-dark)', fontSize: '0.875rem', fontWeight: 600, borderRadius: 'var(--radius-sm)' }}>
                {work.displayCode}
              </span>
              <h3 style={{ fontSize: '1.25rem', color: 'var(--color-primary-dark)', margin: 0 }}>{work.title}</h3>
            </div>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div style={{ fontSize: '0.875rem' }}><span style={{ color: 'var(--color-text-secondary)' }}>Área Temática:</span> <strong>{work.categoryArea}</strong></div>
              <div style={{ fontSize: '0.875rem' }}><span style={{ color: 'var(--color-text-secondary)' }}>Modalidade:</span> <strong>{work.modality}</strong></div>
              {work.advisor && <div style={{ fontSize: '0.875rem' }}><span style={{ color: 'var(--color-text-secondary)' }}>Orientador:</span> <strong>{work.advisor}</strong></div>}
              {work.presenter && <div style={{ fontSize: '0.875rem' }}><span style={{ color: 'var(--color-text-secondary)' }}>Apresentador:</span> <strong>{work.presenter}</strong></div>}
            </div>
            
            <div>
              <h4 style={{ fontSize: '1rem', color: 'var(--color-primary)', borderBottom: '1px solid var(--color-border)', paddingBottom: '0.5rem', margin: '0 0 1rem 0' }}>Resumo (Abstract)</h4>
              <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.875rem', lineHeight: 1.6, whiteSpace: 'pre-wrap', margin: 0 }}>{work.abstract}</p>
            </div>
            
            {authors.length > 0 && (
              <div>
                <h4 style={{ fontSize: '1rem', color: 'var(--color-primary)', borderBottom: '1px solid var(--color-border)', paddingBottom: '0.5rem', margin: '0 0 1rem 0' }}>Autores</h4>
                <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  {authors.map((a: any, idx: number) => (
                    <li key={idx} style={{ fontSize: '0.875rem', color: 'var(--color-text-secondary)' }}>
                      <strong>{a.name}</strong> {a.email && `(${a.email})`} {a.isMain && '- Autor Correspondente'}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            
            <div>
              <h4 style={{ fontSize: '1rem', color: 'var(--color-primary)', borderBottom: '1px solid var(--color-border)', paddingBottom: '0.5rem', margin: '0 0 1rem 0' }}>Arquivos Anexados</h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {work.identifiedFileUrl && (
                  <a href={work.identifiedFileUrl} target="_blank" rel="noopener noreferrer" style={{ display: 'block', padding: '0.75rem 1rem', background: 'var(--color-primary)', color: 'white', textDecoration: 'none', borderRadius: 'var(--radius-md)', fontWeight: 600, textAlign: 'center' }}>
                    Trabalho Identificado (PDF)
                  </a>
                )}
                {work.unidentifiedFileUrl && (
                  <a href={work.unidentifiedFileUrl} target="_blank" rel="noopener noreferrer" style={{ display: 'block', padding: '0.75rem 1rem', background: 'var(--color-primary)', color: 'white', textDecoration: 'none', borderRadius: 'var(--radius-md)', fontWeight: 600, textAlign: 'center' }}>
                    Trabalho Não Identificado (PDF)
                  </a>
                )}
                {work.enrollmentProofUrl && (
                  <a href={work.enrollmentProofUrl} target="_blank" rel="noopener noreferrer" style={{ display: 'block', padding: '0.75rem 1rem', background: 'var(--color-primary)', color: 'white', textDecoration: 'none', borderRadius: 'var(--radius-md)', fontWeight: 600, textAlign: 'center' }}>
                    Comprovante de Matrícula (PDF)
                  </a>
                )}
              </div>
            </div>
          </div>
          
          {/* Evaluation Form */}
          <div style={{ borderTop: '2px solid var(--color-border)', paddingTop: '1.5rem' }}>
            <h3 style={{ fontSize: '1.25rem', color: 'var(--color-primary-dark)', margin: '0 0 1.5rem 0' }}>Parecer da Comissão</h3>
            <EvaluationForm 
              workId={work.id} 
              currentStatus={work.status} 
              currentComments={work.reviewerComments || ''} 
              onSuccess={() => {
                onClose();
                router.refresh();
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export function WorksTable({ works }: { works: any[] }) {
  const [selectedWork, setSelectedWork] = useState<any | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Filter works
  const filteredWorks = works.filter(work => {
    const searchLower = searchTerm.toLowerCase();
    const titleMatch = work.title?.toLowerCase().includes(searchLower);
    const authorMatch = work.participant?.fullName?.toLowerCase().includes(searchLower);
    const codeMatch = work.displayCode?.toLowerCase().includes(searchLower);
    return titleMatch || authorMatch || codeMatch;
  });

  // Pagination
  const totalPages = Math.ceil(filteredWorks.length / itemsPerPage) || 1;
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedWorks = filteredWorks.slice(startIndex, startIndex + itemsPerPage);

  // Reset page when search changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  return (
    <>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', gap: '1rem', flexWrap: 'wrap' }}>
        <input 
          type="text" 
          placeholder="Buscar por código, título ou autor..." 
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
          {filteredWorks.length} {filteredWorks.length === 1 ? 'trabalho encontrado' : 'trabalhos encontrados'}
        </div>
      </div>

      <div className={styles.tableWrapper}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Código</th>
              <th>Título</th>
              <th>Área Temática</th>
              <th>Autor Principal</th>
              <th>Status</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            {paginatedWorks.length === 0 && (
              <tr>
                <td colSpan={6} style={{ textAlign: 'center', color: 'var(--color-text-secondary)', padding: '2rem' }}>
                  Nenhum trabalho encontrado.
                </td>
              </tr>
            )}
            {paginatedWorks.map(work => (
              <tr key={work.id}>
                <td><strong style={{ color: 'var(--color-primary)' }}>{work.displayCode}</strong></td>
                <td style={{ fontWeight: 500, maxWidth: '250px' }}>
                  <div style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {work.title}
                  </div>
                </td>
                <td>{work.categoryArea}</td>
                <td>{work.participant.fullName}</td>
                <td>{getStatusBadge(work.status)}</td>
                <td>
                  <button 
                    onClick={() => setSelectedWork(work)} 
                    className={styles.actionBtn}
                    style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--color-primary)', fontWeight: 600, padding: 0 }}
                  >
                    Avaliar
                  </button>
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
      
      {selectedWork && (
        <WorkEvaluationModal 
          work={selectedWork} 
          onClose={() => setSelectedWork(null)} 
        />
      )}
    </>
  );
}
