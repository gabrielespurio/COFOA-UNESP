'use client';

import React, { useTransition, useState } from 'react';
import { Button } from '@/components/ui/Button/Button';
import { syncPaymentStatus } from '@/actions/participant';

export function SyncPaymentButton({ registrationId }: { registrationId: string }) {
  const [isPending, startTransition] = useTransition();
  const [message, setMessage] = useState('');

  const handleSync = () => {
    setMessage('');
    startTransition(async () => {
      const result = await syncPaymentStatus(registrationId);
      if (result?.error) {
        setMessage(`Erro: ${result.error}`);
      } else if (result?.message) {
        setMessage(result.message);
      }
    });
  };

  return (
    <div style={{ marginTop: '1rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
      <Button 
        onClick={handleSync} 
        disabled={isPending}
        variant="secondary"
        size="md"
        fullWidth
      >
        {isPending ? 'Verificando...' : 'Já paguei! Atualizar Status'}
      </Button>
      {message && <p style={{ fontSize: '0.875rem', color: 'var(--color-primary)', textAlign: 'center' }}>{message}</p>}
    </div>
  );
}
