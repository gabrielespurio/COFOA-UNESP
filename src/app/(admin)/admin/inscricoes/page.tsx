import { Metadata } from 'next';
import { SectionHeading } from '@/components/ui/SectionHeading/SectionHeading';
import { prisma } from '@/lib/prisma';
import { RegistrationActions } from './RegistrationActions';
import styles from './page.module.css';

export const metadata: Metadata = {
  title: 'Inscrições | Admin',
};

export default async function AdminInscricoesPage() {
  const [registrations, categories] = await Promise.all([
    prisma.registration.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        participant: { 
          include: {
            user: { select: { email: true } }
          }
        },
        category: { select: { id: true, name: true, type: true } },
        coupon: { select: { id: true, code: true, discountValue: true } },
        payment: { select: { id: true, gatewayResponse: true, gatewayId: true, status: true } }
      }
    }),
    prisma.registrationCategory.findMany({
      where: { active: true },
      orderBy: { sortOrder: 'asc' },
      select: { id: true, name: true, type: true }
    })
  ]);

  return (
    <div>
      <SectionHeading 
        title="Inscrições" 
        subtitle="Gerencie as inscrições, altere categorias, edite dados e aprove comprovantes dos participantes." 
      />
      
      <div className={styles.tableContainer}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Participante (CPF)</th>
              <th>Categoria</th>
              <th>Valor</th>
              <th>Status</th>
              <th>Comprovantes</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            {registrations.map(r => {
              const categoryProofUrl = r.participant.studentProofUrl || r.participant.croProofUrl;
              
              let asaasUrl = r.paymentReceiptUrl;
              if (!asaasUrl && r.payment?.gatewayResponse) {
                const response = r.payment.gatewayResponse as any;
                asaasUrl = response.transactionReceiptUrl || response.invoiceUrl;
              }
              
              let statusClass = styles.badgeNeutral;
              if (r.status === 'CONFIRMED') statusClass = styles.badgeSuccess;
              if (r.status === 'PENDING') statusClass = styles.badgeWarning;
              if (r.status === 'CANCELLED') statusClass = styles.badgeUser;

              return (
                <tr key={r.id}>
                  <td className={styles.nameCell}>
                    <strong>{r.participant.fullName}</strong> <br/>
                    <span style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)', fontWeight: 'normal' }}>
                      {r.participant.cpf} • {r.participant.user.email}
                    </span>
                  </td>
                  <td>
                    <span>{r.category.name}</span>
                    {r.coupon && (
                      <div style={{ fontSize: '0.75rem', color: '#0284c7', marginTop: '2px' }}>
                        Cupom: {r.coupon.code}
                      </div>
                    )}
                  </td>
                  <td style={{ fontWeight: 600 }}>
                    R$ {(r.amount / 100).toFixed(2).replace('.', ',')}
                  </td>
                  <td>
                    <span className={statusClass}>
                      {r.status === 'CONFIRMED' ? 'Confirmada' : r.status === 'PENDING' ? 'Pendente' : 'Cancelada'}
                    </span>
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
                    <RegistrationActions 
                      participant={r.participant}
                      registration={r}
                      categories={categories}
                    />
                  </td>
                </tr>
              );
            })}
            {registrations.length === 0 && (
              <tr>
                <td colSpan={6} className={styles.emptyState}>Nenhuma inscrição encontrada.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
