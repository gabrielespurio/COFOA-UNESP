import { getSession } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { SectionHeading } from '@/components/ui/SectionHeading/SectionHeading';
import { EvaluatorForm } from './EvaluatorForm';
import styles from './page.module.css';

export default async function AvaliadorPage() {
  const session = await getSession();
  if (!session) return null;

  const profile = await prisma.evaluatorProfile.findUnique({
    where: { userId: session.userId }
  });

  return (
    <div className={styles.container}>
      <SectionHeading 
        title="Banca Avaliadora" 
        subtitle="Complete seu cadastro para acessar as avaliações."
        alignment="left"
      />

      <div className={styles.card}>
        <div className={styles.emailDisplay}>
          <span className={styles.emailLabel}>Seu E-mail:</span>
          <span className={styles.emailValue}>{session.email}</span>
        </div>

        {profile ? (
          <div className={styles.successState}>
            <div className={styles.successIcon}>✓</div>
            <h3>Perfil Configurado!</h3>
            <p>Seus dados foram salvos com sucesso.</p>
            <div className={styles.profileSummary}>
              <p><strong>Nome:</strong> {profile.fullName}</p>
              <p><strong>Unidade:</strong> {profile.institution}</p>
              <p><strong>Área:</strong> {profile.area}</p>
              <p><strong>Telefone:</strong> {profile.phone}</p>
            </div>
            <div className={styles.waitingMessage}>
              Aguarde! Em breve os trabalhos serão designados para sua avaliação.
            </div>
          </div>
        ) : (
          <div className={styles.formWrapper}>
            <EvaluatorForm />
          </div>
        )}
      </div>
    </div>
  );
}
