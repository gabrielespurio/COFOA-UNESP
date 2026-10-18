import { Metadata } from 'next';
import { SectionHeading } from '@/components/ui/SectionHeading/SectionHeading';
import { prisma } from '@/lib/prisma';
import { CrachasClient } from './CrachasClient';
import styles from './page.module.css';

export const metadata: Metadata = {
  title: 'Crachás e Secretaria - Comissão COFOA XV',
};

export default async function CrachasSecretariaPage() {
  const participants = await prisma.participant.findMany({
    orderBy: { fullName: 'asc' },
    include: {
      user: {
        select: { email: true }
      },
      registration: {
        include: {
          category: {
            select: { name: true }
          }
        }
      }
    }
  });

  return (
    <div className={styles.container}>
      <SectionHeading 
        title="Crachás e Credenciamento" 
        subtitle="Acesso da Secretaria para consulta de inscritos e impressão de crachás com QR Code."
        alignment="left"
      />

      <CrachasClient participants={participants as any} />
    </div>
  );
}
