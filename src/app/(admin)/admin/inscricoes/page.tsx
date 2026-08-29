import { Metadata } from 'next';
import { SectionHeading } from '@/components/ui/SectionHeading/SectionHeading';
import { prisma } from '@/lib/prisma';
import { RegistrationActions } from './RegistrationActions';
import styles from './page.module.css';

export const metadata: Metadata = {
  title: 'Inscrições | Admin',
};

export default async function AdminInscricoesPage() {
  const registrations = await prisma.registration.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
      participant: { select: { fullName: true, cpf: true, studentProofUrl: true, croProofUrl: true } },
      category: { select: { name: true } },
      payment: { select: { gatewayResponse: true, gatewayId: true } }
    }
  });

  return (
    <div>
      <SectionHeading title="Inscrições" subtitle="Gerencie as inscrições e aprove os comprovantes dos participantes." />
      
      <div className={styles.tableContainer}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Participante (CPF)</th>
              <th>Categoria</th>
              <th>Status</th>
              <th>Comprovantes</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            {registrations.map(r => {
              const categoryProofUrl = r.participant.studentProofUrl || r.participant.croProofUrl;
              
              // Tenta pegar o link de pagamento do Asaas (transactionReceiptUrl ou invoiceUrl)
              let asaasUrl = r.paymentReceiptUrl;
              if (!asaasUrl && r.payment?.gatewayResponse) {
                const response = r.payment.gatewayResponse as any;
                asaasUrl = response.transactionReceiptUrl || response.invoiceUrl;
              }
              
              let statusClass = styles.badgeNeutral;
              if (r.status === 'CONFIRMED') statusClass = styles.badgeSuccess;
              if (r.status === 'CANCELLED') statusClass = styles.badgeUser; // gray out

              return (
                <tr key={r.id}>
                  <td className={styles.nameCell}>
                    {r.participant.fullName} <br/>
                    <span style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)', fontWeight: 'normal' }}>{r.participant.cpf}</span>
                  </td>
                  <td>{r.category.name}</td>
                  <td>
                    <span className={statusClass}>{r.status}</span>
                  </td>
                  <td>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      {categoryProofUrl ? (
                        <a href={categoryProofUrl} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--color-primary)', textDecoration: 'underline', fontSize: '0.875rem' }}>
                          Vínculo Estudante/CRO
                        </a>
                      ) : null}
                      
                      {asaasUrl ? (
                        <a href={asaasUrl} target="_blank" rel="noopener noreferrer" style={{ color: '#059669', textDecoration: 'underline', fontSize: '0.875rem' }}>
                          Recibo Asaas
                        </a>
                      ) : null}
                      
                      {!categoryProofUrl && !asaasUrl && (
                        <span style={{ color: 'var(--color-text-muted)' }}>-</span>
                      )}
                    </div>
                  </td>
                  <td>
                    <RegistrationActions registrationId={r.id} currentStatus={r.status} />
                  </td>
                </tr>
              );
            })}
            {registrations.length === 0 && (
              <tr>
                <td colSpan={5} className={styles.emptyState}>Nenhuma inscrição encontrada.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
