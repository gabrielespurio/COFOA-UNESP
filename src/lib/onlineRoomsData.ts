export interface OnlineRoom {
  id: string;
  roomNumber: number;
  roomName: string;
  shift: 'MANHÃ' | 'TARDE';
  dateStr: string;
  hours: string;
  area: string;
  category: 'Graduação' | 'Pós-Graduação' | 'Graduação e Pós-Graduação';
  banca: string[];
  mediator: string;
  meetUrl: string;
  sip: string;
}

export const ONLINE_ROOMS: OnlineRoom[] = [
  // ─── QUARTA-FEIRA (25/11/2026) – MANHÃ ──────────────────────────────────
  {
    id: 'online-m-sala-1',
    roomNumber: 1,
    roomName: 'Sala 1',
    shift: 'MANHÃ',
    dateStr: '25/11/2026 (Quarta-feira)',
    hours: '08:00h às 12:00h',
    area: 'CIÊNCIAS BÁSICAS – GRADUAÇÃO',
    category: 'Graduação',
    banca: [
      'Ana Claúdia Okamoto',
      'Alanna Ramalho Mateus',
      'Ana Julia Moreno Barreto'
    ],
    mediator: 'FRANCISCO DE ASSIS SANTOS E SANTOS',
    meetUrl: 'https://meet.google.com/prf-wrje-ucu',
    sip: 'sip:593937323916@vc.unesp.br'
  },
  {
    id: 'online-m-sala-2',
    roomNumber: 2,
    roomName: 'Sala 2',
    shift: 'MANHÃ',
    dateStr: '25/11/2026 (Quarta-feira)',
    hours: '08:00h às 12:00h',
    area: 'CTBMF – GRADUAÇÃO',
    category: 'Graduação',
    banca: [
      'Prof. Dr. Renato Torres Neto',
      'Paulo Matheus Honda Tavares',
      'Natália Gonçalves Santana'
    ],
    mediator: 'TATIELY NATÁLIA SILVA',
    meetUrl: 'https://meet.google.com/usw-ozvk-xim',
    sip: 'sip:683042090197@vc.unesp.br'
  },
  {
    id: 'online-m-sala-3',
    roomNumber: 3,
    roomName: 'Sala 3',
    shift: 'MANHÃ',
    dateStr: '25/11/2026 (Quarta-feira)',
    hours: '08:00h às 12:00h',
    area: 'DENTÍSTICA / HOF – GRADUAÇÃO',
    category: 'Graduação',
    banca: [
      'Prof. Glaúcia Beatriz Orsini',
      'Melissa Naomi Miyamura',
      'Rafael Rodrigues Dias'
    ],
    mediator: 'SAMUEL CAMPOS SOUSA',
    meetUrl: 'https://meet.google.com/rwr-gewm-uuy',
    sip: 'sip:532951958411@vc.unesp.br'
  },
  {
    id: 'online-m-sala-4',
    roomNumber: 4,
    roomName: 'Sala 4',
    shift: 'MANHÃ',
    dateStr: '25/11/2026 (Quarta-feira)',
    hours: '08:00h às 12:00h',
    area: 'ENDODONTIA – GRADUAÇÃO',
    category: 'Graduação',
    banca: [
      'Letícia Citelli Conti',
      'Nayara Gabriely',
      'Lucas Guilherme Leite Da Silva',
      'Romulo de Oliveira Sales-Junior'
    ],
    mediator: 'VITORIA VALESKA SILVA NASCIMENTO',
    meetUrl: 'https://meet.google.com/mcc-nmkx-bek',
    sip: 'sip:107684176427@vc.unesp.br'
  },
  {
    id: 'online-m-sala-5',
    roomNumber: 5,
    roomName: 'Sala 5',
    shift: 'MANHÃ',
    dateStr: '25/11/2026 (Quarta-feira)',
    hours: '08:00h às 12:00h',
    area: 'ESTOMATOLOGIA / PATOLOGIA / RADIOLOGIA – GRADUAÇÃO',
    category: 'Graduação',
    banca: [
      'Murilo Miranda Vasconscelos Viana',
      'Emanuelly Lemos De Souza',
      'Júlia França da Silva',
      'Gabriel Enrique Tantalean Laor',
      'Samyra Yukiko Tazaki Dote'
    ],
    mediator: 'ANA CARLA THALEZ YWABUCHI NOBUMOTO',
    meetUrl: 'https://meet.google.com/pen-odmk-bho',
    sip: 'sip:524785223053@vc.unesp.br'
  },
  {
    id: 'online-m-sala-6',
    roomNumber: 6,
    roomName: 'Sala 6',
    shift: 'MANHÃ',
    dateStr: '25/11/2026 (Quarta-feira)',
    hours: '08:00h às 12:00h',
    area: 'PERIODONTIA / IMPLANTODONTIA - GRADUAÇÃO',
    category: 'Graduação',
    banca: [
      'Prof. Ana Paula Bassi',
      'Laura Vidoto Paludetto',
      'Thais Oliveira Cordeiro',
      'Vitor Hugo Gonçalves Sampaio',
      'Rafael Araújo Rios'
    ],
    mediator: 'AMANDA RODRIGUES ARAÚJO',
    meetUrl: 'https://meet.google.com/vde-yunz-dps',
    sip: 'sip:735127673137@vc.unesp.br'
  },
  {
    id: 'online-m-sala-7',
    roomNumber: 7,
    roomName: 'Sala 7',
    shift: 'MANHÃ',
    dateStr: '25/11/2026 (Quarta-feira)',
    hours: '08:00h às 12:00h',
    area: 'PRÓTESE DENTÁRIA / MATERIAIS DENTÁRIOS / OCLUSÃO / ATM – GRADUAÇÃO',
    category: 'Graduação',
    banca: [
      'Cleidiel Ap. Araújo Lemos',
      'Maria Natally Belchior Fontenele',
      'Ismenia Edwirges Bernardes Marçal',
      'Guilherme Miguel Moreira de Oliveira',
      'Gabriela de Arruda Ribeiro'
    ],
    mediator: 'LUANA YUMI KOBAYASHI',
    meetUrl: 'https://meet.google.com/fkp-mnww-fne',
    sip: 'sip:783642481461@vc.unesp.br'
  },
  {
    id: 'online-m-sala-8',
    roomNumber: 8,
    roomName: 'Sala 8',
    shift: 'MANHÃ',
    dateStr: '25/11/2026 (Quarta-feira)',
    hours: '08:00h às 12:00h',
    area: 'SAÚDE COLETIVA / PACIENTES COM NECESSIDADES ESPECIAIS – GRADUAÇÃO E PÓS GRADUAÇÃO',
    category: 'Graduação e Pós-Graduação',
    banca: [
      'Michela Melissa Duarte Seixas Sostena',
      'Júlio Martinez',
      'Lucas Marques Angelim',
      'Letícia Gabriella de Souza Rodrigues',
      'Bruna Kaori Namba Inoue'
    ],
    mediator: 'ALANA CARVALHO DAMACENO',
    meetUrl: 'https://meet.google.com/bwv-phdd-oxq',
    sip: 'sip:473462935350@vc.unesp.br'
  },
  {
    id: 'online-m-sala-9',
    roomNumber: 9,
    roomName: 'Sala 9',
    shift: 'MANHÃ',
    dateStr: '25/11/2026 (Quarta-feira)',
    hours: '08:00h às 12:00h',
    area: 'CTBMF – PÓS GRADUAÇÃO',
    category: 'Pós-Graduação',
    banca: [
      'Prof. Dra. Natalia dos Santos Sanches',
      'Prof. Dra. Flávia Leite Lima'
    ],
    mediator: 'LETÍCIA MARIA DE SOUZA PEREIRA',
    meetUrl: 'https://meet.google.com/rgt-qyoz-yfb',
    sip: 'sip:574122696941@vc.unesp.br'
  },
  {
    id: 'online-m-sala-10',
    roomNumber: 10,
    roomName: 'Sala 10',
    shift: 'MANHÃ',
    dateStr: '25/11/2026 (Quarta-feira)',
    hours: '08:00h às 12:00h',
    area: 'PERIODONTIA / IMPLANTODONTIA – PÓS GRADUAÇÃO',
    category: 'Pós-Graduação',
    banca: [
      'Profa. Dra. Elisa Mara',
      'Profa. Dra. Flávia Pereira (Unifunec)'
    ],
    mediator: 'EVELLY DIAS NASCIMENTO MELLO DE ALMEIDA',
    meetUrl: 'https://meet.google.com/tbz-xuxb-aic',
    sip: 'sip:344948463388@vc.unesp.br'
  },
  {
    id: 'online-m-sala-11',
    roomNumber: 11,
    roomName: 'Sala 11',
    shift: 'MANHÃ',
    dateStr: '25/11/2026 (Quarta-feira)',
    hours: '08:00h às 12:00h',
    area: 'ODONTOPEDIATRIA / ORTODONTIA – PÓS GRADUAÇÃO',
    category: 'Pós-Graduação',
    banca: [
      'Prof. Dr. André Bertoz',
      'Prof. Dr. Caio Sampaio'
    ],
    mediator: 'LUIZ GUILHERME BARZAGHI DE OLIVEIRA',
    meetUrl: 'https://meet.google.com/wsk-rizi-xco',
    sip: 'sip:912924259441@vc.unesp.br'
  },

  // ─── QUARTA-FEIRA (25/11/2026) – TARDE ──────────────────────────────────
  {
    id: 'online-t-sala-1',
    roomNumber: 1,
    roomName: 'Sala 1',
    shift: 'TARDE',
    dateStr: '25/11/2026 (Quarta-feira)',
    hours: '14:00h às 18:00h',
    area: 'ODONTOPEDIATRIA / ORTODONTIA - GRADUAÇÃO',
    category: 'Graduação',
    banca: [
      'Livia Maria Alves Valentim da Silva',
      'Ursula Mariana Pantigozo-Morán',
      'Vinicius Henrique Alves Ferreira',
      'Júlia Ingryd Targino de Sousa',
      'Ana Carolyna Becher'
    ],
    mediator: 'FRANCISCO DE ASSIS SANTOS E SANTOS',
    meetUrl: 'https://meet.google.com/ter-syec-yie',
    sip: 'sip:971451938157@vc.unesp.br'
  },
  {
    id: 'online-t-sala-2',
    roomNumber: 2,
    roomName: 'Sala 2',
    shift: 'TARDE',
    dateStr: '25/11/2026 (Quarta-feira)',
    hours: '14:00h às 18:00h',
    area: 'CIÊNCIAS BÁSICAS – PÓS GRADUAÇÃO',
    category: 'Pós-Graduação',
    banca: [
      'Claúdio Aparecido Casatti',
      'João Carlos Callera'
    ],
    mediator: 'TATIELY NATÁLIA SILVA',
    meetUrl: 'https://meet.google.com/yhy-rjfs-nxd',
    sip: 'sip:764872052236@vc.unesp.br'
  },
  {
    id: 'online-t-sala-3',
    roomNumber: 3,
    roomName: 'Sala 3',
    shift: 'TARDE',
    dateStr: '25/11/2026 (Quarta-feira)',
    hours: '14:00h às 18:00h',
    area: 'DENTÍSTICA / HOF – PÓS GRADUAÇÃO',
    category: 'Pós-Graduação',
    banca: [
      'Profa. Dra. Lara Esteves',
      'Profa. Dra. Naara Monteiro'
    ],
    mediator: 'SAMUEL CAMPOS SOUSA',
    meetUrl: 'https://meet.google.com/pqd-tfgb-uvi',
    sip: 'sip:707819690832@vc.unesp.br'
  },
  {
    id: 'online-t-sala-4',
    roomNumber: 4,
    roomName: 'Sala 4',
    shift: 'TARDE',
    dateStr: '25/11/2026 (Quarta-feira)',
    hours: '14:00h às 18:00h',
    area: 'ENDODONTIA – PÓS GRADUAÇÃO',
    category: 'Pós-Graduação',
    banca: [
      'Prof. Maria Luiza Zamparoni Victorino',
      'Prof. Dr. Carlos Bueno',
      'Profa. Dra. Ana Claudia R. Conforte'
    ],
    mediator: 'AMANDA RODRIGUES ARAÚJO',
    meetUrl: 'https://meet.google.com/dvi-ncia-ipm',
    sip: 'sip:502701884294@vc.unesp.br'
  },
  {
    id: 'online-t-sala-5',
    roomNumber: 5,
    roomName: 'Sala 5',
    shift: 'TARDE',
    dateStr: '25/11/2026 (Quarta-feira)',
    hours: '14:00h às 18:00h',
    area: 'ESTOMATOLOGIA / PATOLOGIA / RADIOLOGIA – PÓS GRADUAÇÃO',
    category: 'Pós-Graduação',
    banca: [
      'Prof. Dr. Daniel Bernabé',
      'João Pedro Lorena Paes Leite'
    ],
    mediator: 'KAIO BASILIO BARROS',
    meetUrl: 'https://meet.google.com/osk-grez-pts',
    sip: 'sip:303087837276@vc.unesp.br'
  },
  {
    id: 'online-t-sala-6',
    roomNumber: 6,
    roomName: 'Sala 6',
    shift: 'TARDE',
    dateStr: '25/11/2026 (Quarta-feira)',
    hours: '14:00h às 18:00h',
    area: 'PRÓTESE DENTÁRIA / MATERIAIS DENTÁRIOS / OCLUSÃO / ATM – PÓS GRADUAÇÃO',
    category: 'Pós-Graduação',
    banca: [
      'Profa. Marcela Januzzi',
      'Prof. Dr. Henrico Strazzi'
    ],
    mediator: 'NATHALY DA SILVA CAVALCANTE',
    meetUrl: 'https://meet.google.com/dzh-yrig-xoy',
    sip: 'sip:438396599766@vc.unesp.br'
  }
];
