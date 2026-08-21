import { Metadata } from 'next';
import Link from 'next/link';
import { SectionHeading } from '@/components/ui/SectionHeading/SectionHeading';
import { Badge } from '@/components/ui/Badge/Badge';
import { prisma } from '@/lib/prisma';
import styles from '../page.module.css';

export const metadata: Metadata = {
  title: 'Trabalhos Submetidos - Comissão',
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

export default async function TrabalhosComissaoPage() {
  const works = await prisma.scientificWork.findMany({
    where: { status: { not: 'DRAFT' } },
    orderBy: { submittedAt: 'asc' },
    include: {
      participant: {
        select: { fullName: true }
      }
    }
  });

  return (
    <div className={styles.container}>
      <SectionHeading 
        title="Trabalhos Submetidos" 
        subtitle="Lista completa de trabalhos submetidos para avaliação."
        alignment="left"
      />
      
      <div className={styles.tableWrapper}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Título</th>
              <th>Área Temática</th>
              <th>Autor Principal</th>
              <th>Status</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            {works.length === 0 && (
              <tr>
                <td colSpan={5} style={{ textAlign: 'center', color: 'var(--color-text-secondary)' }}>
                  Nenhum trabalho encontrado.
                </td>
              </tr>
            )}
            {works.map(work => (
              <tr key={work.id}>
                <td style={{ fontWeight: 500, maxWidth: '300px' }}>
                  <div style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {work.title}
                  </div>
                </td>
                <td>{work.categoryArea}</td>
                <td>{work.participant.fullName}</td>
                <td>{getStatusBadge(work.status)}</td>
                <td>
                  <Link href={`/comissao/trabalhos/${work.id}`} className={styles.actionBtn}>
                    Avaliar
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
