'use client';

import React, { useEffect, useRef, useState, useTransition, useCallback } from 'react';
import { googleLogin } from '@/actions/auth';
import { useRouter } from 'next/navigation';

export function GoogleAuthButton({ clientId }: { clientId?: string }) {
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  // Hardcoded fallback
  const hardcodedClientId = '983276458416-m64bek5v62srvphkudldp84ikm64gabn.apps.googleusercontent.com';
  const effectiveClientId = clientId || process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || hardcodedClientId;

  useEffect(() => {
    // Setup the global callback for Google Identity Services
    (window as any).handleGoogleCredentialResponse = (response: any) => {
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
    };

    return () => {
      // Cleanup
      delete (window as any).handleGoogleCredentialResponse;
    };
  }, [router]);

  if (!effectiveClientId) {
    return null;
  }

  return (
    <div style={{ width: '100%', marginBottom: '1.5rem' }}>
      {/* Load the script safely using Next.js Script */}
      <script src="https://accounts.google.com/gsi/client" async defer></script>
      
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
        {/* Declarative HTML API for Google Sign-In */}
        <div id="g_id_onload"
             data-client_id={effectiveClientId}
             data-context="signin"
             data-ux_mode="popup"
             data-callback="handleGoogleCredentialResponse"
             data-auto_prompt="false">
        </div>

        <div className="g_id_signin"
             data-type="standard"
             data-shape="rectangular"
             data-theme="outline"
             data-text="continue_with"
             data-size="large"
             data-logo_alignment="left">
        </div>
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
