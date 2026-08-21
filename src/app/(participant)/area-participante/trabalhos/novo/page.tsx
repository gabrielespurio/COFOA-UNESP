import { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { SectionHeading } from '@/components/ui/SectionHeading/SectionHeading';
import { WorkSubmissionForm } from './WorkSubmissionForm';
import { getSession } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import styles from './page.module.css';

export const metadata: Metadata = {
  title: 'Submeter Novo Trabalho',
};

export default async function NovoTrabalhoPage() {
  const session = await getSession();
  if (!session) redirect('/login');

  const participant = await prisma.participant.findUnique({
    where: { userId: session.userId },
    include: { registration: true }
  });

  if (!participant || !participant.registration) {
    return (
      <div className={styles.container}>
        <SectionHeading title="Submissão Bloqueada" />
        <div className={styles.warningBox}>
          <p>Para submeter um trabalho científico, você precisa primeiro preencher seu perfil e confirmar sua inscrição no congresso.</p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <SectionHeading 
        title="Submeter Novo Trabalho" 
        subtitle="Preencha os dados abaixo com atenção. O PDF do trabalho não deve ultrapassar 10MB."
        alignment="left"
      />
      
      <div className={styles.formWrapper}>
        <WorkSubmissionForm participantId={participant.id} />
      </div>
    </div>
  );
}
