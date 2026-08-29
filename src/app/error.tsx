'use client';

import { useEffect } from 'react';

export default function RootError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const isChunkLoadError = error?.message?.toLowerCase().includes('fetch') || 
                           error?.message?.toLowerCase().includes('load') ||
                           error?.message?.toLowerCase().includes('chunk') ||
                           error?.message?.toLowerCase().includes('failed to fetch');

  useEffect(() => {
    // If the error is a chunk load error or network error during navigation,
    // the safest and best UX is to hard reload the window to fetch the new JS chunks from the new deployment.
    if (isChunkLoadError) {
      window.location.reload();
    } else {
      console.error('Unhandled Root Error:', error);
    }
  }, [error, isChunkLoadError]);

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
        {isChunkLoadError ? 'A página foi atualizada' : 'Ocorreu um erro inesperado'}
      </h2>
      <p style={{ color: '#64748b', marginBottom: '1.5rem', textAlign: 'center', maxWidth: '600px' }}>
        {isChunkLoadError 
          ? 'Lançamos uma nova versão do sistema. Atualizando para você...' 
          : `Detalhes: ${error?.message || 'Erro desconhecido.'}`}
      </p>
      <button
        onClick={() => isChunkLoadError ? window.location.reload() : reset()}
        style={{
          padding: '0.75rem 1.5rem',
          backgroundColor: '#2e4a8a',
          color: 'white',
          border: 'none',
          borderRadius: '0.5rem',
          cursor: 'pointer',
          fontWeight: '500',
          marginBottom: '1rem'
        }}
      >
        {isChunkLoadError ? 'Recarregar Página' : 'Tentar Novamente'}
      </button>
      {!isChunkLoadError && (
        <button
          onClick={() => window.location.reload()}
          style={{
            padding: '0.75rem 1.5rem',
            backgroundColor: 'transparent',
            color: '#2e4a8a',
            border: '1px solid #2e4a8a',
            borderRadius: '0.5rem',
            cursor: 'pointer',
            fontWeight: '500'
          }}
        >
          Forçar Recarregamento
        </button>
      )}
    </div>
  );
}
