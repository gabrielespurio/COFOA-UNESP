'use client';

import React, { useState } from 'react';
import { evaluateWorkStage1 } from '@/actions/admin';
import styles from '../page.module.css';

export function ScreeningForm({ workId, onSuccess }: { workId: string; onSuccess: () => void }) {
  const [loading, setLoading] = useState(false);
  const [decision, setDecision] = useState<'APPROVE' | 'REJECT' | ''>('');
  const [comments, setComments] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!decision) {
      setError('Selecione uma decisão (Aprovar ou Reprovar).');
      return;
    }
    if (decision === 'REJECT' && comments.trim().length === 0) {
      setError('Ao reprovar, é obrigatório preencher o motivo (parecer) para o autor.');
      return;
    }

    setLoading(true);
    setError(null);

    const formData = new FormData();
    formData.append('workId', workId);
    formData.append('decision', decision);
    formData.append('comments', comments);

    const res = await evaluateWorkStage1(formData);
    
    setLoading(false);
    
    if (res.error) {
      setError(res.error);
    } else {
      onSuccess();
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      
      {error && (
        <div style={{ padding: '0.75rem 1rem', background: '#fee2e2', color: '#b91c1c', borderRadius: '6px', fontSize: '0.875rem', fontWeight: 500 }}>
          {error}
        </div>
      )}

      {/* Decision Buttons */}
      <div>
        <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: '#334155', marginBottom: '0.5rem' }}>
          Decisão da Triagem <span style={{ color: '#ef4444' }}>*</span>
        </label>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <button
            type="button"
            onClick={() => { setDecision('APPROVE'); setError(null); }}
            style={{
              flex: 1, padding: '0.75rem', border: decision === 'APPROVE' ? '2px solid #10b981' : '1px solid #e2e8f0',
              background: decision === 'APPROVE' ? '#ecfdf5' : '#ffffff',
              color: decision === 'APPROVE' ? '#065f46' : '#64748b',
              borderRadius: '8px', cursor: 'pointer', fontWeight: 600,
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
              transition: 'all 0.2s'
            }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
            Aprovar (Ir para 2ª Etapa)
          </button>
          
          <button
            type="button"
            onClick={() => { setDecision('REJECT'); setError(null); }}
            style={{
              flex: 1, padding: '0.75rem', border: decision === 'REJECT' ? '2px solid #f59e0b' : '1px solid #e2e8f0',
              background: decision === 'REJECT' ? '#fffbeb' : '#ffffff',
              color: decision === 'REJECT' ? '#b45309' : '#64748b',
              borderRadius: '8px', cursor: 'pointer', fontWeight: 600,
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
              transition: 'all 0.2s'
            }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="7.86 2 16.14 2 22 7.86 22 16.14 16.14 22 7.86 22 2 16.14 2 7.86 7.86 2"></polygon><line x1="15" y1="9" x2="9" y2="15"></line><line x1="9" y1="9" x2="15" y2="15"></line></svg>
            Reprovar (Devolver ao Autor)
          </button>
        </div>
      </div>

      {/* Comments */}
      <div>
        <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: '#334155', marginBottom: '0.5rem' }}>
          Parecer (Motivo da Reprovação) {decision === 'REJECT' && <span style={{ color: '#ef4444' }}>*</span>}
        </label>
        <p style={{ margin: '0 0 0.5rem 0', fontSize: '0.75rem', color: '#64748b' }}>
          Obrigatório em caso de Reprovação. Este texto será visível para o autor, indicando o que ele precisa corrigir na documentação.
        </p>
        <textarea
          value={comments}
          onChange={(e) => setComments(e.target.value)}
          placeholder="Escreva os motivos da reprovação..."
          rows={5}
          style={{
            width: '100%', padding: '0.75rem', border: '1px solid #cbd5e1', 
            borderRadius: '8px', fontFamily: 'inherit', fontSize: '0.875rem', 
            resize: 'vertical', minHeight: '100px'
          }}
        />
      </div>

      <div style={{ display: 'flex', justifyContent: 'flex-end', paddingTop: '1rem', borderTop: '1px solid #e2e8f0' }}>
        <button
          type="submit"
          disabled={loading || !decision}
          style={{
            padding: '0.75rem 2rem', background: (loading || !decision) ? '#cbd5e1' : 'var(--color-primary)', 
            color: 'white', border: 'none', borderRadius: '8px', fontWeight: 600, 
            cursor: (loading || !decision) ? 'not-allowed' : 'pointer', transition: 'all 0.2s',
            boxShadow: (loading || !decision) ? 'none' : '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
          }}
        >
          {loading ? 'Salvando...' : 'Salvar Triagem'}
        </button>
      </div>

    </form>
  );
}
