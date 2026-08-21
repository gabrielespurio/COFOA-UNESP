import { getSession } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { redirect } from 'next/navigation';
import { AdminSidebar } from './AdminSidebar';
import styles from './layout.module.css';

export default async function AdminLayout({
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
    select: { role: true }
  });

  if (user?.role !== 'ADMIN') {
    redirect('/area-participante');
  }

  return (
    <div className={styles.layout}>
      <AdminSidebar>
        {children}
      </AdminSidebar>
    </div>
  );
}
