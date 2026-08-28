'use client';

import React, { useEffect, useRef, useState, useTransition, useCallback } from 'react';
import { googleLogin } from '@/actions/auth';
import { useRouter } from 'next/navigation';

export function GoogleAuthButton({ clientId }: { clientId?: string }) {
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();
  const containerRef = useRef<HTMLDivElement>(null);
  const initializedRef = useRef(false);

  // Use the prop, fallback to process.env, or fallback to hardcoded string to bypass Hostinger issues
  const hardcodedClientId = '983276458416-m64bek5v62srvphkudldp84ikm64gabn.apps.googleusercontent.com';
  const effectiveClientId = clientId || process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || hardcodedClientId;

  const handleCredentialResponse = useCallback((response: any) => {
    setError(null);
    startTransition(async () => {
      try {
        const result = await googleLogin(response.credential);
        if (result?.error) {
          setError(result.error);
        } else {
          router.push('/area-participante');
        }
      } catch {
        setError('Erro ao processar login com Google.');
      }
    });
  }, [router]);

  useEffect(() => {
    // Don't render Google button if no client ID is configured
    if (!effectiveClientId) {
      return;
    }

    // Prevent double initialization
    if (initializedRef.current) {
      return;
    }

    const initGoogle = () => {
      try {
        const google = (window as any).google;
        if (!google || !containerRef.current) return;

        initializedRef.current = true;

        google.accounts.id.initialize({
          client_id: effectiveClientId,
          callback: handleCredentialResponse,
        });

        google.accounts.id.renderButton(
          containerRef.current,
          { theme: 'outline', size: 'large', width: '100%', text: 'continue_with' }
        );
      } catch (err) {
        console.error('Error initializing Google Auth:', err);
      }
    };

    // If the Google script is already loaded, initialize immediately
    if ((window as any).google?.accounts) {
      initGoogle();
      return;
    }

    // Otherwise, load the script manually via DOM
    const existingScript = document.querySelector('script[src="https://accounts.google.com/gsi/client"]');
    if (!existingScript) {
      const script = document.createElement('script');
      script.src = 'https://accounts.google.com/gsi/client';
      script.async = true;
      script.defer = true;
      script.onload = initGoogle;
      script.onerror = () => {
        console.error('Failed to load Google Identity Services script');
      };
      document.head.appendChild(script);
    } else {
      // Script element exists but might not be loaded yet
      existingScript.addEventListener('load', initGoogle);
    }
  }, [handleCredentialResponse, effectiveClientId]);

  // If no Google Client ID, don't render anything related to Google
  if (!effectiveClientId) {
    return null;
  }

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
        ref={containerRef}
        style={{ 
          display: 'flex', 
          justifyContent: 'center', 
          width: '100%',
          minHeight: '44px',
          opacity: isPending ? 0.5 : 1,
          pointerEvents: isPending ? 'none' : 'auto'
        }}
      />

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
