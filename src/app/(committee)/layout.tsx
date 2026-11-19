import { ReactNode } from 'react';
import { getSession } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { CommitteeSidebar } from './CommitteeSidebar';
import styles from '../(participant)/layout.module.css'; // Reusing participant layout styles

export default async function CommitteeLayout({ children }: { children: ReactNode }) {
  const session = await getSession();
  
  if (!session || (!session.roles.includes('COMMITTEE') && !session.roles.includes('ADMIN') && !session.roles.includes('SECRETARY'))) {
    redirect('/login');
  }

  const isSecretaryOnly = session.roles.includes('SECRETARY') && !session.roles.includes('COMMITTEE') && !session.roles.includes('ADMIN');

  return (
    <div className={styles.layout}>
      <CommitteeSidebar isSecretary={isSecretaryOnly}>
        {children}
      </CommitteeSidebar>
    </div>
  );
}
