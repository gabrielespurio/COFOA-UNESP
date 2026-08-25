export const EVENT = {
  name: 'COFOA XV',
  fullName: '15º Congresso da Faculdade de Odontologia de Araçatuba',
  institution: 'Faculdade de Odontologia de Araçatuba — FOA UNESP',
  institutionShort: 'FOA UNESP',
  year: 2026,
  edition: 15,
  dates: {
    start: '2026-11-25',
    end: '2026-11-28',
    display: '25 a 28 de novembro de 2026',
    shortDisplay: '25–28 NOV 2026',
    days: 4,
  },
  hours: {
    start: '08h',
    end: '18h',
    display: '08h às 18h',
  },
  location: {
    name: 'Faculdade de Odontologia de Araçatuba — FOA UNESP',
    shortName: 'FOA UNESP',
    address: 'Rodovia Marechal Rondon, km 527/528',
    city: 'Araçatuba',
    state: 'SP',
    displayCity: 'Araçatuba/SP',
  },
} as const;

export const REGISTRATION_CATEGORIES = [
  // Presenciais
  { id: 'grad-pos-foa', name: 'Graduandos e Pós-Graduandos da FOA UNESP', type: 'presencial' as const, priceTier: 'presencial_tier1' as const },
  { id: 'grad-pos-ext', name: 'Graduandos e Pós-Graduandos de outras instituições', type: 'presencial' as const, priceTier: 'presencial_tier2' as const },
  { id: 'doc-prof', name: 'Docentes e Profissionais da Odontologia', type: 'presencial' as const, priceTier: 'presencial_tier3' as const },
  
  // Online
  { id: 'foa-ext-1', name: 'Alunos da FOA UNESP no exterior - Apresentação de 1 trabalho online', type: 'online' as const, priceTier: 'online_tier1' as const },
  { id: 'foa-ext-2', name: 'Alunos da FOA UNESP no exterior - Apresentação de 2 trabalhos online', type: 'online' as const, priceTier: 'online_tier2' as const },
  { id: 'com-ext-1', name: 'Comunidade Externa - Apresentação de 1 trabalho online', type: 'online' as const, priceTier: 'online_tier1' as const },
  { id: 'com-ext-2', name: 'Comunidade Externa - Apresentação de 2 trabalhos online', type: 'online' as const, priceTier: 'online_tier2' as const },
] as const;

export const REGISTRATION_BATCHES = [
  {
    id: 'promotional',
    name: 'Lote Promocional',
    startDate: '2026-08-27T00:00:00-03:00',
    endDate: '2026-10-09T23:59:59-03:00',
    prices: {
      presencial_tier1: 17500,
      presencial_tier2: 18500,
      presencial_tier3: 20000,
      online_tier1: 7000,
      online_tier2: 9500,
    },
  },
  {
    id: 'first',
    name: '1º Lote',
    startDate: '2026-10-10T00:00:00-03:00',
    endDate: '2026-11-05T23:59:59-03:00',
    prices: {
      presencial_tier1: 18500,
      presencial_tier2: 19500,
      presencial_tier3: 21000,
      online_tier1: 8000,
      online_tier2: 10500,
    },
  },
  {
    id: 'second',
    name: '2º Lote',
    startDate: '2026-11-06T00:00:00-03:00',
    endDate: '2026-11-22T23:59:59-03:00',
    prices: {
      presencial_tier1: 21000,
      presencial_tier2: 22000,
      presencial_tier3: 23000,
      online_tier1: 10500,
      online_tier2: 12000,
    },
  },
] as const;

export type NavLink = {
  href: string;
  label: string;
  requiresAuth?: boolean;
};

export const NAV_LINKS: readonly NavLink[] = [
  { href: '/', label: 'Início' },
  { href: '/#sobre', label: 'Sobre' },
  { href: '/#programacao', label: 'Programação' },
  { href: '/#inscricoes', label: 'Lotes' },
  { href: '/inscricoes', label: 'Inscrições', requiresAuth: true },
  { href: '/trabalhos', label: 'Trabalhos', requiresAuth: true },
  { href: '/#local', label: 'Local' },
];
