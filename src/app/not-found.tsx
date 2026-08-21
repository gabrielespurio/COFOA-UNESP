import Link from 'next/link';
import { Logo } from '@/components/common/Logo/Logo';
import { Button } from '@/components/ui/Button/Button';
import styles from './not-found.module.css';

export default function NotFound() {
  return (
    <div className={styles.layout}>
      <div className={styles.logoWrapper}>
        <Logo variant="default" height={80} />
      </div>
      <h1 className={styles.title}>404 - Página não encontrada</h1>
      <p className={styles.text}>
        Desculpe, a página que você está procurando não existe ou foi movida.
      </p>
      <Link href="/" passHref legacyBehavior>
        <Button variant="primary" size="lg">
          Voltar para o Início
        </Button>
      </Link>
    </div>
  );
}
