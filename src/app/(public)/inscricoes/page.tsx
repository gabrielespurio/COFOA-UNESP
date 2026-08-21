import { Metadata } from 'next';
import Link from 'next/link';
import { Container } from '@/components/ui/Container/Container';
import { SectionHeading } from '@/components/ui/SectionHeading/SectionHeading';
import { Button } from '@/components/ui/Button/Button';
import styles from './page.module.css';

export const metadata: Metadata = {
  title: 'Inscrições',
};

export default function InscricoesPage() {
  return (
    <section className={styles.section}>
      <Container>
        <SectionHeading 
          title="Inscrições" 
          subtitle="Garanta sua vaga no XV COFOA."
        />
        <div className={styles.content}>
          <div className={styles.batchInfo}>Lote Atual: 1º Lote (Em breve)</div>
          <p className={styles.intro}>
            Prepare-se para o maior congresso de odontologia da região. 
            As inscrições estarão abertas em breve com valores promocionais.
          </p>
          <div className={styles.categories}>
            <div className={styles.categoryCard}>
              <h3 className={styles.categoryTitle}>Acadêmicos</h3>
              <p>Estudantes de graduação em Odontologia.</p>
            </div>
            <div className={styles.categoryCard}>
              <h3 className={styles.categoryTitle}>Profissionais</h3>
              <p>Cirurgiões-dentistas e especialistas.</p>
            </div>
          </div>
          <div className={styles.ctaWrapper}>
            <Link href="/cadastro" passHref legacyBehavior>
              <Button variant="primary" size="lg">Fazer Inscrição</Button>
            </Link>
          </div>
        </div>
      </Container>
    </section>
  );
}
