import { Metadata } from 'next';
import { SectionHeading } from '@/components/ui/SectionHeading/SectionHeading';
import { prisma } from '@/lib/prisma';
import styles from './page.module.css';

export const metadata: Metadata = {
  title: 'Dashboard | Admin',
};

// We allow timeRange and category filters
export default async function AdminDashboardPage({
  searchParams,
}: {
  searchParams: { timeRange?: string; category?: string }
}) {
  const timeRange = searchParams.timeRange || 'all'; // '7d', '30d', 'all'
  const categoryId = searchParams.category || 'all';

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
  // Since we don't have real payments yet, we sum the amount field of CONFIRMED registrations
  const revenueResult = await prisma.registration.aggregate({
    _sum: { amount: true },
    where: { ...registrationWhere, status: 'CONFIRMED' }
  });
  const totalRevenue = (revenueResult._sum.amount || 0) / 100; // Assuming cents

  // Fetch categories for the filter dropdown
  const categories = await prisma.registrationCategory.findMany({ select: { id: true, name: true }});

  const STATS = [
    { label: 'Participantes', value: totalParticipants, highlight: false },
    { label: 'Inscrições (Total)', value: totalRegistrations, highlight: false },
    { label: 'Inscrições Pendentes', value: pendingRegistrations, highlight: true },
    { label: 'Inscrições Confirmadas', value: confirmedRegistrations, highlight: false },
    { label: 'Trabalhos Submetidos', value: totalWorks, highlight: false },
    { label: 'Faturamento Bruto', value: `R$ ${totalRevenue.toFixed(2)}`, highlight: true },
  ];

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
        {STATS.map((stat, i) => (
          <div key={i} className={`${styles.card} ${stat.highlight ? styles.cardHighlight : ''}`}>
            <div className={styles.cardTitle}>{stat.label}</div>
            <div className={styles.cardValue}>{stat.value}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
