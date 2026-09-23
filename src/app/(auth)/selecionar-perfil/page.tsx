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
  
  if (session.roles.length === 1) {
    if (session.roles[0] === 'ADMIN') redirect('/admin');
    if (session.roles[0] === 'COMMITTEE') redirect('/comissao');
    if (session.roles[0] === 'SCREENER') redirect('/triagem');
    redirect('/area-participante');
  }

  return (
    <div className={styles.wrapper}>
      <div className={styles.header}>
        <h1 className={styles.title}>Bem-vindo(a)!</h1>
        <p className={styles.description}>
          Você possui múltiplos perfis. Como deseja acessar o sistema agora?
        </p>
      </div>

      <div className={styles.options}>
        {session.roles.includes('ADMIN') && (
          <Link href="/admin" className={styles.optionCard}>
            <div className={styles.iconWrapper} style={{ backgroundColor: 'rgba(239, 68, 68, 0.1)', color: 'var(--color-error)' }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
              </svg>
            </div>
            <div className={styles.optionContent}>
              <h2 className={styles.optionTitle}>Administração</h2>
              <p className={styles.optionDescription}>Gerencie todo o sistema.</p>
            </div>
            <div className={styles.arrow}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="9 18 15 12 9 6"></polyline>
              </svg>
            </div>
          </Link>
        )}

        {(session.roles.includes('COMMITTEE') || session.roles.includes('ADMIN')) && (
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
              <h2 className={styles.optionTitle}>Comissão (2ª Etapa)</h2>
              <p className={styles.optionDescription}>Emita pareceres científicos finais.</p>
            </div>
            <div className={styles.arrow}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="9 18 15 12 9 6"></polyline>
              </svg>
            </div>
          </Link>
        )}

        {(session.roles.includes('SCREENER') || session.roles.includes('ADMIN')) && (
          <Link href="/triagem" className={styles.optionCard}>
            <div className={styles.iconWrapper} style={{ backgroundColor: 'rgba(234, 179, 8, 0.1)', color: '#ca8a04' }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                <polyline points="22 4 12 14.01 9 11.01"></polyline>
              </svg>
            </div>
            <div className={styles.optionContent}>
              <h2 className={styles.optionTitle}>Triagem (1ª Etapa)</h2>
              <p className={styles.optionDescription}>Realize a primeira verificação dos trabalhos.</p>
            </div>
            <div className={styles.arrow}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="9 18 15 12 9 6"></polyline>
              </svg>
            </div>
          </Link>
        )}

        {session.roles.includes('PARTICIPANT') && (
          <Link href="/area-participante" className={styles.optionCard}>
            <div className={styles.iconWrapper} style={{ backgroundColor: 'rgba(59, 130, 246, 0.1)', color: '#2563eb' }}>
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
        )}
      </div>
    </div>
  );
}
