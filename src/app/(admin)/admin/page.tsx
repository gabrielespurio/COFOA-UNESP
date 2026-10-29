import { Metadata } from 'next';
import { SectionHeading } from '@/components/ui/SectionHeading/SectionHeading';
import { prisma } from '@/lib/prisma';
import { BancaEvaluatorsCard } from './BancaEvaluatorsCard';
import styles from './page.module.css';

export const metadata: Metadata = {
  title: 'Dashboard | Admin',
};

// We allow timeRange and category filters
export default async function AdminDashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ timeRange?: string; category?: string }> | { timeRange?: string; category?: string }
}) {
  const resolvedParams = searchParams ? await Promise.resolve(searchParams) : {};
  const timeRange = resolvedParams?.timeRange || 'all'; // '7d', '30d', 'all'
  const categoryId = resolvedParams?.category || 'all';

  // Construct where clauses based on filters
  let createdAtFilter = {};
  if (timeRange === '7d') {
    createdAtFilter = { gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) };
  } else if (timeRange === '30d') {
    createdAtFilter = { gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) };
  }

  let registrationWhere: any = {};
  if (Object.keys(createdAtFilter).length > 0) {
    registrationWhere.createdAt = createdAtFilter;
  }
  if (categoryId !== 'all') {
    registrationWhere.categoryId = categoryId;
  }

  // 1. Total Participantes Cadastrados
  const totalParticipants = await prisma.participant.count({
    where: Object.keys(createdAtFilter).length > 0 ? { createdAt: createdAtFilter } : undefined
  });

  // 2. Inscrições Totais
  const totalRegistrations = await prisma.registration.count({
    where: registrationWhere
  });

  // 3. Inscrições Pendentes
  const pendingRegistrations = await prisma.registration.count({
    where: { ...registrationWhere, status: 'PENDING' }
  });

  // 4. Inscrições Confirmadas
  const confirmedRegistrations = await prisma.registration.count({
    where: { ...registrationWhere, status: 'CONFIRMED' }
  });

  // 5. Trabalhos Submetidos
  const totalWorks = await prisma.scientificWork.count({
    where: Object.keys(createdAtFilter).length > 0 ? { createdAt: createdAtFilter } : undefined
  });

  // 6. Faturamento (Sum of amount from CONFIRMED registrations)
  const revenueResult = await prisma.registration.aggregate({
    _sum: { amount: true },
    where: { ...registrationWhere, status: 'CONFIRMED' }
  });
  const totalRevenue = (revenueResult._sum.amount || 0) / 100; // Assuming cents

  // 7. Usuários da Banca Avaliadora
  const bancaUsers = await prisma.user.findMany({
    where: {
      OR: [
        { roles: { has: 'EVALUATOR' } },
        {
          participant: {
            OR: [
              {
                registration: {
                  status: 'CONFIRMED',
                  category: {
                    OR: [
                      { id: { in: ['banca-int', 'banca-ext'] } },
                      { name: { contains: 'Banca', mode: 'insensitive' } },
                      { priceTier: 'BANCA_EXTERNA' }
                    ]
                  }
                }
              },
              {
                externalBoardEnrollment: {
                  status: 'PAID'
                }
              }
            ]
          }
        }
      ]
    },
    select: {
      id: true,
      email: true,
      createdAt: true,
      participant: {
        select: {
          fullName: true,
          cpf: true,
          phone: true,
          institution: true,
          course: true,
          registration: {
            select: {
              status: true,
              category: {
                select: { name: true }
              }
            }
          }
        }
      },
      evaluatorProfile: {
        select: {
          fullName: true,
          institution: true,
          area: true,
          phone: true
        }
      }
    },
    orderBy: { createdAt: 'desc' }
  });

  const serializedBancaUsers = bancaUsers.map(u => ({
    id: u.id,
    email: u.email,
    name: u.participant?.fullName || u.evaluatorProfile?.fullName || 'Nome não informado',
    institution: u.participant?.institution || u.evaluatorProfile?.institution || 'Não informada',
    areaOrCourse: u.evaluatorProfile?.area || u.participant?.course || null,
    phone: u.participant?.phone || u.evaluatorProfile?.phone || null,
    category: u.participant?.registration?.category?.name || (u.evaluatorProfile ? 'Perfil Avaliador' : 'Banca Avaliadora'),
    createdAt: u.createdAt.toISOString(),
  }));

  // Fetch categories for the filter dropdown
  const categories = await prisma.registrationCategory.findMany({ select: { id: true, name: true }});

  return (
    <div>
      <SectionHeading title="Painel Gerencial" subtitle="Acompanhe os principais indicadores do congresso em tempo real." />
      
      <form className={styles.filtersForm}>
        <div className={styles.filterGroup}>
          <label>Período</label>
          <select name="timeRange" defaultValue={timeRange} className={styles.select}>
            <option value="all">Todo o Período</option>
            <option value="30d">Últimos 30 Dias</option>
            <option value="7d">Últimos 7 Dias</option>
          </select>
        </div>
        
        <div className={styles.filterGroup}>
          <label>Categoria</label>
          <select name="category" defaultValue={categoryId} className={styles.select}>
            <option value="all">Todas as Categorias</option>
            {categories.map(c => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>

        <button type="submit" className={styles.filterButton}>Aplicar Filtros</button>
      </form>

      <div className={styles.grid}>
        <div className={styles.card}>
          <div className={styles.cardTitle}>Participantes</div>
          <div className={styles.cardValue}>{totalParticipants}</div>
        </div>

        <BancaEvaluatorsCard evaluators={serializedBancaUsers} />

        <div className={styles.card}>
          <div className={styles.cardTitle}>Inscrições (Total)</div>
          <div className={styles.cardValue}>{totalRegistrations}</div>
        </div>

        <div className={`${styles.card} ${styles.cardHighlight}`}>
          <div className={styles.cardTitle}>Inscrições Pendentes</div>
          <div className={styles.cardValue}>{pendingRegistrations}</div>
        </div>

        <div className={styles.card}>
          <div className={styles.cardTitle}>Inscrições Confirmadas</div>
          <div className={styles.cardValue}>{confirmedRegistrations}</div>
        </div>

        <div className={styles.card}>
          <div className={styles.cardTitle}>Trabalhos Submetidos</div>
          <div className={styles.cardValue}>{totalWorks}</div>
        </div>

        <div className={`${styles.card} ${styles.cardHighlight}`}>
          <div className={styles.cardTitle}>Faturamento Bruto</div>
          <div className={styles.cardValue}>R$ {totalRevenue.toFixed(2)}</div>
        </div>
      </div>
    </div>
  );
}
