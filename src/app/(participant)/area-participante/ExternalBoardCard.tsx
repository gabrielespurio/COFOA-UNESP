'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/Button/Button';
import { applyForExternalBoard, syncExternalBoardPayment, cancelExternalBoardEnrollment } from '@/actions/participant';
import { useRouter } from 'next/navigation';

interface ExternalBoardCardProps {
  enrollment: {
    id: string;
    status: string;
    invoiceUrl?: string | null;
    amount: number;
  } | null;
}

export function ExternalBoardCard({ enrollment }: ExternalBoardCardProps) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleApply = async () => {
    setLoading(true);
    const res = await applyForExternalBoard();
    setLoading(false);

    if (res?.error) {
      alert(res.error);
    } else if (res?.invoiceUrl) {
      window.location.href = res.invoiceUrl;
    } else {
      router.refresh();
    }
  };

  const handleSync = async () => {
    setLoading(true);
    const res = await syncExternalBoardPayment();
    setLoading(false);

    if (res?.error) {
      alert(res.error);
    } else if (res?.message) {
      alert(res.message);
      router.refresh();
    }
  };

  const handleCancel = async () => {
    if (!confirm('Deseja cancelar esta cobrança da Banca Avaliadora?')) return;
    setLoading(true);
    const res = await cancelExternalBoardEnrollment();
    setLoading(false);

    if (res?.error) {
      alert(res.error);
    } else {
      router.refresh();
    }
  };

  if (!enrollment || enrollment.status === 'CANCELLED') {
    return (
      <div style={{ marginTop: '1rem' }}>
        <p style={{ fontSize: '0.875rem', color: 'var(--color-text-secondary)', marginBottom: '0.75rem', lineHeight: '1.4' }}>
          Mesmo já inscrito para apresentação de trabalhos, você pode se inscrever também para avaliar trabalhos na <strong>Banca Avaliadora Externa</strong> (taxa de R$ 70,00).
        </p>
        <Button 
          variant="primary" 
          size="sm" 
          onClick={handleApply}
          disabled={loading}
        >
          {loading ? 'Gerando cobrança...' : 'Inscrever-se na Banca (R$ 70,00)'}
        </Button>
      </div>
    );
  }

  if (enrollment.status === 'PENDING') {
    return (
      <div style={{ marginTop: '1rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        <p style={{ fontSize: '0.875rem', color: 'var(--color-text-secondary)', lineHeight: '1.4' }}>
          Cobrança gerada no valor de <strong>R$ {(enrollment.amount / 100).toFixed(2).replace('.', ',')}</strong>. Efetue o pagamento para liberar seu acesso à banca.
        </p>
        {enrollment.invoiceUrl && (
          <Button 
            href={enrollment.invoiceUrl} 
            variant="primary" 
            size="sm"
            target="_blank"
            rel="noopener noreferrer"
          >
            Pagar Taxa da Banca (R$ 70,00)
          </Button>
        )}
        <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.25rem' }}>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleSync}
            disabled={loading}
          >
            {loading ? 'Verificando...' : 'Já paguei'}
          </Button>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={handleCancel}
            disabled={loading}
            style={{ color: 'var(--color-danger, #ef4444)' }}
          >
            Cancelar
          </Button>
        </div>
      </div>
    );
  }

  return null;
}
