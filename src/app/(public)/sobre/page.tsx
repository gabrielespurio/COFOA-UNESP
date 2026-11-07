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
          subtitle="Conheça mais sobre o Congresso da Faculdade de Odontologia de Araçatuba — FOA UNESP."
        />
        <div className={styles.content}>
          <div className={styles.placeholder}>
            <p>
              O Congresso da Faculdade de Odontologia de Araçatuba (COFOA/Unesp) chega à sua 15ª edição, reafirmando sua posição entre os mais relevantes eventos acadêmicos e científicos da Odontologia no país. Ao longo de sua trajetória, o Congresso tem ampliado seu alcance e representatividade, reunindo estudantes, cirurgiões-dentistas, pesquisadores e docentes em um ambiente dedicado à troca de experiências e construção do conhecimento.
            </p>
            <p style={{ marginTop: '1rem' }}>
              A programação contempla diferentes áreas da Odontologia, promovendo educação continuada, discussão de casos clínicos e integração entre ensino, pesquisa e prática profissional. Contaremos com palestrantes renomados abordando temas contemporâneos vitais para a prática clínica.
            </p>
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
