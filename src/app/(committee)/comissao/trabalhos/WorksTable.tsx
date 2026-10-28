'use client';

import React, { useState, useEffect } from 'react';
import { Badge } from '@/components/ui/Badge/Badge';
import { EvaluationForm } from './EvaluationForm';
import { useRouter } from 'next/navigation';
import { lockWork, unlockWork, toggleWorkSpreadsheetCheck } from '@/actions/committee';
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

function WorkEvaluationModal({ 
  work, 
  onClose,
  isCommissionMaster = false,
  onToggleCheck
}: { 
  work: any; 
  onClose: () => void;
  isCommissionMaster?: boolean;
  onToggleCheck?: (workId: string) => void;
}) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'info' | 'history'>('info');

  let parsedAuthors: any[] = [];
  try {
    if (typeof work.authors === 'string') {
      parsedAuthors = JSON.parse(work.authors);
    } else if (Array.isArray(work.authors)) {
      parsedAuthors = work.authors;
    }
  } catch (e) {
    parsedAuthors = [];
  }

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

                {isCommissionMaster && (
                  <div style={{ padding: '1rem', background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '8px', marginBottom: '1.25rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                      <span style={{ color: '#166534', fontWeight: 700, fontSize: '0.875rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        👥 Identificação do Trabalho (Exclusivo Comissão)
                      </span>
                      {onToggleCheck && (
                        <button
                          type="button"
                          onClick={() => onToggleCheck(work.id)}
                          style={{
                            padding: '0.4rem 0.85rem',
                            borderRadius: '6px',
                            border: work.spreadsheetChecked ? '1px solid #10b981' : '1px solid #fdba74',
                            background: work.spreadsheetChecked ? '#10b981' : '#ffedd5',
                            color: work.spreadsheetChecked ? '#ffffff' : '#9a3412',
                            fontWeight: 600,
                            fontSize: '0.75rem',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.35rem'
                          }}
                        >
                          {work.spreadsheetChecked ? '✓ Registrado na Planilha' : '○ Marcar na Planilha'}
                        </button>
                      )}
                    </div>
                    
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.75rem', fontSize: '0.8125rem' }}>
                      <div>
                        <strong style={{ color: '#15803d' }}>Apresentador: </strong>
                        <span style={{ color: '#1e293b' }}>{work.presenter || work.participant?.fullName || 'Não informado'}</span>
                      </div>
                      <div>
                        <strong style={{ color: '#15803d' }}>Orientador: </strong>
                        <span style={{ color: '#1e293b' }}>{work.advisor || 'Não informado'}</span>
                      </div>
                    </div>
                    {parsedAuthors.length > 0 && (
                      <div style={{ marginTop: '0.5rem', fontSize: '0.8125rem' }}>
                        <strong style={{ color: '#15803d' }}>Demais Autores: </strong>
                        <span style={{ color: '#334155' }}>
                          {parsedAuthors.map((a: any) => `${a.name}${a.institution ? ` (${a.institution})` : ''}`).join(', ')}
                        </span>
                      </div>
                    )}
                  </div>
                )}
                
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
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
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
                    <div>
                      <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: '#64748b', marginBottom: '0.25rem' }}>Aplica Trabalho de Ética?</label>
                      <div style={{ padding: '0.625rem 0.75rem', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '6px', fontSize: '0.875rem', color: '#0f172a' }}>
                        {work.requiresEthics ? 'Sim' : 'Não'}
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
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: '#64748b' }}>
                    <path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48"></path>
                  </svg> Arquivos Anexados
                </h3>
                
                <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                  {isCommissionMaster && work.identifiedFileUrl && (
                    <a href={work.identifiedFileUrl} target="_blank" rel="noopener noreferrer" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 1rem', background: '#ecfdf5', color: '#065f46', border: '1px solid #a7f3d0', textDecoration: 'none', borderRadius: '6px', fontWeight: 600, fontSize: '0.875rem', transition: 'all 0.2s' }}>
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: '#059669' }}>
                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                        <polyline points="14 2 14 8 20 8"></polyline>
                        <line x1="16" y1="13" x2="8" y2="13"></line>
                        <line x1="16" y1="17" x2="8" y2="17"></line>
                        <polyline points="10 9 9 9 8 9"></polyline>
                      </svg> Trabalho Identificado (PDF)
                    </a>
                  )}
                  {work.unidentifiedFileUrl && (
                    <a href={work.unidentifiedFileUrl} target="_blank" rel="noopener noreferrer" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 1rem', background: '#f8fafc', color: '#475569', border: '1px solid #e2e8f0', textDecoration: 'none', borderRadius: '6px', fontWeight: 500, fontSize: '0.875rem', transition: 'all 0.2s' }}>
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: '#ef4444' }}>
                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                        <polyline points="14 2 14 8 20 8"></polyline>
                        <line x1="16" y1="13" x2="8" y2="13"></line>
                        <line x1="16" y1="17" x2="8" y2="17"></line>
                        <polyline points="10 9 9 9 8 9"></polyline>
                      </svg> Trabalho Não Identificado
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

