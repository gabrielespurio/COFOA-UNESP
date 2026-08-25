import { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { SectionHeading } from '@/components/ui/SectionHeading/SectionHeading';
import { Button } from '@/components/ui/Button/Button';
import { Badge } from '@/components/ui/Badge/Badge';
import { getSession } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import styles from './page.module.css';

export const metadata: Metadata = {
  title: 'Meus Trabalhos',
};

function getStatusBadge(status: string) {
  switch (status) {
    case 'DRAFT':
      return <Badge variant="info">Rascunho</Badge>;
    case 'SUBMITTED':
      return <Badge variant="warning">Submetido</Badge>;
    case 'UNDER_REVIEW':
      return <Badge variant="info">Em Avaliação</Badge>;
    case 'REVISION_REQUESTED':
      return <Badge variant="warning">Com Ressalva</Badge>;
    case 'ACCEPTED':
      return <Badge variant="success">Aprovado</Badge>;
    case 'REJECTED':
      return <Badge variant="error">Não Aprovado</Badge>;
    default:
      return <Badge variant="info">{status}</Badge>;
  }
}

export default async function MeusTrabalhosPage() {
  const session = await getSession();
  if (!session) redirect('/login');

  const participant = await prisma.participant.findUnique({
    where: { userId: session.userId },
  });

  if (!participant) {
    redirect('/area-participante/perfil');
  }

  const works = await prisma.scientificWork.findMany({
    where: { participantId: participant.id },
    orderBy: { createdAt: 'desc' }
  });

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <SectionHeading 
          title="Meus Trabalhos" 
          subtitle="Acompanhe o status das suas submissões científicas."
          alignment="left"
        />
        <Button variant="primary" href="/area-participante/trabalhos/novo">
          + Novo Trabalho
        </Button>
      </div>

      <div className={styles.content}>
        {works.length === 0 ? (
          <div className={styles.emptyState}>
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" className={styles.emptyIcon}>
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <polyline points="14 2 14 8 20 8" />
              <line x1="16" y1="13" x2="8" y2="13" />
              <line x1="16" y1="17" x2="8" y2="17" />
              <polyline points="10 9 9 9 8 9" />
            </svg>
            <h3>Nenhum trabalho submetido</h3>
            <p>Você ainda não enviou nenhum trabalho científico para avaliação.</p>
            <Button variant="outline" href="/area-participante/trabalhos/novo">
              Submeter Primeiro Trabalho
            </Button>
          </div>
        ) : (
          <div className={styles.worksGrid}>
            {works.map(work => (
              <div key={work.id} className={styles.workCard}>
                <div className={styles.workHeader}>
                  <div className={styles.workCategory}>{work.categoryArea || 'Sem Categoria'}</div>
                  {getStatusBadge(work.status)}
                </div>
                <h3 className={styles.workTitle}>{work.title}</h3>
                <div className={styles.workMeta}>
                  <div className={styles.metaItem}>
                    <span className={styles.metaLabel}>Modalidade:</span>
                    <span className={styles.metaValue}>{work.modality || '-'}</span>
                  </div>
                  <div className={styles.metaItem}>
                    <span className={styles.metaLabel}>Data:</span>
                    <span className={styles.metaValue}>
                      {new Date(work.createdAt).toLocaleDateString('pt-BR')}
                    </span>
                  </div>
                </div>
                
                {work.reviewerComments && (
                  <div style={{ marginTop: 'var(--space-4)', padding: 'var(--space-3)', background: 'var(--color-surface-alt)', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)' }}>
                    <div style={{ fontSize: 'var(--font-size-sm)', fontWeight: 600, color: 'var(--color-primary-dark)', marginBottom: 'var(--space-2)' }}>Parecer da Avaliação:</div>
                    <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)', whiteSpace: 'pre-wrap', lineHeight: 1.5 }}>
                      {work.reviewerComments}
                    </p>
                  </div>
                )}
                
                {(work.identifiedFileUrl || work.unidentifiedFileUrl || work.enrollmentProofUrl) && (
                  <div className={styles.workActions} style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginTop: '1rem' }}>
                    {work.identifiedFileUrl && (
                      <a href={work.identifiedFileUrl} target="_blank" rel="noopener noreferrer" className={styles.linkAction}>
                        Ver Trabalho Identificado
                      </a>
                    )}
                    {work.unidentifiedFileUrl && (
                      <a href={work.unidentifiedFileUrl} target="_blank" rel="noopener noreferrer" className={styles.linkAction}>
                        Ver Trabalho Não Identificado
                      </a>
                    )}
                    {work.enrollmentProofUrl && (
                      <a href={work.enrollmentProofUrl} target="_blank" rel="noopener noreferrer" className={styles.linkAction}>
                        Ver Comprovante
                      </a>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
