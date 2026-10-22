import { Metadata } from 'next';
import { SectionHeading } from '@/components/ui/SectionHeading/SectionHeading';
import { prisma } from '@/lib/prisma';
import { ParticipantesTable } from './ParticipantesTable';

export const metadata: Metadata = {
  title: 'Participantes | Admin',
};

export default async function AdminParticipantesPage() {
  const [participants, categories] = await Promise.all([
    prisma.participant.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        user: { select: { email: true, roles: true } },
        registration: { 
          include: {
            category: { select: { id: true, name: true, type: true } },
            coupon: { select: { id: true, code: true, discountValue: true } },
            payment: { select: { id: true, gatewayId: true, status: true } }
          }
        }
      }
    }),
    prisma.registrationCategory.findMany({
      where: { active: true },
      orderBy: { sortOrder: 'asc' },
      select: { id: true, name: true, type: true }
    })
  ]);

  return (
    <div>
      <SectionHeading 
        title="Participantes" 
        subtitle="Lista de todos os usuários cadastrados no sistema. Gerencie dados, categorias e inscrições." 
      />
      <ParticipantesTable participants={participants} categories={categories} />
    </div>
  );
}
