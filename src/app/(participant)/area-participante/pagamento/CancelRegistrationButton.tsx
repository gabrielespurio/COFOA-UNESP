'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/Button/Button';
import { cancelRegistration } from '@/actions/participant';
import { useRouter } from 'next/navigation';

export function CancelRegistrationButton() {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleCancel = async () => {
    if (!confirm('Tem certeza que deseja cancelar esta inscrição para tentar novamente?')) return;
    
    setLoading(true);
    const res = await cancelRegistration();
    setLoading(false);
    
    if (res?.error) {
      alert(res.error);
    } else {
      router.push('/area-participante/inscricao');
    }
  };

  return (
    <Button 
      variant="outline" 
      onClick={handleCancel}
      disabled={loading}
      style={{ marginTop: '1rem' }}
    >
      {loading ? 'Cancelando...' : 'Cancelar e tentar novamente'}
    </Button>
  );
}
