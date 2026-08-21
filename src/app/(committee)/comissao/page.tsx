import { Metadata } from 'next';
import { SectionHeading } from '@/components/ui/SectionHeading/SectionHeading';
import { prisma } from '@/lib/prisma';
import styles from './page.module.css';

export const metadata: Metadata = {
  title: 'Painel Gerencial - Comissão',
};

export default async function ComissaoDashboardPage() {
  const totalSubmissions = await prisma.scientificWork.count({
    where: { status: { not: 'DRAFT' } }
  });

  const pendingAnalysis = await prisma.scientificWork.count({
    where: { status: 'SUBMITTED' }
  });

  const analyzed = await prisma.scientificWork.count({
    where: {
      status: {
        in: ['ACCEPTED', 'REJECTED', 'REVISION_REQUESTED', 'UNDER_REVIEW']
      }
    }
  });

  return (
    <div className={styles.container}>
      <SectionHeading 
        title="Painel Gerencial" 
        subtitle="Visão geral da produtividade de avaliação dos trabalhos científicos."
        alignment="left"
      />
      
      <div className={styles.metricsGrid}>
        <div className={styles.metricCard}>
          <div className={styles.metricTitle}>Trabalhos Submetidos</div>
          <div className={styles.metricValue}>{totalSubmissions}</div>
          <div className={styles.metricDesc}>Total recebido para o evento</div>
        </div>
        
        <div className={styles.metricCard}>
          <div className={styles.metricTitle}>Pendentes de Análise</div>
          <div className={styles.metricValue} style={{ color: 'var(--color-warning)' }}>{pendingAnalysis}</div>
          <div className={styles.metricDesc}>Aguardando avaliação da comissão</div>
        </div>
        
        <div className={styles.metricCard}>
          <div className={styles.metricTitle}>Trabalhos Analisados</div>
          <div className={styles.metricValue} style={{ color: 'var(--color-success)' }}>{analyzed}</div>
          <div className={styles.metricDesc}>Aprovados, reprovados ou com ressalva</div>
        </div>
      </div>
    </div>
  );
}
