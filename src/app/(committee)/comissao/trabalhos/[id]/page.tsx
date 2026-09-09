import { Metadata } from 'next';
import { notFound, redirect } from 'next/navigation';
import { SectionHeading } from '@/components/ui/SectionHeading/SectionHeading';
import { Badge } from '@/components/ui/Badge/Badge';
import { prisma } from '@/lib/prisma';
import { EvaluationForm } from './EvaluationForm';
import styles from './page.module.css';

export const metadata: Metadata = {
  title: 'Avaliação de Trabalho - Comissão',
};

function getStatusBadge(status: string) {
  switch (status) {
    case 'SUBMITTED':
      return <Badge variant="warning">Pendente</Badge>;
    case 'UNDER_REVIEW':
      return <Badge variant="info">Em Análise</Badge>;
    case 'REVISION_REQUESTED':
      return <Badge variant="warning">Com Ressalva</Badge>;
    case 'ACCEPTED':
      return <Badge variant="success">Aprovado</Badge>;
    case 'REJECTED':
      return <Badge variant="error">Reprovado</Badge>;
    default:
      return <Badge variant="info">{status}</Badge>;
  }
}

export default async function AvaliacaoTrabalhoPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const work = await prisma.scientificWork.findUnique({
    where: { id },
    include: {
      participant: {
        select: { fullName: true }
      },
      evaluations: {
        include: {
          evaluator: {
            include: {
              participant: {
                select: { fullName: true }
              }
            }
          }
        },
        orderBy: { createdAt: 'desc' }
      }
    }
  });

  if (!work) {
    notFound();
  }

  let authors = [];
  try {
    authors = JSON.parse(work.authors as string) || [];
  } catch (e) {
    // fallback
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <SectionHeading 
          title="Análise de Trabalho" 
          subtitle="Revise o resumo e os PDFs anexados antes de dar seu parecer."
          alignment="left"
        />
        <div>{getStatusBadge(work.status)}</div>
      </div>
      
      <div className={styles.contentGrid}>
        {/* Left Column: Work Details */}
        <div className={styles.detailsCard}>
          <h2 className={styles.workTitle}>{work.title}</h2>
          
          <div className={styles.metaInfo}>
            <div className={styles.metaRow}>
              <strong>Área Temática:</strong> {work.categoryArea}
            </div>
            <div className={styles.metaRow}>
              <strong>Modalidade:</strong> {work.modality}
            </div>
          </div>
          
          <div className={styles.abstractSection}>
            <h3>Resumo</h3>
            <p>{work.abstract}</p>
          </div>
          

          <div className={styles.fileSection}>
            <h3>Arquivos Anexados</h3>
            {work.identifiedFileUrl && (
              <a href={work.identifiedFileUrl} target="_blank" rel="noopener noreferrer" className={styles.fileLinkBtn} style={{ marginBottom: '0.5rem', display: 'block' }}>
                Trabalho Identificado (PDF)
              </a>
            )}
            {work.unidentifiedFileUrl && (
              <a href={work.unidentifiedFileUrl} target="_blank" rel="noopener noreferrer" className={styles.fileLinkBtn} style={{ marginBottom: '0.5rem', display: 'block' }}>
                Trabalho Não Identificado (PDF)
              </a>
            )}
            {work.enrollmentProofUrl && (
              <a href={work.enrollmentProofUrl} target="_blank" rel="noopener noreferrer" className={styles.fileLinkBtn} style={{ marginBottom: '0.5rem', display: 'block' }}>
                Comprovante de Matrícula (PDF)
              </a>
            )}
            {work.requiresEthics && work.ethicsCommitteeFileUrl && (
              <a href={work.ethicsCommitteeFileUrl} target="_blank" rel="noopener noreferrer" className={styles.fileLinkBtn} style={{ display: 'block' }}>
                Comitê de Ética (PDF)
              </a>
            )}
            {(!work.identifiedFileUrl && !work.unidentifiedFileUrl && !work.enrollmentProofUrl) && (
              <p style={{ color: 'var(--color-text-muted)' }}>Nenhum arquivo anexado.</p>
            )}
          </div>

          {/* Histórico de Avaliações */}
          {work.evaluations && work.evaluations.length > 0 && (
            <div className={styles.fileSection} style={{ marginTop: '2rem' }}>
              <h3>Histórico de Avaliações</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {work.evaluations.map((evalRecord: any) => {
                  const evalName = evalRecord.evaluator.participant?.fullName || evalRecord.evaluator.email;
                  return (
                    <div key={evalRecord.id} style={{ background: 'white', border: '1px solid var(--color-border)', padding: '1rem', borderRadius: 'var(--radius-md)' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                        <strong style={{ color: 'var(--color-primary-dark)' }}>{evalName}</strong>
                        <span style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)' }}>
                          {new Date(evalRecord.createdAt).toLocaleString('pt-BR')}
                        </span>
                      </div>
                      <div style={{ marginBottom: '0.5rem' }}>
                        {getStatusBadge(evalRecord.status)}
                      </div>
                      {evalRecord.comments && (
                        <p style={{ fontSize: '0.875rem', color: 'var(--color-text-secondary)', margin: 0, whiteSpace: 'pre-wrap', background: 'var(--color-surface-alt)', padding: '0.75rem', borderRadius: 'var(--radius-sm)' }}>
                          {evalRecord.comments}
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
        
        {/* Right Column: Evaluation Form */}
        <div className={styles.evaluationCard}>
          <h3 className={styles.evalTitle}>Parecer da Comissão</h3>
          <EvaluationForm workId={work.id} currentStatus={work.status} currentComments={work.reviewerComments || ''} />
        </div>
      </div>
    </div>
  );
}
