'use client';

import { useState } from 'react';
import { setSimulatedDate } from '@/actions/timeTravel';

export function TimeTravelDebugger({ initialDate }: { initialDate: string | null }) {
  const [date, setDate] = useState(initialDate ? initialDate.split('T')[0] : '');
  const [isOpen, setIsOpen] = useState(false);

  // Ocultar em produção caso suba por acidente (apenas uma proteção extra, embora não deva ir pra prd)
  if (process.env.NODE_ENV === 'production') return null;

  if (!isOpen) {
    return (
      <button 
        onClick={() => setIsOpen(true)}
        style={{
          position: 'fixed', bottom: '1rem', right: '1rem', zIndex: 9999,
          background: '#000', color: '#fff', padding: '0.5rem 1rem',
          borderRadius: '9999px', fontSize: '0.75rem', fontWeight: 'bold'
        }}
      >
        ⏱️ Viagem no Tempo
      </button>
    );
  }

  return (
    <div style={{
      position: 'fixed', bottom: '1rem', right: '1rem', zIndex: 9999,
      background: '#fff', border: '1px solid #ccc', padding: '1rem',
      borderRadius: '8px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
      display: 'flex', flexDirection: 'column', gap: '0.5rem'
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <strong>Simular Data</strong>
        <button onClick={() => setIsOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>✖</button>
      </div>
      <input 
        type="date" 
        value={date}
        onChange={(e) => setDate(e.target.value)}
        style={{ padding: '0.25rem', border: '1px solid #ccc' }}
      />
      <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
        <button 
          onClick={async () => {
            if (date) {
              await setSimulatedDate(`${date}T12:00:00-03:00`);
              window.location.reload();
            }
          }}
          style={{ background: 'var(--color-primary)', color: '#fff', padding: '0.25rem 0.5rem', borderRadius: '4px', border: 'none', cursor: 'pointer' }}
        >
          Aplicar
        </button>
        <button 
          onClick={async () => {
            setDate('');
            await setSimulatedDate(null);
            window.location.reload();
          }}
          style={{ background: '#eee', color: '#333', padding: '0.25rem 0.5rem', borderRadius: '4px', border: 'none', cursor: 'pointer' }}
        >
          Resetar
        </button>
      </div>
    </div>
  );
}
