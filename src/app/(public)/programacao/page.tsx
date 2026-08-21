import { Metadata } from 'next';
import { Container } from '@/components/ui/Container/Container';
import { SectionHeading } from '@/components/ui/SectionHeading/SectionHeading';
import styles from './page.module.css';

export const metadata: Metadata = {
  title: 'Programação',
};

const DAYS = [
  { date: '25 de Novembro', day: 'Segunda-feira' },
  { date: '26 de Novembro', day: 'Terça-feira' },
  { date: '27 de Novembro', day: 'Quarta-feira' },
  { date: '28 de Novembro', day: 'Quinta-feira' },
];

export default function ProgramacaoPage() {
  return (
    <section className={styles.section}>
      <Container>
        <SectionHeading 
          title="Programação" 
          subtitle="Confira a grade completa de palestras, workshops e apresentações."
        />
        <div className={styles.timeline}>
          {DAYS.map((d, i) => (
            <div key={i} className={styles.day}>
              <h3 className={styles.dayTitle}>{d.date} - {d.day}</h3>
              <p className={styles.emptyState}>A programação deste dia será divulgada em breve.</p>
            </div>
          ))}
        </div>
      </Container>
    </section>
  );
}
