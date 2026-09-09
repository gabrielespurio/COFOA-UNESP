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
      position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.6)', 
      backdropFilter: 'blur(4px)', zIndex: 100, display: 'flex', 
      alignItems: 'center', justifyContent: 'center', padding: '1rem'
    }}>
      <div style={{
        background: 'var(--color-surface)', width: '100%', maxWidth: '900px', 
        maxHeight: '90vh', overflowY: 'auto', borderRadius: 'var(--radius-lg)', 
        boxShadow: 'var(--shadow-lg)', display: 'flex', flexDirection: 'column'
      }}>
        {/* Header */}
        <div style={{ 
          padding: '1.5rem 1.5rem 0.5rem 1.5rem', 
          display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start',
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

        {/* Tabs */}
        <div style={{
          display: 'flex', gap: '2rem', padding: '0 1.5rem',
          borderBottom: '1px solid var(--color-border)',
          background: 'var(--color-surface)',
          position: 'sticky', top: '80px', zIndex: 9
        }}>
          <button 
            onClick={() => setActiveTab('info')}
            style={{
              padding: '1rem 0', background: 'transparent', border: 'none',
              borderBottom: activeTab === 'info' ? '3px solid var(--color-primary)' : '3px solid transparent',
              color: activeTab === 'info' ? 'var(--color-primary-dark)' : 'var(--color-text-secondary)',
              fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem',
              transition: 'all 0.2s', fontSize: '1rem'
            }}
          >
            📄 Informações do Trabalho
          </button>
          <button 
            onClick={() => setActiveTab('history')}
            style={{
              padding: '1rem 0', background: 'transparent', border: 'none',
              borderBottom: activeTab === 'history' ? '3px solid var(--color-primary)' : '3px solid transparent',
              color: activeTab === 'history' ? 'var(--color-primary-dark)' : 'var(--color-text-secondary)',
              fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem',
              transition: 'all 0.2s', fontSize: '1rem'
            }}
          >
            🕒 Histórico de Avaliações
            {work.evaluations && work.evaluations.length > 0 && (
              <span style={{ 
                background: activeTab === 'history' ? 'var(--color-primary)' : 'var(--color-border)', 
                color: activeTab === 'history' ? 'white' : 'var(--color-text-secondary)', 
                padding: '0.1rem 0.5rem', borderRadius: '12px', fontSize: '0.75rem', marginLeft: '0.25rem' 
              }}>
                {work.evaluations.length}
              </span>
            )}
          </button>
        </div>
        
        {/* Content Container */}
        <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '2rem', background: 'var(--color-surface-alt)' }}>
          
          {/* TAB 1: INFORMAÇÕES */}
          {activeTab === 'info' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <div style={{ background: 'white', padding: '1.5rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap', marginBottom: '1rem' }}>
                  <span style={{ padding: '0.25rem 0.5rem', background: 'var(--color-primary-light)', color: 'var(--color-primary-dark)', fontSize: '0.875rem', fontWeight: 600, borderRadius: 'var(--radius-sm)' }}>
                    {work.displayCode}
                  </span>
                  <h3 style={{ fontSize: '1.25rem', color: 'var(--color-primary-dark)', margin: 0 }}>{work.title}</h3>
                </div>
                
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', background: 'var(--color-surface-alt)', padding: '1rem', borderRadius: 'var(--radius-sm)' }}>
                  <div style={{ fontSize: '0.875rem' }}><span style={{ color: 'var(--color-text-secondary)', display: 'block', marginBottom: '0.25rem' }}>Área Temática</span> <strong>{work.categoryArea}</strong></div>
                  <div style={{ fontSize: '0.875rem' }}><span style={{ color: 'var(--color-text-secondary)', display: 'block', marginBottom: '0.25rem' }}>Modalidade</span> <strong>{work.modality}</strong></div>
                </div>
              </div>

              <div style={{ background: 'white', padding: '1.5rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)' }}>
                <h4 style={{ fontSize: '1rem', color: 'var(--color-primary-dark)', margin: '0 0 1rem 0', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  Resumo
                </h4>
                <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.875rem', lineHeight: 1.6, whiteSpace: 'pre-wrap', margin: 0 }}>{work.abstract}</p>
              </div>

              <div style={{ background: 'white', padding: '1.5rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)' }}>
                <h4 style={{ fontSize: '1rem', color: 'var(--color-primary-dark)', margin: '0 0 1rem 0', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  Arquivos Anexados
                </h4>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1rem' }}>
                  {work.identifiedFileUrl && (
                    <a href={work.identifiedFileUrl} target="_blank" rel="noopener noreferrer" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0.75rem 1rem', background: 'var(--color-primary-light)', color: 'var(--color-primary-dark)', border: '1px solid var(--color-primary)', textDecoration: 'none', borderRadius: 'var(--radius-md)', fontWeight: 600, transition: 'all 0.2s' }}>
                      📄 Trabalho Identificado
                    </a>
                  )}
                  {work.unidentifiedFileUrl && (
                    <a href={work.unidentifiedFileUrl} target="_blank" rel="noopener noreferrer" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0.75rem 1rem', background: 'var(--color-primary-light)', color: 'var(--color-primary-dark)', border: '1px solid var(--color-primary)', textDecoration: 'none', borderRadius: 'var(--radius-md)', fontWeight: 600, transition: 'all 0.2s' }}>
                      📄 Trabalho Não Identificado
                    </a>
                  )}
                  {work.enrollmentProofUrl && (
                    <a href={work.enrollmentProofUrl} target="_blank" rel="noopener noreferrer" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0.75rem 1rem', background: 'var(--color-surface-alt)', color: 'var(--color-text-primary)', border: '1px solid var(--color-border)', textDecoration: 'none', borderRadius: 'var(--radius-md)', fontWeight: 600, transition: 'all 0.2s' }}>
                      📎 Comprovante de Matrícula
                    </a>
                  )}
                  {work.requiresEthics && work.ethicsCommitteeFileUrl && (
                    <a href={work.ethicsCommitteeFileUrl} target="_blank" rel="noopener noreferrer" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0.75rem 1rem', background: 'var(--color-surface-alt)', color: 'var(--color-text-primary)', border: '1px solid var(--color-border)', textDecoration: 'none', borderRadius: 'var(--radius-md)', fontWeight: 600, transition: 'all 0.2s' }}>
                      📎 Comitê de Ética
                    </a>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: HISTÓRICO */}
          {activeTab === 'history' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              {work.evaluations && work.evaluations.length > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {work.evaluations.map((evalRecord: any, idx: number) => {
                    const evalName = evalRecord.evaluator.participant?.fullName || evalRecord.evaluator.email;
                    return (
                      <div key={evalRecord.id} style={{ background: 'white', border: '1px solid var(--color-border)', padding: '1.5rem', borderRadius: 'var(--radius-md)', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', borderBottom: '1px solid var(--color-border)', paddingBottom: '0.75rem' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                            <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'var(--color-primary-light)', color: 'var(--color-primary-dark)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>
                              {evalName.charAt(0).toUpperCase()}
                            </div>
                            <strong style={{ color: 'var(--color-primary-dark)' }}>{evalName}</strong>
                          </div>
                          <span style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)', background: 'var(--color-surface-alt)', padding: '0.25rem 0.5rem', borderRadius: 'var(--radius-sm)' }}>
                            {new Date(evalRecord.createdAt).toLocaleString('pt-BR')}
                          </span>
                        </div>
                        <div style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <span style={{ fontSize: '0.875rem', color: 'var(--color-text-secondary)' }}>Decisão:</span> 
                          {getStatusBadge(evalRecord.status)}
                        </div>
                        {evalRecord.comments && (
                          <div style={{ background: 'var(--color-surface-alt)', padding: '1rem', borderRadius: 'var(--radius-md)', borderLeft: '3px solid var(--color-primary)' }}>
                            <p style={{ fontSize: '0.875rem', color: 'var(--color-text-primary)', margin: 0, whiteSpace: 'pre-wrap', lineHeight: 1.5 }}>
                              {evalRecord.comments}
                            </p>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div style={{ background: 'white', padding: '3rem 1.5rem', borderRadius: 'var(--radius-md)', border: '1px dashed var(--color-border)', textAlign: 'center', color: 'var(--color-text-secondary)' }}>
                  <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>📭</div>
                  <h4 style={{ margin: '0 0 0.5rem 0', color: 'var(--color-primary-dark)' }}>Nenhuma avaliação registrada</h4>
                  <p style={{ margin: 0, fontSize: '0.875rem' }}>Este trabalho ainda não recebeu pareceres da comissão.</p>
                </div>
              )}
            </div>
          )}
          
          {/* Evaluation Form (Always visible below content) */}
          <div style={{ background: 'white', padding: '1.5rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}>
            <h3 style={{ fontSize: '1.25rem', color: 'var(--color-primary-dark)', margin: '0 0 1.5rem 0', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              ✍️ Parecer da Comissão
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
              <th>Código</th>
              <th>Título</th>
              <th>Área Temática</th>
              <th>Último Avaliador</th>
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
