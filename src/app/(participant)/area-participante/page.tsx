import { Metadata } from 'next';
import { SectionHeading } from '@/components/ui/SectionHeading/SectionHeading';
import { Button } from '@/components/ui/Button/Button';
import { getSession } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import styles from './page.module.css';

export const metadata: Metadata = {
  title: 'Área do Participante',
};

export default async function ParticipantDashboardPage() {
  const session = await getSession();
  
  if (!session) {
    return null; // Handled by layout
  }

  const participant = await prisma.participant.findUnique({
    where: { userId: session.userId },
    include: {
      registration: true,
      scientificWorks: true,
    }
  });

  return (
    <div>
      <SectionHeading 
        overline="Painel de Controle"
        title={participant ? `Bem-vindo a área do Participante - ${participant.fullName.split(' ')[0]}` : "Bem-vindo a área do Participante"}
      />
      
      {!participant && (
        <div className={styles.alertCard}>
          <h3>Seu perfil está incompleto</h3>
          <p>Para se inscrever no congresso e submeter trabalhos, você precisa preencher seus dados pessoais.</p>
          <Button href="/area-participante/perfil" variant="primary" style={{ marginTop: '1rem' }}>
            Completar Perfil
          </Button>
        </div>
      )}

      {participant && (
        <div className={styles.grid}>
          <div className={styles.card}>
            <div className={styles.cardTitle}>Status da Inscrição</div>
            {!participant.registration ? (
              <>
                <div className={`${styles.cardValue}`}>Não Iniciada</div>
                <div className={styles.cardDesc}>Você ainda não se inscreveu</div>
                <Button href="/area-participante/inscricao" variant="primary" size="sm" style={{ marginTop: '1rem' }}>
                  Fazer Inscrição
                </Button>
              </>
            ) : (
              <>
                <div className={`${styles.cardValue} ${participant.registration.status === 'PENDING' ? styles.statusPending : styles.statusActive}`}>
                  {participant.registration.status === 'PENDING' ? 'Pendente' : 'Confirmada'}
                </div>
                <div className={styles.cardDesc}>
                  {participant.registration.status === 'PENDING' ? 'Aguardando pagamento' : 'Inscrição efetuada com sucesso'}
                </div>
              </>
            )}
          </div>
          <div className={styles.card}>
            <div className={styles.cardTitle}>Meus Trabalhos</div>
            <div className={styles.cardValue}>{participant.scientificWorks.length}</div>
            <div className={styles.cardDesc}>Submissões cadastradas</div>
          </div>
          <div className={styles.card}>
            <div className={styles.cardTitle}>Certificado</div>
            <div className={styles.cardValue}>Indisponível</div>
            <div className={styles.cardDesc}>Será liberado após o evento</div>
          </div>
        </div>
      )}
    </div>
  );
}
