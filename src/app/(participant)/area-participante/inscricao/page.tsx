import { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { SectionHeading } from '@/components/ui/SectionHeading/SectionHeading';
import { Button } from '@/components/ui/Button/Button';
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
          <p style={{ marginTop: '0.5rem', color: 'var(--color-text-secondary)' }}>
            Sua inscrição no congresso já está registrada no sistema.
          </p>
          <div style={{ marginTop: '1.5rem', padding: '1rem', background: '#fff', borderRadius: 'var(--radius-sm, 6px)', border: '1px solid var(--color-border)' }}>
            <h4 style={{ fontWeight: 600, marginBottom: '0.5rem' }}>Deseja participar também da Banca Avaliadora Externa?</h4>
            <p style={{ fontSize: '0.9rem', color: 'var(--color-text-secondary)', marginBottom: '0.5rem' }}>
              Mesmo já inscrito para apresentação de trabalhos, você pode aderir à Banca Avaliadora Externa diretamente pela Área do Participante.
            </p>
            <p style={{ fontSize: '0.825rem', color: 'var(--color-text-muted)', marginBottom: '1rem', lineHeight: '1.4' }}>
              <strong>Observação:</strong> Destinada a alunos de outras instituições e alunos da FOA que estão fora do país (anexar o comprovante de matrícula ou de pós-graduação sanduíche).
            </p>
            <Button href="/area-participante" variant="primary" size="sm">
              Ir para a Área do Participante
            </Button>
          </div>
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
      ]
    });
    categories = await prisma.registrationCategory.findMany({
      orderBy: { sortOrder: 'asc' }
    });
  }

  // Seed batches if empty
  const batchesCount = await prisma.registrationBatch.count();
  if (batchesCount === 0) {
    await prisma.registrationBatch.createMany({
      data: [
        { name: 'Lote Promocional', startDate: new Date('2026-08-27T00:00:00-03:00'), endDate: new Date('2026-10-09T23:59:59-03:00'), pricePresencialTier1: 17500, pricePresencialTier2: 18500, pricePresencialTier3: 20000, priceOnlineTier1: 7000, priceOnlineTier2: 9500 },
        { name: '1º Lote', startDate: new Date('2026-10-10T00:00:00-03:00'), endDate: new Date('2026-11-05T23:59:59-03:00'), pricePresencialTier1: 18500, pricePresencialTier2: 19500, pricePresencialTier3: 21000, priceOnlineTier1: 8000, priceOnlineTier2: 10500 },
        { name: '2º Lote', startDate: new Date('2026-11-06T00:00:00-03:00'), endDate: new Date('2026-11-22T23:59:59-03:00'), pricePresencialTier1: 21000, pricePresencialTier2: 22000, pricePresencialTier3: 23000, priceOnlineTier1: 10500, priceOnlineTier2: 12000 },
      ]
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
