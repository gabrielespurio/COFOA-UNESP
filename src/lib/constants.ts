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
  { id: 'grad-foa', name: 'Graduando da Faculdade de Odontologia de Araçatuba — FOA UNESP', type: 'presencial' as const, priceTier: 'standard' as const },
  { id: 'pos-foa', name: 'Pós-Graduando da Faculdade de Odontologia de Araçatuba — FOA UNESP', type: 'presencial' as const, priceTier: 'standard' as const },
  { id: 'grad-ext', name: 'Graduando de Instituição Externa', type: 'presencial' as const, priceTier: 'standard' as const },
  { id: 'pos-ext', name: 'Pós-Graduando de Instituição Externa', type: 'presencial' as const, priceTier: 'standard' as const },
  { id: 'profissional', name: 'Profissional da Odontologia', type: 'presencial' as const, priceTier: 'standard' as const },
  { id: 'docente-foa', name: 'Docente da Faculdade de Odontologia de Araçatuba — FOA UNESP', type: 'presencial' as const, priceTier: 'pending' as const },
  // Online
  { id: 'foa-exterior-1', name: 'Graduando ou Pós-Graduando da FOA UNESP em estágio no exterior — apresentação de 01 trabalho on-line', type: 'online' as const, priceTier: 'online_tier1' as const },
  { id: 'foa-exterior-2', name: 'Graduando ou Pós-Graduando da FOA UNESP em estágio no exterior — apresentação de 02 trabalhos on-line', type: 'online' as const, priceTier: 'online_tier2' as const },
  { id: 'ext-online-1', name: 'Comunidade Externa — apresentação de 01 trabalho on-line', type: 'online' as const, priceTier: 'online_tier1' as const },
  { id: 'ext-online-2', name: 'Comunidade Externa — apresentação de 02 trabalhos on-line', type: 'online' as const, priceTier: 'online_tier2' as const },
  { id: 'ext-banca', name: 'Comunidade Externa — banca avaliadora dos trabalhos on-line', type: 'online' as const, priceTier: 'online_tier2' as const },
  { id: 'pos-exterior-banca', name: 'Pós-Graduando da FOA UNESP em estágio no exterior — banca avaliadora dos trabalhos on-line', type: 'online' as const, priceTier: 'online_tier2' as const },
] as const;

export const REGISTRATION_BATCHES = [
  {
    id: 'promotional',
    name: 'Lote Promocional',
    startDate: null, // To be defined
    endDate: null,   // To be defined
    prices: {
      standard: 18500,     // R$ 185,00 in cents
      online_tier1: 7000,  // R$ 70,00
      online_tier2: 9000,  // R$ 90,00
    },
    status: 'upcoming' as const,
  },
  {
    id: 'first',
    name: '1º Lote',
    startDate: null,
    endDate: null,
    prices: {
      standard: 19500,
      online_tier1: 8000,
      online_tier2: 10000,
    },
    status: 'upcoming' as const,
  },
  {
    id: 'second',
    name: '2º Lote',
    startDate: null,
    endDate: null,
    prices: {
      standard: 22000,
      online_tier1: 10000,
      online_tier2: 12000,
    },
    status: 'upcoming' as const,
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
  { href: '/inscricoes', label: 'Inscrições', requiresAuth: true },
  { href: '/trabalhos', label: 'Trabalhos', requiresAuth: true },
  { href: '/#local', label: 'Local' },
];
