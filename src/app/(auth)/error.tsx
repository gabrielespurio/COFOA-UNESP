'use client';

import React, { useEffect } from 'react';

export default function AuthError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Auth Error Boundary caught:', error);
  }, [error]);

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      textAlign: 'center',
      padding: '2rem',
      gap: '1rem',
    }}>
      <h2 style={{ fontSize: '1.25rem', color: '#1e293b' }}>
        Erro ao carregar a página
      </h2>
      <p style={{ color: '#64748b', fontSize: '0.875rem' }}>
        Ocorreu um erro inesperado. Tente novamente.
      </p>
      {error?.message && (
        <div style={{
          padding: '0.5rem 0.75rem',
          backgroundColor: '#fef2f2',
          border: '1px solid #fee2e2',
          borderRadius: '0.375rem',
          color: '#b91c1c',
          fontSize: '0.8rem',
          maxWidth: '320px',
          wordBreak: 'break-word',
        }}>
          {error.message}
        </div>
      )}
      <button
        onClick={() => reset()}
        style={{
          padding: '0.5rem 1.25rem',
          backgroundColor: '#2e4a8a',
          color: 'white',
          border: 'none',
          borderRadius: '0.375rem',
          cursor: 'pointer',
          fontSize: '0.875rem',
        }}
      >
        Tentar novamente
      </button>
    </div>
  );
}
