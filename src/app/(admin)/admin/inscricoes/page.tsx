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
              <th>Comprovante</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            {registrations.map(r => {
              const proofUrl = r.participant.studentProofUrl || r.participant.croProofUrl;
              
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
                    {proofUrl ? (
                      <a href={proofUrl} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--color-primary)', textDecoration: 'underline' }}>
                        Ver Anexo
                      </a>
                    ) : (
                      <span style={{ color: 'var(--color-text-muted)' }}>-</span>
                    )}
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
