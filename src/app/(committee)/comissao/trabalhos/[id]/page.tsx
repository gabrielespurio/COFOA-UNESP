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
          subtitle="Revise o resumo, autores e o PDF anexado antes de dar seu parecer."
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
            <div className={styles.metaRow}>
              <strong>Orientador:</strong> {work.advisor}
            </div>
            <div className={styles.metaRow}>
              <strong>Apresentador:</strong> {work.presenter}
            </div>
          </div>
          
          <div className={styles.abstractSection}>
            <h3>Resumo</h3>
            <p>{work.abstract}</p>
          </div>
          
          <div className={styles.authorsSection}>
            <h3>Autores</h3>
            <ul>
              {authors.map((author: any, index: number) => (
                <li key={index}>
                  <strong>{author.name}</strong> ({author.institution}) 
                  {author.isCorresponding ? ' - Autor Correspondente' : ''}
                </li>
              ))}
            </ul>
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
