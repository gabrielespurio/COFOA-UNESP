'use client';

import React, { useState, useEffect } from 'react';
import { Badge } from '@/components/ui/Badge/Badge';
import { EvaluationForm } from './EvaluationForm';
import { useRouter } from 'next/navigation';
import styles from '../page.module.css';

function getStatusBadge(status: string) {
  switch (status) {
    case 'SUBMITTED':
      return <Badge variant="warning">Submetido</Badge>; // Legacy
    case 'UNDER_REVIEW':
      return <Badge variant="info">Em Análise</Badge>;
    case 'REVISION_REQUESTED':
      return <Badge variant="warning">Aprovado com Ressalvas</Badge>;
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
  const [activeTab, setActiveTab] = useState<'info' | 'history'>('info');

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = 'unset'; };
  }, []);

  return (
    <div style={{
      position: 'fixed', inset: 0, backgroundColor: 'rgba(15, 23, 42, 0.6)', 
      backdropFilter: 'blur(4px)', zIndex: 100, display: 'flex', 
      alignItems: 'center', justifyContent: 'center', padding: '1rem'
    }}>
      <div style={{
        background: '#ffffff', width: '100%', maxWidth: '900px', 
        maxHeight: '90vh', overflowY: 'auto', borderRadius: '12px', 
        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)', 
        display: 'flex', flexDirection: 'column'
      }}>
        {/* Header */}
        <div style={{ 
          padding: '1.5rem', borderBottom: '1px solid #f1f5f9', 
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          position: 'sticky', top: 0, background: '#ffffff', zIndex: 10
        }}>
          <div>
            <h2 style={{ fontSize: '1.25rem', color: '#0f172a', margin: 0, fontWeight: 700 }}>Análise de Trabalho</h2>
            <p style={{ color: '#64748b', margin: '0.25rem 0 0 0', fontSize: '0.875rem' }}>Revise as informações antes de dar seu parecer.</p>
          </div>
          <button 
            onClick={onClose}
            style={{ 
              background: '#f1f5f9', border: 'none', width: '32px', height: '32px', 
              borderRadius: '50%', cursor: 'pointer', display: 'flex', alignItems: 'center', 
              justifyContent: 'center', fontSize: '1.25rem', color: '#64748b', transition: 'all 0.2s'
            }}
            onMouseOver={(e) => e.currentTarget.style.background = '#e2e8f0'}
            onMouseOut={(e) => e.currentTarget.style.background = '#f1f5f9'}
          >
            ✕
          </button>
        </div>

        {/* Content Container (Tabs + Content) */}
        <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          
          {/* Pill Tabs */}
          <div style={{
            display: 'inline-flex', background: '#f1f5f9', padding: '0.25rem', 
            borderRadius: '8px', alignSelf: 'flex-start', gap: '0.25rem'
          }}>
            <button 
              onClick={() => setActiveTab('info')}
              style={{
                padding: '0.5rem 1rem', border: 'none', borderRadius: '6px',
                background: activeTab === 'info' ? '#ffffff' : 'transparent',
                color: activeTab === 'info' ? '#0f172a' : '#64748b',
                boxShadow: activeTab === 'info' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem',
                fontSize: '0.875rem', transition: 'all 0.2s'
              }}
            >
              📄 Informações
            </button>
            <button 
              onClick={() => setActiveTab('history')}
              style={{
                padding: '0.5rem 1rem', border: 'none', borderRadius: '6px',
                background: activeTab === 'history' ? '#ffffff' : 'transparent',
                color: activeTab === 'history' ? '#0f172a' : '#64748b',
                boxShadow: activeTab === 'history' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem',
                fontSize: '0.875rem', transition: 'all 0.2s'
              }}
            >
              🕒 Histórico
              {work.evaluations && work.evaluations.length > 0 && (
                <span style={{ 
                  background: activeTab === 'history' ? '#e2e8f0' : '#cbd5e1', 
                  color: '#334155', padding: '0.1rem 0.4rem', borderRadius: '12px', 
                  fontSize: '0.7rem', marginLeft: '0.25rem' 
                }}>
                  {work.evaluations.length}
                </span>
              )}
            </button>
          </div>
          
          {/* TAB 1: INFORMAÇÕES */}
          {activeTab === 'info' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
              
              <div>
                <h3 style={{ fontSize: '1rem', color: '#64748b', margin: '0 0 1rem 0', display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 600 }}>
                  <span style={{ fontSize: '1.2rem' }}>👤</span> Informações Principais
                </h3>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                  {/* Título e Código */}
                  <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr', gap: '1rem' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: '#64748b', marginBottom: '0.25rem' }}>Código</label>
                      <div style={{ padding: '0.625rem 0.75rem', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '6px', fontSize: '0.875rem', color: '#0f172a', fontWeight: 600 }}>
                        {work.displayCode}
                      </div>
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: '#64748b', marginBottom: '0.25rem' }}>Título do Trabalho</label>
                      <div style={{ padding: '0.625rem 0.75rem', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '6px', fontSize: '0.875rem', color: '#0f172a' }}>
                        {work.title}
                      </div>
                    </div>
                  </div>

                  {/* Área e Modalidade */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: '#64748b', marginBottom: '0.25rem' }}>Área Temática</label>
                      <div style={{ padding: '0.625rem 0.75rem', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '6px', fontSize: '0.875rem', color: '#0f172a' }}>
                        {work.categoryArea}
                      </div>
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: '#64748b', marginBottom: '0.25rem' }}>Modalidade</label>
                      <div style={{ padding: '0.625rem 0.75rem', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '6px', fontSize: '0.875rem', color: '#0f172a' }}>
                        {work.modality}
                      </div>
                    </div>
                  </div>

                  {/* Resumo */}
                  <div>
                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: '#64748b', marginBottom: '0.25rem' }}>Resumo</label>
                    <div style={{ padding: '0.75rem', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '6px', fontSize: '0.875rem', color: '#334155', lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>
                      {work.abstract}
                    </div>
                  </div>
                </div>
              </div>

              {/* Anexos */}
              <div style={{ paddingTop: '1.5rem', borderTop: '1px solid #f1f5f9' }}>
                <h3 style={{ fontSize: '1rem', color: '#64748b', margin: '0 0 1rem 0', display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 600 }}>
                  <span style={{ fontSize: '1.2rem' }}>📎</span> Arquivos Anexados
                </h3>
                
                <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                  {work.unidentifiedFileUrl && (
                    <a href={work.unidentifiedFileUrl} target="_blank" rel="noopener noreferrer" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 1rem', background: '#f8fafc', color: '#475569', border: '1px solid #e2e8f0', textDecoration: 'none', borderRadius: '6px', fontWeight: 500, fontSize: '0.875rem', transition: 'all 0.2s' }}>
                      <span style={{ color: '#ef4444' }}>📄</span> Trabalho Não Identificado
                    </a>
                  )}
                  {work.enrollmentProofUrl && (
                    <a href={work.enrollmentProofUrl} target="_blank" rel="noopener noreferrer" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 1rem', background: '#f8fafc', color: '#475569', border: '1px solid #e2e8f0', textDecoration: 'none', borderRadius: '6px', fontWeight: 500, fontSize: '0.875rem', transition: 'all 0.2s' }}>
                      <span style={{ color: '#3b82f6' }}>📎</span> Comprovante de Matrícula
                    </a>
                  )}
                </div>
              </div>

            </div>
          )}

          {/* TAB 2: HISTÓRICO */}
          {activeTab === 'history' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <h3 style={{ fontSize: '1rem', color: '#64748b', margin: '0 0 0.5rem 0', display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 600 }}>
                <span style={{ fontSize: '1.2rem' }}>🕒</span> Linha do Tempo
              </h3>
              
              {work.evaluations && work.evaluations.length > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {work.evaluations.map((evalRecord: any, idx: number) => {
                    const evalName = evalRecord.evaluator.participant?.fullName || evalRecord.evaluator.email;
                    return (
                      <div key={evalRecord.id} style={{ background: '#f8fafc', border: '1px solid #e2e8f0', padding: '1.25rem', borderRadius: '8px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                            <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: '#e2e8f0', color: '#475569', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '0.75rem' }}>
                              {evalName.charAt(0).toUpperCase()}
                            </div>
                            <strong style={{ color: '#0f172a', fontSize: '0.875rem' }}>{evalName}</strong>
                          </div>
                          <span style={{ fontSize: '0.75rem', color: '#64748b' }}>
                            {new Date(evalRecord.createdAt).toLocaleString('pt-BR')}
                          </span>
                        </div>
                        <div style={{ marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <span style={{ fontSize: '0.875rem', color: '#64748b' }}>Decisão:</span> 
                          {getStatusBadge(evalRecord.status)}
                        </div>
                        {evalRecord.comments && (
                          <div style={{ background: '#ffffff', padding: '0.75rem 1rem', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
                            <p style={{ fontSize: '0.875rem', color: '#334155', margin: 0, whiteSpace: 'pre-wrap', lineHeight: 1.5 }}>
                              {evalRecord.comments}
                            </p>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div style={{ padding: '3rem 1.5rem', borderRadius: '8px', border: '1px dashed #cbd5e1', textAlign: 'center', color: '#64748b' }}>
                  <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>📭</div>
                  <h4 style={{ margin: '0 0 0.25rem 0', color: '#334155' }}>Nenhuma avaliação registrada</h4>
                  <p style={{ margin: 0, fontSize: '0.875rem' }}>Este trabalho ainda não recebeu pareceres da comissão.</p>
                </div>
              )}
            </div>
          )}
          
          {/* Evaluation Form (Always visible below content) */}
          <div style={{ background: '#f8fafc', padding: '1.5rem', borderRadius: '8px', border: '1px solid #e2e8f0', marginTop: '1rem' }}>
            <h3 style={{ fontSize: '1rem', color: '#64748b', margin: '0 0 1rem 0', display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 600 }}>
              <span style={{ fontSize: '1.2rem' }}>✍️</span> Parecer da Comissão
            </h3>
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
    const codeMatch = work.displayCode?.toLowerCase().includes(searchLower);
    return titleMatch || codeMatch;
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
              <th style={{ width: '12%' }}>Código</th>
              <th style={{ width: '30%' }}>Título</th>
              <th style={{ width: '25%' }}>Área Temática</th>
              <th style={{ width: '15%' }}>Último Avaliador</th>
              <th style={{ width: '18%' }}>Status</th>
            </tr>
          </thead>
          <tbody>
            {paginatedWorks.length === 0 && (
              <tr>
                <td colSpan={5} style={{ textAlign: 'center', color: 'var(--color-text-secondary)', padding: '2rem' }}>
                  Nenhum trabalho encontrado.
                </td>
              </tr>
            )}
            {paginatedWorks.map(work => {
              const lastEval = work.evaluations?.[0];
              const evaluatorName = lastEval ? (lastEval.evaluator.participant?.fullName || lastEval.evaluator.email) : 'Nenhum';
              
              return (
              <tr 
                key={work.id} 
                onClick={() => setSelectedWork(work)}
                style={{ cursor: 'pointer' }}
                title="Clique na linha para avaliar"
                className={styles.tableRowHover}
              >
                <td><strong style={{ color: 'var(--color-primary)' }}>{work.displayCode}</strong></td>
                <td style={{ fontWeight: 500, maxWidth: '250px' }}>
                  <div style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {work.title}
                  </div>
                </td>
                <td>{work.categoryArea}</td>
                <td>{evaluatorName}</td>
                <td>{getStatusBadge(work.status)}</td>
              </tr>
            )})}
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
