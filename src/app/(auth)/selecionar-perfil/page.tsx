import { getSession } from '@/lib/auth';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import styles from './page.module.css';

export const metadata = {
  title: 'Selecionar Perfil | COFOA',
};

export default async function SelecionarPerfilPage() {
  const session = await getSession();

  // Se não estiver logado, manda pro login
  if (!session) {
    redirect('/login');
  }

  // Se não for comissão, manda pra área dele (por segurança)
  if (session.role !== 'COMMITTEE') {
    if (session.role === 'ADMIN') redirect('/admin');
    redirect('/area-participante');
  }

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <h1 className={styles.title}>Bem-vindo(a)!</h1>
        <p className={styles.description}>
          Identificamos que você possui múltiplas permissões no sistema. Como deseja acessar o painel agora?
        </p>

        <div className={styles.options}>
          <Link href="/area-participante" className={`${styles.optionCard} ${styles.optionCardParticipant}`}>
            <h2 className={styles.optionTitle}>Acessar como Participante</h2>
            <p className={styles.optionDescription}>Para submeter trabalhos, visualizar inscrições e acompanhar sua participação geral no evento.</p>
          </Link>

          <Link href="/comissao" className={`${styles.optionCard} ${styles.optionCardEvaluator}`}>
            <h2 className={styles.optionTitle}>Acessar como Avaliador da Comissão</h2>
            <p className={styles.optionDescription}>Para acessar os trabalhos designados à você e emitir pareceres científicos.</p>
          </Link>
        </div>
      </div>
    </div>
  );
}
