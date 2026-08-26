'use client';

import React, { useEffect, useState, useTransition } from 'react';
import { googleLogin } from '@/actions/auth';
import { useRouter } from 'next/navigation';

export function GoogleAuthButton({ label = 'Continuar com o Google' }: { label?: string }) {
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  useEffect(() => {
    // Initialize Google Identity Services
    if (typeof window !== 'undefined' && (window as any).google) {
      (window as any).google.accounts.id.initialize({
        client_id: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID,
        callback: handleCredentialResponse,
      });

      (window as any).google.accounts.id.renderButton(
        document.getElementById('google-button-container'),
        { theme: 'outline', size: 'large', width: '100%', text: 'continue_with' }
      );
    }
  }, []);

  const handleCredentialResponse = (response: any) => {
    setError(null);
    startTransition(async () => {
      const result = await googleLogin(response.credential);
      if (result?.error) {
        setError(result.error);
      } else {
        router.push('/area-participante');
      }
    });
  };

  return (
    <div style={{ width: '100%', marginBottom: '1.5rem' }}>
      {error && (
        <div style={{ 
          padding: '0.75rem', 
          backgroundColor: '#fee2e2', 
          color: '#b91c1c', 
          borderRadius: '0.375rem', 
          marginBottom: '1rem',
          fontSize: '0.875rem'
        }}>
          {error}
        </div>
      )}
      
      <div 
        id="google-button-container" 
        style={{ 
          display: 'flex', 
          justifyContent: 'center', 
          width: '100%',
          opacity: isPending ? 0.5 : 1,
          pointerEvents: isPending ? 'none' : 'auto'
        }}
      >
        {/* Google button will be rendered here */}
      </div>

      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        margin: '1.5rem 0', 
        color: '#6b7280', 
        fontSize: '0.875rem' 
      }}>
        <div style={{ flex: 1, height: '1px', backgroundColor: '#e5e7eb' }}></div>
        <span style={{ padding: '0 0.75rem' }}>ou continue com e-mail</span>
        <div style={{ flex: 1, height: '1px', backgroundColor: '#e5e7eb' }}></div>
      </div>
    </div>
  );
}
