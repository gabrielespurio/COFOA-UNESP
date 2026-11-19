import { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { SectionHeading } from '@/components/ui/SectionHeading/SectionHeading';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';
import { parseLectureConfig } from '@/lib/lectureConfig';
import {
  HandsOnEnrollmentsCard,
  HandsOnWorkshopItem,
  HandsOnEnrollmentItem,
} from '@/app/(admin)/admin/HandsOnEnrollmentsCard';

export const metadata: Metadata = {
  title: 'Inscrições Hands-On - Comissão Científica',
};

export default async function ComissaoHandsOnPage() {
  const session = await getSession();
  if (!session || (!session.roles.includes('COMMITTEE') && !session.roles.includes('ADMIN'))) {
    redirect('/comissao');
  }

  const handsOnLectures = await prisma.lecture.findMany({
    where: {
      OR: [
        { title: { contains: '[HANDS-ON]' } },
        { title: { contains: '[MINI-HANDS]' } },
        { title: { contains: 'Hands', mode: 'insensitive' } },
        { id: { startsWith: 'handson-' } },
        { id: { startsWith: 'minihands-' } },
      ],
      active: true,
    },
    include: {
      enrollments: {
        where: { status: { not: 'CANCELLED' } },
        include: {
          participant: {
            select: {
              id: true,
              fullName: true,
              cpf: true,
              phone: true,
              institution: true,
              user: { select: { email: true } },
              registration: {
                select: {
                  status: true,
                  category: { select: { name: true } },
                },
              },
            },
          },
        },
        orderBy: { createdAt: 'asc' },
      },
    },
    orderBy: { startTime: 'asc' },
  });

  const serializedWorkshops: HandsOnWorkshopItem[] = handsOnLectures.map((lec) => {
    const config = parseLectureConfig(lec);
    return {
      id: lec.id,
      title: lec.title,
      speaker: lec.speaker,
      location: lec.location,
      startTime: lec.startTime.toISOString(),
      endTime: lec.endTime.toISOString(),
      type: config.type,
      typeLabel: config.typeLabel,
      maxCapacity: config.maxCapacity,
      isOpen: config.isOpen,
      cleanDescription: config.cleanDescription,
      enrolledCount: lec.enrollments.length,
      isFull: lec.enrollments.length >= config.maxCapacity,
    };
  });

  const flatEnrollments: HandsOnEnrollmentItem[] = [];
  for (const lec of handsOnLectures) {
    const config = parseLectureConfig(lec);
    for (const enr of lec.enrollments) {
      flatEnrollments.push({
        id: enr.id,
        participantId: enr.participant.id,
        name: enr.participant.fullName,
        email: enr.participant.user.email,
        phone: enr.participant.phone,
        cpf: enr.participant.cpf,
        institution: enr.participant.institution || 'Não informada',
        category: enr.participant.registration?.category?.name || 'Não informada',
        registrationStatus: enr.participant.registration?.status || 'PENDING',
        enrolledAt: enr.createdAt.toISOString(),
        workshopId: lec.id,
        workshopTitle: lec.title,
        workshopType: config.type,
        workshopLocation: lec.location,
        workshopStartTime: lec.startTime.toISOString(),
        workshopEndTime: lec.endTime.toISOString(),
      });
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <SectionHeading
        title="Inscrições Hands-On & Mini-Hands"
        subtitle="Consulte os congressistas inscritos em ordem cronológica de inscrição, visualize o preenchimento das 20 vagas e exporte os dados para planilha Excel (.csv)."
        alignment="left"
      />

      <div style={{ maxWidth: '450px' }}>
        <HandsOnEnrollmentsCard
          workshops={serializedWorkshops}
          enrollments={flatEnrollments}
        />
      </div>
    </div>
  );
}
