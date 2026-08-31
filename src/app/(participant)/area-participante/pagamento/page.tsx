import { getSession } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { redirect } from 'next/navigation';
import { Badge } from '@/components/ui/Badge/Badge';
import { Button } from '@/components/ui/Button/Button';
import { formatCurrency } from '@/lib/utils';
import { AsaasPayment } from '@/lib/asaas';
import { SyncPaymentButton } from './SyncPaymentButton';

import { CancelRegistrationButton } from './CancelRegistrationButton';

export default async function PaymentPage() {
  const session = await getSession();
  if (!session) redirect('/login');

  const participant = await prisma.participant.findUnique({
    where: { userId: session.userId },
    include: {
      registration: {
        include: {
          category: true,
          payment: true
        }
      }
    }
  });

  if (!participant || !participant.registration) {
    redirect('/area-participante/inscricao');
  }

  const payment = participant.registration.payment;
  
  if (!payment) {
    return (
      <div style={{ maxWidth: '800px', margin: '0 auto', paddingTop: '2rem' }}>
        <div style={{ background: '#fff', border: '1px solid var(--color-border)', borderRadius: '8px', padding: '1.5rem', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '1rem' }}>Pagamento</h2>
          <p>Sua inscrição atual não gerou uma fatura ou ela foi excluída no sistema do banco.</p>
          <CancelRegistrationButton />
        </div>
      </div>
    );
  }

  const asaasData = payment.gatewayResponse as unknown as AsaasPayment;
  const isPaid = payment.status === 'PAID' || participant.registration.status === 'CONFIRMED';

  const cardStyle = { background: '#fff', border: '1px solid var(--color-border)', borderRadius: '8px', padding: '1.5rem', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' };

  return (
    <div style={{ maxWidth: '600px', margin: '0 auto', paddingTop: '2rem', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <div>
        <h1 style={{ fontSize: '2rem', marginBottom: '0.5rem', color: 'var(--color-primary)' }}>Resumo do Pedido</h1>
        <p style={{ color: 'var(--color-text-secondary)' }}>Acompanhe o status da sua inscrição no COFOA XV.</p>
      </div>

      <div style={cardStyle}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 600 }}>Status da Inscrição</h2>
          {isPaid ? (
            <Badge variant="success">Confirmada</Badge>
          ) : (
            <Badge variant="warning">Aguardando Pagamento</Badge>
          )}
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', borderTop: '1px solid var(--color-border-light)', paddingTop: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ color: 'var(--color-text-muted)' }}>Categoria</span>
            <span style={{ fontWeight: 500 }}>{participant.registration.category.name}</span>
          </div>
          
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ color: 'var(--color-text-muted)' }}>Participante</span>
            <span style={{ fontWeight: 500 }}>{participant.fullName}</span>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1.25rem', fontWeight: 700, marginTop: '1rem', paddingTop: '1rem', borderTop: '1px dashed var(--color-border)' }}>
            <span>Total</span>
            <span style={{ color: 'var(--color-primary)' }}>{formatCurrency(payment.amount)}</span>
          </div>
        </div>
      </div>

      {!isPaid && asaasData?.invoiceUrl && (
        <div style={cardStyle}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '1rem' }}>Efetuar Pagamento</h2>
          <p style={{ marginBottom: '1.5rem', color: 'var(--color-text-secondary)', lineHeight: 1.6 }}>
            Clique no botão abaixo para acessar a página segura do Asaas. 
            Lá você poderá escolher pagar via <strong>PIX</strong> (aprovação na hora), <strong>Cartão de Crédito</strong> ou <strong>Boleto</strong>.
          </p>

          <Button 
            href={asaasData.invoiceUrl}
            variant="primary"
            size="lg"
            fullWidth
          >
            Pagar Inscrição Agora
          </Button>

          <SyncPaymentButton registrationId={participant.registration.id} />

          <p style={{ marginTop: '1rem', fontSize: '0.85rem', color: 'var(--color-text-muted)', textAlign: 'center' }}>
            Se você já pagou e o status não atualizou automaticamente, clique em "Já paguei".
          </p>
        </div>
      )}

      {isPaid && (
        <div style={cardStyle}>
          <div style={{ textAlign: 'center', padding: '2rem 1rem' }}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>✅</div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '0.5rem', color: 'var(--color-success)' }}>Pagamento Confirmado!</h3>
            <p style={{ color: 'var(--color-text-secondary)' }}>
              Sua vaga no COFOA XV está garantida. Fique de olho na aba "Trabalhos" para enviar sua pesquisa!
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
