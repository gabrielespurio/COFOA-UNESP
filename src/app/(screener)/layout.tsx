import { getSession } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { redirect } from 'next/navigation';
import { ScreenerSidebar } from './ScreenerSidebar';
import styles from './layout.module.css';

export default async function ScreenerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();
  
  if (!session) {
    redirect('/login');
  }

  const user = await prisma.user.findUnique({
    where: { id: session.userId },
    select: { roles: true }
  });

  if (!user?.roles.includes('SCREENER') && !user?.roles.includes('ADMIN')) {
    redirect('/area-participante');
  }

  return (
    <div className={styles.layout}>
      <ScreenerSidebar>
        {children}
      </ScreenerSidebar>
    </div>
  );
}
