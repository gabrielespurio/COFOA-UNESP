import { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { SectionHeading } from '@/components/ui/SectionHeading/SectionHeading';
import { getSession } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { WorkSubmissionForm } from '../../novo/WorkSubmissionForm';
import styles from '../../novo/page.module.css';

export const metadata: Metadata = {
  title: 'Editar Trabalho',
};

export default async function EditarTrabalhoPage({ params }: { params: { id: string } }) {
  const session = await getSession();
  if (!session) redirect('/login');

  const participant = await prisma.participant.findUnique({
    where: { userId: session.userId },
  });

  if (!participant) {
    redirect('/area-participante/perfil');
  }

  const work = await prisma.scientificWork.findUnique({
    where: { id: params.id }
  });

  if (!work || work.participantId !== participant.id || work.status !== 'REVISION_REQUESTED') {
    redirect('/area-participante/trabalhos');
  }

  return (
    <div className={styles.container}>
      <SectionHeading 
        title="Corrigir Trabalho" 
        subtitle="Siga as orientações da comissão e reenvie seu trabalho para nova avaliação."
        alignment="left"
      />
      
      <div style={{ marginTop: '2rem' }}>
        <div style={{ marginBottom: '2rem', padding: '1rem', background: 'var(--color-warning-light, #fffbeb)', border: '1px solid var(--color-warning, #f59e0b)', borderRadius: '8px' }}>
          <h4 style={{ color: '#b45309', marginBottom: '0.5rem', fontWeight: 600 }}>Parecer da Comissão:</h4>
          <p style={{ color: '#92400e', whiteSpace: 'pre-wrap', lineHeight: 1.5 }}>
            {work.reviewerComments}
          </p>
        </div>

        <WorkSubmissionForm 
          participantId={participant.id} 
          initialData={work} 
          workId={work.id} 
        />
      </div>
    </div>
  );
}
