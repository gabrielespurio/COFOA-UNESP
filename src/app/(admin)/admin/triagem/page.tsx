import { Metadata } from 'next';
import { SectionHeading } from '@/components/ui/SectionHeading/SectionHeading';
import { ScreeningTable } from './ScreeningTable';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';
import styles from '../page.module.css';

export const metadata: Metadata = {
  title: 'Triagem de Trabalhos - 1ª Etapa',
};

export default async function TrabalhosTriagemPage() {
  const session = await getSession();
  
  const works = await prisma.scientificWork.findMany({
    where: { status: 'SUBMITTED', stage1Approved: false },
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
        title="Triagem de Trabalhos (1ª Etapa)" 
        alignment="left"
      />
      
      <p style={{ color: 'var(--color-text-secondary)', marginBottom: '2rem' }}>
        Avalie os trabalhos recém-enviados verificando a documentação e os anexos. Trabalhos aprovados seguirão para a 2ª etapa (Comissão Avaliadora).
      </p>

      <ScreeningTable works={works} currentUserId={session?.userId || ''} />
    </div>
  );
}
