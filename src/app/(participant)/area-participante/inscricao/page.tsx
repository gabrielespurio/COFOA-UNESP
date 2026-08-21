import { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { SectionHeading } from '@/components/ui/SectionHeading/SectionHeading';
import { RegistrationForm } from './RegistrationForm';
import { getSession } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export const metadata: Metadata = {
  title: 'Minha Inscrição',
};

export default async function MinhaInscricaoPage() {
  const session = await getSession();
  if (!session) redirect('/login');

  const participant = await prisma.participant.findUnique({
    where: { userId: session.userId },
    include: { registration: true }
  });

  if (!participant) {
    redirect('/area-participante/perfil');
  }

  if (participant.registration) {
    return (
      <div>
        <SectionHeading title="Minha Inscrição" />
        <div style={{ marginTop: '2rem', padding: '2rem', background: 'var(--color-surface-alt)', borderRadius: 'var(--radius-md)' }}>
          <h3>Você já possui uma inscrição ({participant.registration.status})</h3>
          <p>Sua inscrição já está registrada no sistema. Em breve a área de pagamentos será liberada.</p>
        </div>
      </div>
    );
  }

  // Fetch active categories (mocking if empty for now)
  let categories = await prisma.registrationCategory.findMany({
    orderBy: { sortOrder: 'asc' }
  });

  // If the DB is completely empty (no categories seeded yet), seed it for testing
  if (categories.length === 0) {
    await prisma.registrationCategory.createMany({
      data: [
        { id: 'cat-1', name: 'Graduando FOA', type: 'PRESENCIAL', priceTier: 'STANDARD', requiresStudentProof: true, requiresCRO: false, requiresAbroadProof: false, sortOrder: 1, active: true },
        { id: 'cat-2', name: 'Profissional', type: 'PRESENCIAL', priceTier: 'STANDARD', requiresStudentProof: false, requiresCRO: true, requiresAbroadProof: false, sortOrder: 2, active: true },
        { id: 'cat-3', name: 'Participante Online', type: 'ONLINE', priceTier: 'ONLINE_TIER1', requiresStudentProof: false, requiresCRO: false, requiresAbroadProof: false, sortOrder: 3, active: true },
      ]
    });
    categories = await prisma.registrationCategory.findMany({
      orderBy: { sortOrder: 'asc' }
    });
  }

  // Also we need an active batch to be able to register. We'll handle this dynamically in the server action later.

  return (
    <div>
      <SectionHeading 
        title="Selecione sua Categoria" 
        subtitle="Escolha a categoria que melhor se aplica a você. Atenção aos comprovantes exigidos."
      />
      <div style={{ marginTop: '2rem' }}>
        <RegistrationForm categories={categories} participantId={participant.id} />
      </div>
    </div>
  );
}
