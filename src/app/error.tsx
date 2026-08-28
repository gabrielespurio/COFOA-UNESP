'use client';

import { useEffect } from 'react';

export default function RootError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // If the error is a chunk load error or network error during navigation,
    // the safest and best UX is to hard reload the window to fetch the new JS chunks from the new deployment.
    const isChunkLoadError = error?.message?.toLowerCase().includes('fetch') || 
                             error?.message?.toLowerCase().includes('load') ||
                             error?.message?.toLowerCase().includes('chunk') ||
                             error?.message?.toLowerCase().includes('failed to fetch');
                             
    if (isChunkLoadError) {
      window.location.reload();
    } else {
      console.error('Unhandled Root Error:', error);
    }
  }, [error]);

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      minHeight: '100vh',
      padding: '2rem',
      backgroundColor: '#f8fafc',
      fontFamily: 'system-ui, -apple-system, sans-serif'
    }}>
      <h2 style={{ fontSize: '1.5rem', color: '#1e293b', marginBottom: '1rem' }}>
        A página foi atualizada
      </h2>
      <p style={{ color: '#64748b', marginBottom: '1.5rem', textAlign: 'center' }}>
        Lançamos uma nova versão do sistema. Atualizando para você...
      </p>
      <button
        onClick={() => window.location.reload()}
        style={{
          padding: '0.75rem 1.5rem',
          backgroundColor: '#2e4a8a',
          color: 'white',
          border: 'none',
          borderRadius: '0.5rem',
          cursor: 'pointer',
          fontWeight: '500'
        }}
      >
        Recarregar Página
      </button>
    </div>
  );
}
