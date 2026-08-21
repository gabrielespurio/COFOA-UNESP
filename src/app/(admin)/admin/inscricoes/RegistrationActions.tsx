'use client';

import { useTransition } from 'react';
import { updateRegistrationStatus } from '@/actions/admin';
import { RegistrationStatus } from '@prisma/client';

interface RegistrationActionsProps {
  registrationId: string;
  currentStatus: string;
}

export function RegistrationActions({ registrationId, currentStatus }: RegistrationActionsProps) {
  const [isPending, startTransition] = useTransition();

  const handleStatusChange = (status: RegistrationStatus) => {
    startTransition(async () => {
      await updateRegistrationStatus(registrationId, status);
    });
  };

  return (
    <div style={{ display: 'flex', gap: '8px' }}>
      {currentStatus !== 'CONFIRMED' && (
        <button 
          onClick={() => handleStatusChange('CONFIRMED')}
          disabled={isPending}
          style={{ padding: '4px 8px', fontSize: '12px', background: 'var(--color-success)', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
        >
          {isPending ? '...' : 'Aprovar'}
        </button>
      )}
      {currentStatus !== 'CANCELLED' && (
        <button 
          onClick={() => handleStatusChange('CANCELLED')}
          disabled={isPending}
          style={{ padding: '4px 8px', fontSize: '12px', background: 'var(--color-error)', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
        >
          {isPending ? '...' : 'Cancelar'}
        </button>
      )}
      {currentStatus !== 'PENDING' && (
        <button 
          onClick={() => handleStatusChange('PENDING')}
          disabled={isPending}
          style={{ padding: '4px 8px', fontSize: '12px', background: 'var(--color-warning)', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
        >
          {isPending ? '...' : 'Pendente'}
        </button>
      )}
    </div>
  );
}
