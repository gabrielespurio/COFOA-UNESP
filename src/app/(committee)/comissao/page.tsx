import { Metadata } from 'next';
import Link from 'next/link';
import { SectionHeading } from '@/components/ui/SectionHeading/SectionHeading';
import { Button } from '@/components/ui/Button/Button';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';
import { parseLectureConfig } from '@/lib/lectureConfig';
import {
  HandsOnEnrollmentsCard,
  HandsOnWorkshopItem,
  HandsOnEnrollmentItem,
} from '@/app/(admin)/admin/HandsOnEnrollmentsCard';
import styles from './page.module.css';

export const metadata: Metadata = {
  title: 'Painel Gerencial - Comissão',
};

export default async function ComissaoDashboardPage() {
  const session = await getSession();
  const isSecretaryOnly = session?.roles?.includes('SECRETARY') && 
    !session?.roles?.includes('COMMITTEE') && 
    !session?.roles?.includes('ADMIN');

  if (isSecretaryOnly) {
    const totalParticipants = await prisma.participant.count();
    const totalAttendances = await prisma.lectureAttendance.count();
    const kitDeliveries = await prisma.lectureAttendance.count({
      where: { lectureId: 'credenciamento-brinde' }
    });

    return (
      <div className={styles.container}>
        <SectionHeading 
          title="Painel da Secretaria" 
          subtitle="Visão geral de credenciamento, entrega de kits e controle de presença."
          alignment="left"
        />
        
        <div className={styles.metricsGrid}>
          <div className={styles.metricCard}>
            <div className={styles.metricTitle}>Participantes Cadastrados</div>
            <div className={styles.metricValue}>{totalParticipants}</div>
            <div className={styles.metricDesc}>Total de inscritos no evento</div>
          </div>
          
          <div className={styles.metricCard}>
            <div className={styles.metricTitle}>Kits de Brinde Entregues</div>
            <div className={styles.metricValue} style={{ color: 'var(--color-success)' }}>{kitDeliveries}</div>
            <div className={styles.metricDesc}>Retiradas realizadas no credenciamento</div>
          </div>
          
          <div className={styles.metricCard}>
            <div className={styles.metricTitle}>Leituras de Presença</div>
            <div className={styles.metricValue} style={{ color: 'var(--color-primary)' }}>{totalAttendances}</div>
            <div className={styles.metricDesc}>Total de QR Codes escaneados</div>
          </div>
        </div>

        <div style={{ marginTop: '2.5rem', display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
          <Link href="/comissao/presenca" style={{ textDecoration: 'none' }}>
            <Button variant="primary">
              📷 Acessar Leitor de QR Code (Presença)
            </Button>
          </Link>
          <Link href="/comissao/crachas" style={{ textDecoration: 'none' }}>
            <Button variant="outline">
              🪪 Crachás e Credenciamento
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  // Dashboard da Comissão Científica
  const totalSubmissions = await prisma.scientificWork.count({
    where: { status: { not: 'DRAFT' }, stage1Approved: true }
  });

  const pendingAnalysis = await prisma.scientificWork.count({
    where: { status: 'SUBMITTED', stage1Approved: true }
  });

  const analyzed = await prisma.scientificWork.count({
    where: {
      status: {
        in: ['ACCEPTED', 'REJECTED', 'REVISION_REQUESTED', 'UNDER_REVIEW']
      },
      stage1Approved: true
    }
  });

  // Consultas de Hands-On e Mini-Hands para a Comissão
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
    <div className={styles.container}>
      <SectionHeading 
        title="Painel Gerencial" 
        subtitle="Visão geral da produtividade de avaliação dos trabalhos científicos e gestão de atividades."
        alignment="left"
      />
      
      <div className={styles.metricsGrid}>
        <div className={styles.metricCard}>
          <div className={styles.metricTitle}>Trabalhos Submetidos</div>
          <div className={styles.metricValue}>{totalSubmissions}</div>
          <div className={styles.metricDesc}>Total recebido para o evento</div>
        </div>
        
        <div className={styles.metricCard}>
          <div className={styles.metricTitle}>Pendentes de Análise</div>
          <div className={styles.metricValue} style={{ color: 'var(--color-warning)' }}>{pendingAnalysis}</div>
          <div className={styles.metricDesc}>Aguardando avaliação da comissão</div>
        </div>
        
        <div className={styles.metricCard}>
          <div className={styles.metricTitle}>Trabalhos Analisados</div>
          <div className={styles.metricValue} style={{ color: 'var(--color-success)' }}>{analyzed}</div>
          <div className={styles.metricDesc}>Aprovados, reprovados ou com ressalva</div>
        </div>

        <HandsOnEnrollmentsCard
          workshops={serializedWorkshops}
          enrollments={flatEnrollments}
        />
      </div>
    </div>
  );
}
