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
        { id: 'grad-pos-foa', name: 'Graduandos e Pós-Graduandos da FOA UNESP', type: 'PRESENCIAL', priceTier: 'PRESENCIAL_TIER1', requiresStudentProof: true, requiresCRO: false, requiresAbroadProof: false, sortOrder: 1, active: true },
        { id: 'grad-pos-ext', name: 'Graduandos e Pós-Graduandos de outras instituições', type: 'PRESENCIAL', priceTier: 'PRESENCIAL_TIER2', requiresStudentProof: true, requiresCRO: false, requiresAbroadProof: false, sortOrder: 2, active: true },
        { id: 'doc-prof', name: 'Docentes e Profissionais da Odontologia', type: 'PRESENCIAL', priceTier: 'PRESENCIAL_TIER3', requiresStudentProof: false, requiresCRO: true, requiresAbroadProof: false, sortOrder: 3, active: true },
        { id: 'foa-ext-1', name: 'Alunos da FOA UNESP no exterior - Apresentação de 1 trabalho online', type: 'ONLINE', priceTier: 'ONLINE_TIER1', requiresStudentProof: true, requiresCRO: false, requiresAbroadProof: true, sortOrder: 4, active: true },
        { id: 'foa-ext-2', name: 'Alunos da FOA UNESP no exterior - Apresentação de 2 trabalhos online', type: 'ONLINE', priceTier: 'ONLINE_TIER2', requiresStudentProof: true, requiresCRO: false, requiresAbroadProof: true, sortOrder: 5, active: true },
        { id: 'com-ext-1', name: 'Comunidade Externa - Apresentação de 1 trabalho online', type: 'ONLINE', priceTier: 'ONLINE_TIER1', requiresStudentProof: false, requiresCRO: false, requiresAbroadProof: false, sortOrder: 6, active: true },
        { id: 'com-ext-2', name: 'Comunidade Externa - Apresentação de 2 trabalhos online', type: 'ONLINE', priceTier: 'ONLINE_TIER2', requiresStudentProof: false, requiresCRO: false, requiresAbroadProof: false, sortOrder: 7, active: true },
        { id: 'com-ext-banca', name: 'Comunidade Externa - Banca avaliadora dos trabalhos on-line', type: 'ONLINE', priceTier: 'ONLINE_TIER2', requiresStudentProof: false, requiresCRO: false, requiresAbroadProof: false, sortOrder: 8, active: true },
        { id: 'foa-ext-banca', name: 'Alunos da FOA UNESP no exterior - Banca avaliadora dos trabalhos on-line', type: 'ONLINE', priceTier: 'ONLINE_TIER2', requiresStudentProof: true, requiresCRO: false, requiresAbroadProof: true, sortOrder: 9, active: true },
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
