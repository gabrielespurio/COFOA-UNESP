import { ReactNode } from 'react';
import { getSession } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { CommitteeSidebar } from './CommitteeSidebar';
import styles from '../(participant)/layout.module.css'; // Reusing participant layout styles

export default async function CommitteeLayout({ children }: { children: ReactNode }) {
  const session = await getSession();
  
  if (!session || session.role !== 'COMMITTEE') {
    redirect('/login');
  }

  return (
    <div className={styles.layout}>
      <CommitteeSidebar />
      <div className={styles.mainWrapper}>
        <main className={styles.mainContent}>
          {children}
        </main>
      </div>
    </div>
  );
}
