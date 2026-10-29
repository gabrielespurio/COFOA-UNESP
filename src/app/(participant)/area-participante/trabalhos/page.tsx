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
      return <Badge variant="warning">Submetido</Badge>; // Legacy
    case 'UNDER_REVIEW':
      return <Badge variant="info">Em Análise</Badge>;
    case 'REVISION_REQUESTED':
      return <Badge variant="warning">Aprovado com Ressalvas</Badge>;
    case 'ACCEPTED':
      return <Badge variant="success">Aprovado</Badge>;
    case 'REJECTED':
      return <Badge variant="error">Reprovado</Badge>;
    default:
      return <Badge variant="info">{status}</Badge>;
  }
}

export default async function MeusTrabalhosPage() {
  const session = await getSession();
  if (!session) redirect('/login');

  const participant = await prisma.participant.findUnique({
    where: { userId: session.userId },
    include: { registration: true }
  });

  if (!participant) {
    redirect('/area-participante/perfil');
  }

  let isConfirmed = participant.registration?.status === 'CONFIRMED';
  if (!isConfirmed && participant.registration?.id) {
    const { syncRegistrationWithAsaas } = await import('@/actions/participant');
    const syncRes = await syncRegistrationWithAsaas(participant.registration.id);
    if (syncRes.confirmed) {
      isConfirmed = true;
    }
  }

  const works = await prisma.scientificWork.findMany({
    where: { participantId: participant.id },
    include: { evaluations: true },
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
        {isConfirmed && (
          <Button variant="primary" href="/area-participante/trabalhos/novo">
            + Novo Trabalho
          </Button>
        )}
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
            {isConfirmed ? (
              <Button variant="outline" href="/area-participante/trabalhos/novo">
                Submeter Primeiro Trabalho
              </Button>
            ) : (
              <p style={{ marginTop: '1rem', color: '#856404', background: '#fff3cd', padding: '1rem', borderRadius: '8px', border: '1px solid #ffeeba' }}>
                Para submeter trabalhos, é necessário confirmar o pagamento da sua inscrição.
              </p>
            )}
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
                
                {/* Mensagem de sucesso quando reenviado apos correcao */}
                {work.status === 'SUBMITTED' && (work.evaluations?.some((e: any) => e.status === 'REVISION_REQUESTED') || (work.submittedAt && new Date(work.submittedAt).getTime() - new Date(work.createdAt).getTime() > 10000)) && (
                  <div style={{ marginTop: 'var(--space-4)', padding: 'var(--space-3)', background: '#f0fdf4', borderRadius: 'var(--radius-md)', border: '1px solid #bbf7d0', color: '#166534', fontSize: 'var(--font-size-sm)' }}>
                    <div style={{ fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.25rem' }}>
                      <span>✓</span> Trabalho Corrigido e Reenviado!
                    </div>
                    <p style={{ margin: 0, color: '#15803d', lineHeight: 1.4 }}>
                      Seu novo arquivo foi enviado com sucesso{work.submittedAt ? ` em ${new Date(work.submittedAt).toLocaleString('pt-BR')}` : ''}. A Comissão Científica já foi notificada e fará uma nova análise.
                    </p>
                  </div>
                )}

                {/* Mensagem de sucesso quando aprovado */}
                {work.status === 'ACCEPTED' && (
                  <div style={{ marginTop: 'var(--space-4)', padding: 'var(--space-3)', background: '#ecfdf5', borderRadius: 'var(--radius-md)', border: '1px solid #a7f3d0', color: '#065f46', fontSize: 'var(--font-size-sm)' }}>
                    <div style={{ fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                      <span>🎉</span> Trabalho Aprovado!
                    </div>
                    <p style={{ margin: '0.25rem 0 0 0', color: '#047857', lineHeight: 1.4 }}>
                      Parabéns! Seu trabalho foi aprovado pela Comissão Científica.
                    </p>
                  </div>
                )}

                {/* Box de Ressalvas com botao de acao */}
                {work.status === 'REVISION_REQUESTED' && (
                  <div style={{ marginTop: 'var(--space-4)', padding: 'var(--space-3)', background: '#fffbeb', borderRadius: 'var(--radius-md)', border: '1px solid #fde68a' }}>
                    <div style={{ fontSize: 'var(--font-size-sm)', fontWeight: 600, color: '#b45309', marginBottom: 'var(--space-2)' }}>Parecer da Avaliação (Aprovado com Ressalvas):</div>
                    {work.reviewerComments ? (
                      <p style={{ fontSize: 'var(--font-size-sm)', color: '#92400e', whiteSpace: 'pre-wrap', lineHeight: 1.5, margin: 0 }}>
                        {work.reviewerComments}
                      </p>
                    ) : (
                      <p style={{ fontSize: 'var(--font-size-sm)', color: '#92400e', lineHeight: 1.5, margin: 0 }}>
                        Foram solicitadas correções para o seu trabalho. Por favor, revise o documento e reenvie.
                      </p>
                    )}
                    <div style={{ marginTop: '1rem' }}>
                      <Button variant="outline" size="sm" href={`/area-participante/trabalhos/${work.id}/editar`} fullWidth>
                        Corrigir e Reenviar
                      </Button>
                    </div>
                  </div>
                )}

                {/* Box de Reprovado */}
                {work.status === 'REJECTED' && (
                  <div style={{ marginTop: 'var(--space-4)', padding: 'var(--space-3)', background: '#fef2f2', borderRadius: 'var(--radius-md)', border: '1px solid #fecaca' }}>
                    <div style={{ fontSize: 'var(--font-size-sm)', fontWeight: 600, color: '#b91c1c', marginBottom: 'var(--space-2)' }}>Parecer da Avaliação (Reprovado):</div>
                    <p style={{ fontSize: 'var(--font-size-sm)', color: '#991b1b', whiteSpace: 'pre-wrap', lineHeight: 1.5, margin: 0 }}>
                      {work.reviewerComments || 'Infelizmente o trabalho não atendeu aos critérios estabelecidos no edital.'}
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
                    {work.requiresEthics && work.ethicsCommitteeFileUrl && (
                      <a href={work.ethicsCommitteeFileUrl} target="_blank" rel="noopener noreferrer" className={styles.linkAction}>
                        Ver Comitê de Ética
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
