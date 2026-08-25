'use client';

import React, { useState, useTransition } from 'react';
import { Button } from '@/components/ui/Button/Button';
import { evaluateWork } from '@/actions/committee';

export function EvaluationForm({ workId, currentStatus, currentComments, onSuccess }: { workId: string, currentStatus: string, currentComments: string, onSuccess?: () => void }) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState('');
  const [decision, setDecision] = useState<'APPROVE' | 'REJECT' | 'REVISION' | ''>('');
  
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    
    if (!decision) {
      setError('Selecione uma decisão (Aprovar, Reprovar ou Ressalva).');
      return;
    }
    
    const formData = new FormData(e.currentTarget);
    formData.append('workId', workId);
    formData.append('decision', decision);
    
    startTransition(async () => {
      const result = await evaluateWork(formData);
      if (result?.error) {
        setError(result.error);
      } else if (result?.success) {
        onSuccess?.();
      }
    });
  };

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      {error && (
        <div style={{ padding: '1rem', background: 'rgba(220, 38, 38, 0.1)', color: 'var(--color-danger)', borderRadius: 'var(--radius-md)', fontSize: 'var(--font-size-sm)' }}>
          {error}
        </div>
      )}
      
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        <label style={{ fontSize: 'var(--font-size-sm)', fontWeight: 600, color: 'var(--color-text-secondary)' }}>
          Decisão
        </label>
        
        <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
          <input 
            type="radio" 
            name="decisionRadio" 
            checked={decision === 'APPROVE'} 
            onChange={() => setDecision('APPROVE')}
          />
          <span style={{ color: 'var(--color-success)', fontWeight: 500 }}>Aprovar</span>
        </label>
        
        <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
          <input 
            type="radio" 
            name="decisionRadio" 
            checked={decision === 'REVISION'} 
            onChange={() => setDecision('REVISION')}
          />
          <span style={{ color: 'var(--color-warning)', fontWeight: 500 }}>Aprovar com Ressalva</span>
        </label>
        
        <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
          <input 
            type="radio" 
            name="decisionRadio" 
            checked={decision === 'REJECT'} 
            onChange={() => setDecision('REJECT')}
          />
          <span style={{ color: 'var(--color-danger)', fontWeight: 500 }}>Reprovar</span>
        </label>
      </div>
      
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginTop: '1rem' }}>
        <label style={{ fontSize: 'var(--font-size-sm)', fontWeight: 600, color: 'var(--color-text-secondary)' }}>
          Parecer (Obrigatório em caso de ressalva)
        </label>
        <textarea 
          name="comments"
          defaultValue={currentComments}
          placeholder="Escreva seu feedback aqui para o aluno caso seja necessário corrigir algo..."
          style={{
            minHeight: '120px',
            padding: '0.75rem',
            border: '1px solid var(--color-border)',
            borderRadius: 'var(--radius-md)',
            resize: 'vertical',
            fontFamily: 'inherit'
          }}
        />
      </div>
      
      <div style={{ marginTop: '1rem' }}>
        <Button variant="primary" type="submit" loading={isPending} fullWidth>
          Confirmar Avaliação
        </Button>
      </div>
    </form>
  );
}
