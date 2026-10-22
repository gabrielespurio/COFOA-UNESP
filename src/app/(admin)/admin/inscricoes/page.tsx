import { Metadata } from 'next';
import { SectionHeading } from '@/components/ui/SectionHeading/SectionHeading';
import { prisma } from '@/lib/prisma';
import { InscricoesTable } from './InscricoesTable';

export const metadata: Metadata = {
  title: 'Inscrições | Admin',
};

export default async function AdminInscricoesPage() {
  const [registrations, categories] = await Promise.all([
    prisma.registration.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        participant: { 
          include: {
            user: { select: { email: true } }
          }
        },
        category: { select: { id: true, name: true, type: true } },
        coupon: { select: { id: true, code: true, discountValue: true } },
        payment: { select: { id: true, gatewayResponse: true, gatewayId: true, status: true } }
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
        title="Inscrições" 
        subtitle="Gerencie as inscrições, altere categorias, edite dados e aprove comprovantes dos participantes." 
      />
      
      <InscricoesTable 
        initialRegistrations={registrations} 
        categories={categories} 
      />
    </div>
  );
}
