import { Metadata } from 'next';
import { SectionHeading } from '@/components/ui/SectionHeading/SectionHeading';
import { WorksTable } from './WorksTable';
import { prisma } from '@/lib/prisma';
import styles from '../page.module.css';

export const metadata: Metadata = {
  title: 'Trabalhos Submetidos - Comissão',
};

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
      
      <WorksTable works={works} />
    </div>
  );
}
