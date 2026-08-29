'use client';

import React, { useEffect, useRef, useState, useTransition, useCallback } from 'react';
import { googleLogin } from '@/actions/auth';
import { useRouter } from 'next/navigation';
import Script from 'next/script';

export function GoogleAuthButton({ clientId }: { clientId?: string }) {
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();
  const containerRef = useRef<HTMLDivElement>(null);

  // Hardcoded fallback
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
          router.push(result.redirectUrl || '/area-participante');
        }
      } catch {
        setError('Erro ao processar login com Google.');
      }
    });
  }, [router]);

  const initGoogle = useCallback(() => {
    let attempts = 0;
    
    const tryInit = () => {
      attempts++;
      if (typeof window === 'undefined') return;
      
      const google = (window as any).google;
      
      if (google && google.accounts && containerRef.current && effectiveClientId) {
        try {
          google.accounts.id.initialize({
            client_id: effectiveClientId,
            callback: handleCredentialResponse,
          });

          google.accounts.id.renderButton(
            containerRef.current,
            { theme: 'outline', size: 'large', text: 'continue_with' }
          );
        } catch (err) {
          console.error('Error rendering Google Auth Button:', err);
        }
      } else if (attempts < 10) {
        // Poll every 300ms up to 10 times (3 seconds total)
        setTimeout(tryInit, 300);
      }
    };
    
    // Start polling immediately
    tryInit();
  }, [effectiveClientId, handleCredentialResponse]);

  if (!effectiveClientId) {
    return null;
  }

  return (
    <div style={{ width: '100%', marginBottom: '1.5rem' }}>
      {/* Load the script safely using Next.js Script. onReady fires when script is loaded AND when component mounts if already loaded */}
      <Script 
        src="https://accounts.google.com/gsi/client" 
        strategy="afterInteractive" 
        onReady={initGoogle}
      />
      
      {error && (
        <div style={{ 
          padding: '0.75rem', 
          backgroundColor: '#fee2e2', 
          color: '#b91c1c', 
          borderRadius: '0.375rem', 
          marginBottom: '1rem',
          fontSize: '0.875rem',
          textAlign: 'center'
        }}>
          {error}
        </div>
      )}
      
      <div style={{ 
          display: 'flex', 
          justifyContent: 'center', 
          width: '100%',
          minHeight: '44px',
          opacity: isPending ? 0.5 : 1,
          pointerEvents: isPending ? 'none' : 'auto'
      }}>
        {/* The container for the JavaScript API */}
        <div ref={containerRef}></div>
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
