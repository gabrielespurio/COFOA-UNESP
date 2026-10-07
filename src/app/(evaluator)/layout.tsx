import { getSession } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { EvaluatorSidebar } from './EvaluatorSidebar';
import { prisma } from '@/lib/prisma';
import styles from '../(participant)/layout.module.css';

export const metadata = {
  title: 'Banca Avaliadora | COFOA XV',
};

export default async function EvaluatorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();
  if (!session) redirect('/login');

  const user = await prisma.user.findUnique({ where: { id: session.userId } });
  if (!user || !user.roles.includes('EVALUATOR')) {
    redirect('/selecionar-perfil');
  }

  return (
    <div className={styles.layout}>
      <EvaluatorSidebar>
        {children}
      </EvaluatorSidebar>
    </div>
  );
}
