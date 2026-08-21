import { Metadata } from 'next';
import { Container } from '@/components/ui/Container/Container';
import { SectionHeading } from '@/components/ui/SectionHeading/SectionHeading';
import styles from './page.module.css';

export const metadata: Metadata = {
  title: 'Trabalhos Científicos',
};

export default function TrabalhosPage() {
  return (
    <section className={styles.section}>
      <Container>
        <SectionHeading 
          title="Trabalhos Científicos" 
          subtitle="Submeta sua pesquisa e compartilhe conhecimento."
        />
        <div className={styles.emptyState}>
          <div className={styles.icon}>📄</div>
          <h2 className={styles.title}>Edital em Breve</h2>
          <p className={styles.text}>
            As regras para submissão de trabalhos científicos (painéis, apresentações orais) 
            serão publicadas em breve. Acompanhe nossas redes sociais para atualizações.
          </p>
        </div>
      </Container>
    </section>
  );
}
