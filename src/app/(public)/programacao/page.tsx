import { Metadata } from 'next';
import { Container } from '@/components/ui/Container/Container';
import { SectionHeading } from '@/components/ui/SectionHeading/SectionHeading';
import { ProgramacaoClient } from './ProgramacaoClient';
import styles from './page.module.css';

export const metadata: Metadata = {
  title: 'Programação de Palestras — COFOA XV',
  description:
    'Confira a programação científica oficial completa do COFOA XV: palestras, simpósio da pós-graduação, palestrantes de renome e muito mais.',
};

export default function ProgramacaoPage() {
  return (
    <section className={styles.section}>
      <Container>
        <SectionHeading
          title="Programação de Palestras"
          subtitle="Confira a grade científica oficial completa com os palestrantes, horários e temas do COFOA XV."
        />
        <ProgramacaoClient />
      </Container>
    </section>
  );
}
