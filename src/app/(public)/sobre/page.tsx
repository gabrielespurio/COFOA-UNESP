import { Metadata } from 'next';
import { Container } from '@/components/ui/Container/Container';
import { SectionHeading } from '@/components/ui/SectionHeading/SectionHeading';
import { EVENT } from '@/lib/constants';
import styles from './page.module.css';

export const metadata: Metadata = {
  title: 'Sobre',
};

export default function SobrePage() {
  return (
    <section className={styles.section}>
      <Container>
        <SectionHeading 
          title="Sobre o COFOA XV" 
          subtitle="Conheça mais sobre o maior congresso de Odontologia do Sul Fluminense."
        />
        <div className={styles.content}>
          <div className={styles.placeholder}>
            <p>O conteúdo completo sobre a história e os objetivos do COFOA XV será disponibilizado em breve.</p>
            <p style={{ marginTop: '1rem' }}>Estamos preparando informações detalhadas sobre a edição comemorativa de 15 anos do Congresso Odontológico da FOA.</p>
          </div>
          <aside className={styles.sidebar}>
            <div className={styles.fact}>
              <div className={styles.factTitle}>Data</div>
              <div className={styles.factValue}>{EVENT.dates.display}</div>
            </div>
            <div className={styles.fact}>
              <div className={styles.factTitle}>Local</div>
              <div className={styles.factValue}>{EVENT.location.name}</div>
            </div>
            <div className={styles.fact}>
              <div className={styles.factTitle}>Edição</div>
              <div className={styles.factValue}>15ª Edição</div>
            </div>
          </aside>
        </div>
      </Container>
    </section>
  );
}
