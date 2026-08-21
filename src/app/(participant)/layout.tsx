import { redirect } from 'next/navigation';
import { getSession } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { ParticipantSidebar } from './ParticipantSidebar';
import styles from './layout.module.css';

export default async function ParticipantLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();

  if (!session) {
    redirect('/login');
  }

  if (session.role === 'ADMIN') {
    redirect('/admin');
  }

  // Check if participant profile exists
  const participant = await prisma.participant.findUnique({
    where: { userId: session.userId },
  });

  const profileCompleted = !!participant;

  return (
    <div className={styles.layout}>
      <ParticipantSidebar profileCompleted={profileCompleted}>
        {children}
      </ParticipantSidebar>
    </div>
  );
}
