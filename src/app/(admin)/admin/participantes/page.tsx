import { Metadata } from 'next';
import { SectionHeading } from '@/components/ui/SectionHeading/SectionHeading';
import { prisma } from '@/lib/prisma';
import styles from './page.module.css';

export const metadata: Metadata = {
  title: 'Participantes | Admin',
};

export default async function AdminParticipantesPage() {
  const participants = await prisma.participant.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
      user: { select: { email: true, role: true } },
      registration: { select: { status: true } }
    }
  });

  return (
    <div>
      <SectionHeading title="Participantes" subtitle="Lista de todos os usuários cadastrados no sistema." />
      
      <div className={styles.tableContainer}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Nome</th>
              <th>E-mail</th>
              <th>CPF</th>
              <th>Celular</th>
              <th>Papel</th>
              <th>Inscrição</th>
              <th>Data de Cadastro</th>
            </tr>
          </thead>
          <tbody>
            {participants.map(p => (
              <tr key={p.id}>
                <td className={styles.nameCell}>{p.fullName}</td>
                <td>{p.user.email}</td>
                <td>{p.cpf}</td>
                <td>{p.phone || '-'}</td>
                <td>
                  <span className={p.user.role === 'ADMIN' ? styles.badgeAdmin : styles.badgeUser}>
                    {p.user.role}
                  </span>
                </td>
                <td>
                  {p.registration ? (
                    <span className={styles.badgeSuccess}>{p.registration.status}</span>
                  ) : (
                    <span className={styles.badgeNeutral}>Nenhuma</span>
                  )}
                </td>
                <td>{p.createdAt.toLocaleDateString('pt-BR')}</td>
              </tr>
            ))}
            {participants.length === 0 && (
              <tr>
                <td colSpan={7} className={styles.emptyState}>Nenhum participante encontrado.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