export function WorksTable({ 
  works, 
  currentUserId,
  isCommissionMaster = false
}: { 
  works: any[]; 
  currentUserId: string;
  isCommissionMaster?: boolean;
}) {
  const router = useRouter();
  const [worksList, setWorksList] = useState<any[]>(works);
  const [selectedWork, setSelectedWork] = useState<any | null>(null);
  const [isLocking, setIsLocking] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [sheetFilter, setSheetFilter] = useState<'all' | 'pending' | 'checked'>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    setWorksList(works);
  }, [works]);

  const handleToggleCheck = async (workId: string) => {
    setWorksList(prev => prev.map(w => {
      if (w.id === workId) {
        const next = !w.spreadsheetChecked;
        return {
          ...w,
          spreadsheetChecked: next,
          spreadsheetCheckedAt: next ? new Date().toISOString() : null
        };
      }
      return w;
    }));

    if (selectedWork && selectedWork.id === workId) {
      setSelectedWork((prev: any) => ({
        ...prev,
        spreadsheetChecked: !prev.spreadsheetChecked,
        spreadsheetCheckedAt: !prev.spreadsheetChecked ? new Date().toISOString() : null
      }));
    }

    try {
      const res = await toggleWorkSpreadsheetCheck(workId);
      if (res.error) {
        alert(res.error);
        router.refresh();
      }
    } catch (err) {
      alert('Erro ao atualizar checklist da planilha.');
      router.refresh();
    }
  };

  const pendingCount = worksList.filter(w => !w.spreadsheetChecked).length;
  const checkedCount = worksList.filter(w => w.spreadsheetChecked).length;

  // Filter works
  const filteredWorks = worksList.filter(work => {
    const searchLower = searchTerm.toLowerCase();
    const titleMatch = work.title?.toLowerCase().includes(searchLower);
    const codeMatch = work.displayCode?.toLowerCase().includes(searchLower);
    const areaMatch = work.categoryArea?.toLowerCase().includes(searchLower);
    const authorMatch = isCommissionMaster && (
      work.participant?.fullName?.toLowerCase().includes(searchLower) ||
      work.presenter?.toLowerCase().includes(searchLower) ||
      work.advisor?.toLowerCase().includes(searchLower) ||
      (typeof work.authors === 'string' && work.authors.toLowerCase().includes(searchLower))
    );
    const matchesSearch = titleMatch || codeMatch || areaMatch || authorMatch;

    if (isCommissionMaster) {
      if (sheetFilter === 'pending') return matchesSearch && !work.spreadsheetChecked;
      if (sheetFilter === 'checked') return matchesSearch && work.spreadsheetChecked;
    }

    return matchesSearch;
  });

  // Pagination
  const totalPages = Math.ceil(filteredWorks.length / itemsPerPage) || 1;
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedWorks = filteredWorks.slice(startIndex, startIndex + itemsPerPage);

  // Reset page when search or sheet filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, sheetFilter]);

  const handleRowClick = async (work: any) => {
    if (isLocking) return;
    
    const isLockedByOther = work.lockedById && work.lockedById !== currentUserId && work.lockedAt && new Date(work.lockedAt).getTime() > Date.now() - 60 * 60 * 1000;
    if (isLockedByOther) {
      alert('Este trabalho já está sendo avaliado por outro membro da comissão neste exato momento.');
      return;
    }
    
    setIsLocking(true);
    try {
      const res = await lockWork(work.id);
      if (res.error) {
        alert(res.error);
      } else {
        setSelectedWork(work);
      }
    } catch (err) {
      alert('Ocorreu um erro ao tentar acessar o trabalho.');
    } finally {
      setIsLocking(false);
    }
  };

  const handleCloseModal = async () => {
    if (selectedWork) {
      // Fire and forget unlock
      unlockWork(selectedWork.id).catch(console.error);
    }
    setSelectedWork(null);
  };

  return (
    <>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', gap: '1rem', flexWrap: 'wrap' }}>
        <input 
          type="text" 
          placeholder={isCommissionMaster ? "Buscar por código, título, área ou autor..." : "Buscar por código, título ou área..."} 
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

      {isCommissionMaster && (
        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.25rem', flexWrap: 'wrap', alignItems: 'center' }}>
          <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--color-text-secondary)', marginRight: '0.25rem' }}>
            Checklist Planilha:
          </span>
          <button
            type="button"
            onClick={() => setSheetFilter('all')}
            style={{
              padding: '0.35rem 0.75rem',
              borderRadius: '6px',
              border: sheetFilter === 'all' ? '1px solid #0f172a' : '1px solid #e2e8f0',
              background: sheetFilter === 'all' ? '#0f172a' : '#ffffff',
              color: sheetFilter === 'all' ? '#ffffff' : '#475569',
              fontWeight: 600,
              fontSize: '0.75rem',
              cursor: 'pointer',
              transition: 'all 0.15s ease'
            }}
          >
            Todos ({worksList.length})
          </button>
          <button
            type="button"
            onClick={() => setSheetFilter('pending')}
            style={{
              padding: '0.35rem 0.75rem',
              borderRadius: '6px',
              border: sheetFilter === 'pending' ? '1px solid #ea580c' : '1px solid #fed7aa',
              background: sheetFilter === 'pending' ? '#ea580c' : '#fff7ed',
              color: sheetFilter === 'pending' ? '#ffffff' : '#c2410c',
              fontWeight: 600,
              fontSize: '0.75rem',
              cursor: 'pointer',
              transition: 'all 0.15s ease'
            }}
          >
            ⏳ Pendentes na Planilha ({pendingCount})
          </button>
          <button
            type="button"
            onClick={() => setSheetFilter('checked')}
            style={{
              padding: '0.35rem 0.75rem',
              borderRadius: '6px',
              border: sheetFilter === 'checked' ? '1px solid #10b981' : '1px solid #bbf7d0',
              background: sheetFilter === 'checked' ? '#10b981' : '#f0fdf4',
              color: sheetFilter === 'checked' ? '#ffffff' : '#15803d',
              fontWeight: 600,
              fontSize: '0.75rem',
              cursor: 'pointer',
              transition: 'all 0.15s ease'
            }}
          >
            ✓ Registrados na Planilha ({checkedCount})
          </button>
        </div>
      )}

      <div className={styles.tableWrapper}>
        <table className={styles.table}>
          <thead>
            <tr>
              {isCommissionMaster && (
                <th style={{ width: '13%', textAlign: 'center' }}>Planilha</th>
              )}
              <th style={{ width: '12%' }}>Código</th>
              <th style={{ width: isCommissionMaster ? '27%' : '30%' }}>Título</th>
              <th style={{ width: isCommissionMaster ? '20%' : '25%' }}>Área Temática</th>
              <th style={{ width: isCommissionMaster ? '13%' : '15%' }}>Último Avaliador</th>
              <th style={{ width: '15%' }}>Status</th>
            </tr>
          </thead>
          <tbody>
            {paginatedWorks.length === 0 && (
              <tr>
                <td colSpan={isCommissionMaster ? 6 : 5} style={{ textAlign: 'center', color: 'var(--color-text-secondary)', padding: '2rem' }}>
                  Nenhum trabalho encontrado.
                </td>
              </tr>
            )}
            {paginatedWorks.map(work => {
              const lastEval = work.evaluations?.[0];
              const evaluatorName = lastEval ? (lastEval.evaluator.participant?.fullName || lastEval.evaluator.email) : 'Nenhum';
              const isLockedByOther = work.lockedById && work.lockedById !== currentUserId && work.lockedAt && new Date(work.lockedAt).getTime() > Date.now() - 60 * 60 * 1000;
              
              return (
              <tr 
                key={work.id} 
                onClick={() => handleRowClick(work)}
                style={{ 
                  cursor: isLockedByOther ? 'not-allowed' : (isLocking ? 'wait' : 'pointer'), 
                  opacity: isLockedByOther ? 0.6 : 1, 
                  background: isLockedByOther ? '#f8fafc' : 'inherit' 
                }}
                title={isLockedByOther ? "Sendo avaliado por outro membro" : "Clique na linha para avaliar"}
                className={isLockedByOther ? '' : styles.tableRowHover}
              >
                {isCommissionMaster && (
                  <td 
                    style={{ textAlign: 'center' }}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleToggleCheck(work.id);
                    }}
                  >
                    <button
                      type="button"
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.35rem',
                        padding: '0.35rem 0.65rem',
                        borderRadius: '9999px',
                        border: work.spreadsheetChecked ? '1px solid #10b981' : '1px solid #cbd5e1',
                        background: work.spreadsheetChecked ? '#ecfdf5' : '#f8fafc',
                        color: work.spreadsheetChecked ? '#065f46' : '#64748b',
                        fontWeight: 600,
                        fontSize: '0.75rem',
                        cursor: 'pointer',
                        transition: 'all 0.15s ease'
                      }}
                      title={work.spreadsheetChecked ? "Clique para desmarcar da planilha" : "Clique para marcar como registrado na planilha"}
                    >
                      <span style={{ fontSize: '0.85rem' }}>{work.spreadsheetChecked ? '✓' : '○'}</span>
                      {work.spreadsheetChecked ? 'Registrado' : 'Pendente'}
                    </button>
                  </td>
                )}
                <td><strong style={{ color: 'var(--color-primary)' }}>{work.displayCode}</strong></td>
                <td style={{ fontWeight: 500, maxWidth: '250px' }}>
                  <div style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {work.title}
                  </div>
                </td>
                <td>{work.categoryArea}</td>
                <td>{evaluatorName}</td>
                <td>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', alignItems: 'flex-start' }}>
                    {getStatusBadge(work.status)}
                    {isLockedByOther && (
                      <span style={{ fontSize: '0.7rem', color: '#64748b', display: 'flex', alignItems: 'center', gap: '0.25rem', fontWeight: 500 }}>
                        🔒 Em avaliação
                      </span>
                    )}
                  </div>
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
          onClose={handleCloseModal} 
          isCommissionMaster={isCommissionMaster}
          onToggleCheck={handleToggleCheck}
        />
      )}
    </>
  );
}
