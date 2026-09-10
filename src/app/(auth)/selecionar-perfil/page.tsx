import { getSession } from '@/lib/auth';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import styles from './page.module.css';

export const metadata = {
  title: 'Selecionar Perfil | COFOA',
};

export default async function SelecionarPerfilPage() {
  const session = await getSession();

  if (!session) redirect('/login');
  if (session.role !== 'COMMITTEE') {
    if (session.role === 'ADMIN') redirect('/admin');
    redirect('/area-participante');
  }

  return (
    <div className={styles.wrapper}>
      <div className={styles.header}>
        <h1 className={styles.title}>Bem-vindo(a)!</h1>
        <p className={styles.description}>
          Como você deseja acessar o sistema agora?
        </p>
      </div>

      <div className={styles.options}>
        <Link href="/area-participante" className={styles.optionCard}>
          <div className={styles.iconWrapper}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
              <circle cx="12" cy="7" r="4"></circle>
            </svg>
          </div>
          <div className={styles.optionContent}>
            <h2 className={styles.optionTitle}>Área do Participante</h2>
            <p className={styles.optionDescription}>Submeta e gerencie seus trabalhos.</p>
          </div>
          <div className={styles.arrow}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="9 18 15 12 9 6"></polyline>
            </svg>
          </div>
        </Link>

        <Link href="/comissao" className={styles.optionCard}>
          <div className={styles.iconWrapper}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
              <polyline points="14 2 14 8 20 8"></polyline>
              <line x1="16" y1="13" x2="8" y2="13"></line>
              <line x1="16" y1="17" x2="8" y2="17"></line>
              <polyline points="10 9 9 9 8 9"></polyline>
            </svg>
          </div>
          <div className={styles.optionContent}>
            <h2 className={styles.optionTitle}>Painel da Comissão</h2>
            <p className={styles.optionDescription}>Acesse e emita pareceres científicos.</p>
          </div>
          <div className={styles.arrow}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="9 18 15 12 9 6"></polyline>
            </svg>
          </div>
        </Link>
      </div>
    </div>
  );
}
