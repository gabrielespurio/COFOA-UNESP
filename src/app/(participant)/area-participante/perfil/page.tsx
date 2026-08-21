import { Metadata } from 'next';
import { SectionHeading } from '@/components/ui/SectionHeading/SectionHeading';
import { ProfileForm } from './ProfileForm';
import { getSession } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { redirect } from 'next/navigation';

export const metadata: Metadata = {
  title: 'Meu Perfil',
};

export default async function PerfilPage() {
  const session = await getSession();
  if (!session) redirect('/login');

  const participant = await prisma.participant.findUnique({
    where: { userId: session.userId },
  });

  return (
    <div>
      <SectionHeading 
        title="Meu Perfil" 
        subtitle={!participant ? "Por favor, complete seu perfil para acessar as outras áreas do painel." : "Mantenha seus dados atualizados."} 
      />
      <div style={{ marginTop: '2rem' }}>
        <ProfileForm initialData={participant} />
      </div>
    </div>
  );
}
