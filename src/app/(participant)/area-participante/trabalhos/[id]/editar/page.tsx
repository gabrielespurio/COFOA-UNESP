import { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { SectionHeading } from '@/components/ui/SectionHeading/SectionHeading';
import { Button } from '@/components/ui/Button/Button';
import { getSession } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { getCurrentDate } from '@/lib/dateUtils';
import { REVISION_DEADLINE_CONFIG, isRevisionPeriodOpen } from '@/lib/constants';
import { WorkSubmissionForm } from '../../novo/WorkSubmissionForm';
import styles from '../../novo/page.module.css';

export const metadata: Metadata = {
  title: 'Editar Trabalho',
};

export default async function EditarTrabalhoPage(props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
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

  const currentDate = await getCurrentDate();
  const isOpen = isRevisionPeriodOpen(currentDate);

  return (
    <div className={styles.container}>
      <SectionHeading 
        title="Corrigir Trabalho" 
        subtitle={isOpen ? "Siga as orientações da comissão e reenvie seu trabalho para nova avaliação." : "O período para envio de correções deste trabalho foi finalizado."}
        alignment="left"
      />
      
      <div style={{ marginTop: '2rem' }}>
        {!isOpen && (
          <div style={{ marginBottom: '2rem', padding: '1.25rem', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '8px', color: '#991b1b' }}>
            <h4 style={{ margin: '0 0 0.5rem 0', fontWeight: 700, fontSize: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span>🛑</span> Prazo de Correções Encerrado
            </h4>
            <p style={{ margin: '0 0 1rem 0', lineHeight: 1.5, fontSize: '0.925rem' }}>
              O prazo para reenvio de trabalhos com ressalvas encerrou em <strong>{REVISION_DEADLINE_CONFIG.deadlineDisplay}</strong>. Não é mais possível realizar novos envios de correções através da plataforma.
            </p>
            <Button variant="outline" href="/area-participante/trabalhos">
              Voltar aos Meus Trabalhos
            </Button>
          </div>
        )}

        <div style={{ marginBottom: '2rem', padding: '1rem', background: 'var(--color-warning-light, #fffbeb)', border: '1px solid var(--color-warning, #f59e0b)', borderRadius: '8px' }}>
          <h4 style={{ color: '#b45309', marginBottom: '0.5rem', fontWeight: 600 }}>Parecer da Comissão:</h4>
          <p style={{ color: '#92400e', whiteSpace: 'pre-wrap', lineHeight: 1.5 }}>
            {work.reviewerComments}
          </p>
        </div>

        {isOpen && (
          <WorkSubmissionForm 
            participantId={participant.id} 
            initialData={work} 
            workId={work.id} 
          />
        )}
      </div>
    </div>
  );
}
