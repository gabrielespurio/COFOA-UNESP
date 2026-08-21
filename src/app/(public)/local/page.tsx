import { Metadata } from 'next';
import { Container } from '@/components/ui/Container/Container';
import { SectionHeading } from '@/components/ui/SectionHeading/SectionHeading';
import { EVENT } from '@/lib/constants';
import styles from './page.module.css';

export const metadata: Metadata = {
  title: 'Local',
};

export default function LocalPage() {
  return (
    <section className={styles.section}>
      <Container>
        <SectionHeading 
          title="Local do Evento" 
          subtitle="Onde o COFOA XV será realizado."
        />
        <div className={styles.content}>
          <div className={styles.info}>
            <h2 className={styles.title}>{EVENT.location.name}</h2>
            <div className={styles.address}>
              <p>{EVENT.location.address}</p>
              <p>{EVENT.location.city}</p>
            </div>
          </div>
          <div className={styles.mapPlaceholder}>
            Mapa do Local (Em breve)
          </div>
        </div>
      </Container>
    </section>
  );
}
