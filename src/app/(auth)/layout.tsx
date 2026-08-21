import { Logo } from '@/components/common/Logo/Logo';
import Link from 'next/link';
import styles from './layout.module.css';

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className={styles.layout}>
      <Link href="/" className={styles.backLink}>
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <line x1="19" y1="12" x2="5" y2="12"></line>
          <polyline points="12 19 5 12 12 5"></polyline>
        </svg>
        Voltar para o início
      </Link>
      <div className={styles.card}>
        <div className={styles.logoWrapper}>
          <Link href="/">
            <Logo variant="default" height={48} />
          </Link>
        </div>
        <div className={styles.header}>
          <h1 className={styles.title}>Acesso ao Sistema</h1>
          <p className={styles.subtitle}>Entre com suas credenciais para continuar.</p>
        </div>
        {children}
      </div>
    </div>
  );
}
