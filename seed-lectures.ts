import 'dotenv/config';
import { prisma } from './src/lib/prisma';

export const SCHEDULE_DATA = [
  {
    id: 'day-1',
    day: '25',
    month: 'NOV',
    label: 'Quarta-feira',
    dateFormatted: '25 de Novembro de 2026',
    events: [
      {
        time: 'Dia Todo',
        title: 'Apresentações de Trabalhos Científicos (Online)',
        speaker: 'Avaliadores e Apresentadores',
        description: 'Apresentações e defesas dos trabalhos científicos aprovados na modalidade online.',
        type: 'ONLINE',
        track: 'Modalidade Online',
        image: ''
      }
    ]
  },
  {
    id: 'day-2',
    day: '26',
    month: 'NOV',
    label: 'Quinta-feira',
    dateFormatted: '26 de Novembro de 2026',
    events: [
      {
        time: '08:00h - 09:50h',
        title: 'Ecossistema de Inovação da Unesp - Transformando o Futuro',
        speaker: 'Prof. Dr. Marcelo Ornaghi Orlandi',
        description: 'Professor titular no Instituto de Química de Araraquara (UNESP). Graduação em Física pela UFSCar, Mestre e Doutor em Ciência e Engenharia dos Materiais pela UFSCar. Pesquisador visitante na University of Tuebingen, École Polytechnique Montréal e MIT. Coordenador dos laboratórios de Microscopia Eletrônica do IQ-Araraquara. Mais de 100 artigos científicos publicados, 7 capítulos de livros e editor da obra sobre óxido de estanho (+5500 citações). Vice-diretor da Agência UNESP de Inovação.',
        type: 'INOVAÇÃO / EMPREENDEDORISMO',
        track: 'Simpósio da Pós-Graduação',
        image: ''
      },
      {
        time: '08:00h - 09:50h',
        title: 'Bases do Fluxo Digital Aplicado à Periodontia e Implantodontia',
        speaker: 'Prof. Dr. Vitor de Toledo Stuani',
        description: 'Professor de Implantodontia no Departamento de Cirurgia e Traumatologia Buco-Maxilo-Facial e Periodontia da FORP-USP. Especialista em Periodontia e Odontologia Hospitalar. Mestre em Reabilitação Oral e Doutor em Periodontia pela FOB-USP. Pós-doutorado pela FOB-USP. Osteology Scholar na Harvard School of Dental Medicine. Membro do Comitê Diretivo do National Osteology Group Brazil.',
        type: 'PERIODONTIA / IMPLANTODONTIA',
        track: 'Congresso de Odontologia FOA',
        image: ''
      },
      {
        time: '10:10h - 12:00h',
        title: 'Legislação da Odontologia da HOF - Simpósio',
        speaker: 'Prof. Karina Ferrão',
        description: 'Graduada em Odontologia pela FOL (1994). Especialista em Periodontia (ABO MS) e Harmonização Orofacial (CFO). Mestre em Educação e Saúde (UNAERP). Presidente do Conselho Regional de Odontologia de São Paulo (CROSP - biênio 2026/2027). Professora responsável da Especialização em Harmonização Orofacial na FUNORTE Uberaba. Diretora da SBTI (2017 a 2022). Speaker Allergan Aesthetics e Membro do Programa Botox Masters.',
        type: 'HARMONIZAÇÃO OROFACIAL (HOF)',
        track: 'Simpósio da Pós-Graduação',
        image: ''
      },
      {
        time: '10:10h - 12:00h',
        title: 'Odontologia além do consultório: a atuação do cirurgião-dentista no atendimento domiciliar',
        speaker: 'Prof. Dr. Marcelo Sabbag Abla',
        description: 'Graduado em Odontologia pela Organização Santamarense de Educação e Cultura (OSEC - 1993). Especialista em Implantodontia pela UNISA (2001) e em Biologia Celular e Morfologia pela Escola Paulista de Medicina (2003). Mestre em Odontologia – Implantodontia pela UNESP (2004) e Doutor em Odontologia pela UNESP (2012). Coordenador de Conteúdo da ABLA+, Coordenador dos cursos da Prime Reabilitação e Estética e Diretor Clínico da Clínica Abla. Fundador da Gent Odonto Care em 2020.',
        type: 'NOVOS CAMPOS DE ATUAÇÃO',
        track: 'Congresso de Odontologia FOA',
        image: ''
      },
      {
        time: '14:00h - 15:50h',
        title: 'Cirurgias estéticas da face na odontologia moderna',
        speaker: 'Prof. Dr. Walter Cristiano Gealh',
        description: 'Graduação em Odontologia pela Universidade Estadual de Maringá (UEM). Residência em CTBMF pela Universidade Estadual de Maringá. Mestrado em CTBMF pela FOA/UNESP. Doutorado em Odontologia Integrada pela UEM. Especialização em Dor Orofacial (DOF) e Disfunção Temporomandibular (DTM). Especialização em Farmacologia.',
        type: 'CIRURGIA / HOF',
        track: 'Congresso de Odontologia FOA',
        image: ''
      },
      {
        time: '16:10h - 18:00h',
        title: 'Sedação: Técnicas, Indicações e Aplicações Clínicas',
        speaker: 'Dr. Gustavo Gregorin Coelho',
        description: 'Graduação em Medicina pela Universidade de São Paulo (USP). Especialização / Residência médica em Anestesiologia pelo Hospital das Clínicas da Faculdade de Medicina de Ribeirão Preto – USP. Título de Especialista em Anestesiologia pela Sociedade Brasileira de Anestesiologia (SBA). Sócio do Serviço de Anestesiologia de Araçatuba (SAA).',
        type: 'ANESTESIOLOGIA / SEDAÇÃO',
        track: 'Congresso de Odontologia FOA',
        image: ''
      }
    ]
  },
  {
    id: 'day-3',
    day: '27',
    month: 'NOV',
    label: 'Sexta-feira',
    dateFormatted: '27 de Novembro de 2026',
    events: [
      {
        time: '08:00h - 09:50h',
        title: 'Cirurgia Ortognática na era digital: Do Planejamento virtual à sala cirúrgica',
        speaker: 'Flávio Ferraz',
        description: 'Cirurgião Bucomaxilofacial do Hospital das Clínicas da FMUSP e do HU-USP. Residência em CTBMF pelo HC-FMUSP. Fellowship em Planejamento Cirúrgico Virtual no Houston Methodist Hospital (Texas – USA). Mestrado em Ortodontia pela São Leopoldo Mandic (Campinas). Membro Titular do Colégio Brasileiro de Cirurgia e Traumatologia Bucomaxilofacial. Graduação FOA - UNESP.',
        type: 'CIRURGIA BUCOMAXILOFACIAL',
        track: 'Congresso de Odontologia FOA',
        image: ''
      },
      {
        time: '10:10h - 12:00h',
        title: 'Estratégias de tratamento conservador das lesões dos maxilares',
        speaker: 'André Caroli Rocha',
        description: 'Especialista em Cirurgia e Traumatologia Bucomaxilofacial. Mestre em Patologia Bucal e Doutor em Diagnóstico Bucal. Assistente do serviço de CTBMF do Hospital das Clínicas – FMUSP. Assistente do departamento de Estomatologia do Hospital A.C. Camargo.',
        type: 'ESTOMATOLOGIA / PATOLOGIA',
        track: 'Congresso de Odontologia FOA',
        image: ''
      },
      {
        time: '14:00h - 15:50h',
        title: 'Odontologia do Sono: uma nova área de atuação do cirurgião dentista',
        speaker: 'Walter da Silva Jr.',
        description: 'Formado pela Faculdade de Odontologia de Araçatuba (UNESP - 1986). Doutor em Ciências da Reabilitação (distúrbios do sono) pelo HRAC/USP Bauru (2013). Diplomado em Odontologia do Sono pelo American Board of Dental Sleep Medicine (ABDSM - 2019). Membro do corpo editorial do Journal of Dental Sleep Medicine (JDSM - 2020) e da força-tarefa da AADSM para Educação em Odontologia do Sono (2020). Certificado pelo Sistema NOA – Aparelho Intraoral (Orthoapnea Madri/ES - 2022). Clínica privada desde 1986 e ministrador de cursos de capacitação em Odontologia do Sono.',
        type: 'ODONTOLOGIA DO SONO',
        track: 'Congresso de Odontologia FOA',
        image: ''
      },
      {
        time: '16:10h - 18:00h',
        title: 'Ozônio como Estratégia Terapêutica na Odontologia Contemporânea',
        speaker: 'Sérgio Bruzadelli Macedo e Maria Teresa Maiolini Bruzadelli',
        description: 'Prof. Dr. Sérgio Bruzadelli Macedo: Especialista em CTBMF; Mestre e Doutor em CTBMF pela FOA-UNESP; Introdutor da Ozonioterapia em Odontologia no Brasil em 1996; Professor de CTBMF da Odontologia da UnB. | Dra. Maria Teresa Maiolini Bruzadelli: Graduada pela UNIFAL-MG; Especialista em Periodontia e Prótese pela ABO-ES; Pós-graduação em Implantodontia pela Funorte ES; Habilitação em Ozonioterapia na Odontologia; Professora no curso de Habilitação em Ozonioterapia; Integrante do Projeto de Extensão de Ozonioterapia no HUB/UnB.',
        type: 'TERAPIAS INTEGRATIVAS / OZONIOTERAPIA',
        track: 'Congresso de Odontologia FOA',
        image: ''
      }
    ]
  },
  {
    id: 'day-4',
    day: '28',
    month: 'NOV',
    label: 'Sábado',
    dateFormatted: '28 de Novembro de 2026',
    events: [
      {
        time: '08:00h - 09:50h',
        title: 'Odontologia Digital no dia-a-dia clínico',
        speaker: 'Fernando Lopes',
        description: 'Técnico em Prótese Dentária pelo Instituto Francano de Prótese Odontológica (IFPO - 1999). Cirurgião Dentista pela UNIFRAN (2007). Especialista em Implantodontia pela UNAERP (2015). Mestrando em Implantodontia na Faculdade ILAPEO. CEO do laboratório especializado em CAD/CAM Digital Center (responsável técnico por 9 unidades em SP e MG). Membro ativo do International Team of Implantology (ITI) desde 2015. Speaker Digital Straumann/Neodent desde 2017.',
        type: 'ODONTOLOGIA DIGITAL',
        track: 'Congresso de Odontologia FOA',
        image: ''
      },
      {
        time: '10:10h - 12:00h',
        title: 'Fluxo Digital aplicado a estética Dental',
        speaker: 'Paulo Eduardo Ferraz Bottura Filho',
        description: 'Cirurgião Dentista pela Faculdade de Odontologia de Lins (UNIMEP - 2000). Especialista em Periodontia pela FOA-UNESP (2003). Mestre pela Faculdade de Medicina de São José do Rio Preto (FAMERP - 2012). Especialista em Implantes pelo COE São José do Rio Preto (2013). DSD Team Member (Miami - 2014). Ex-professor de Cirurgia, Periodontia e Anestesiologia da Unirp. Coautor dos livros "Cad Cam no laboratório e na Clínica" e "Arquitetura Facial".',
        type: 'DENTÍSTICA / ESTÉTICA DIGITAL',
        track: 'Congresso de Odontologia FOA',
        image: ''
      },
      {
        time: '14:00h - 15:00h',
        title: 'Odontologia na Carreira Militar: Experiências, Desafios e Oportunidades',
        speaker: 'Tenente Lívia Trevelin Arêde',
        description: 'Graduação em Odontologia pela FOA-UNESP. Mestre e Especialista em Estomatologia pela FOA-UNESP. Habilitação em Laser pelo Instituto de Ensino Albert Einstein. Doutoranda em Periodontia pela FOA-UNESP com Doutorado Sanduíche pela Universidade de Toronto (Canadá). Atuação em consultório particular como estomatologista desde 2010. Atuação na Estratégia de Saúde da Família SMS Araçatuba (2012–2018). Oficial Dentista da Polícia Militar do Estado de São Paulo.',
        type: 'CARREIRA MILITAR (POLÍCIA MILITAR)',
        track: 'Congresso de Odontologia FOA',
        image: ''
      },
      {
        time: '15:00h - 16:00h',
        title: 'O Cirurgião-Dentista no Exército Brasileiro: Ingresso, Carreira e Atuação',
        speaker: '2º Tenente Yara Gabriele Nunes Maciel',
        description: 'Dentista do Exército Brasileiro. Formada em Odontologia pela Universidade Federal de Mato Grosso do Sul (UFMS - Campo Grande/MS). Pós-graduada em Prótese Dentária pelo Instituto Orofacial das Américas (IOA - São Paulo/SP). Pós-graduada em Dentística pelo Instituto Orofacial das Américas (IOA - São Paulo/SP). 2º Tenente Dentista do Exército Brasileiro. Atuação em Clínica Particular desde 2023.',
        type: 'CARREIRA MILITAR (EXÉRCITO)',
        track: 'Congresso de Odontologia FOA',
        image: ''
      },
      {
        time: '16:10h - 17:10h',
        title: 'Odonto Além do Consultório: Como se Preparar para Concursos Públicos',
        speaker: 'Karina Camillo Carrascoza',
        description: 'Graduação em Odontologia pela FOP / Unicamp (2001). Especialização em Endodontia (APCD) e em Gestão Pública em Saúde (Unicamp). Mestrado em Farmacologia, Anestesiologia e Terapêutica (Unicamp). Doutorado em Saúde da Criança e do Adolescente (Unicamp). Pesquisadora visitante na Universidade de Tübingen (Alemanha). Cofundadora da Plataforma OdontoQuiz. Convocada em 6 Concursos Públicos: Americana (2x), Campinas, Santa Bárbara d\'Oeste, Cabreúva e Itupeva. Atual Coordenadora de Saúde Bucal.',
        type: 'CONCURSOS PÚBLICOS',
        track: 'Congresso de Odontologia FOA',
        image: ''
      },
      {
        time: '21:00h',
        title: 'Jantar de Encerramento do COFOA XV',
        speaker: 'Comissão Organizadora',
        description: 'Jantar oficial de encerramento e confraternização do Congresso de Odontologia da Faculdade de Odontologia de Araçatuba (COFOA XV).',
        type: 'CONFRATERNIZAÇÃO',
        track: 'Encerramento Oficial',
        image: ''
      }
    ]
  }
];

function parseTime(day: string, timeStr: string, isEnd: boolean) {
  if (timeStr === 'Dia Todo') {
    return new Date(`2026-11-${day}T${isEnd ? '23:59:00' : '00:00:00'}-03:00`);
  }
  
  if (timeStr.includes('-')) {
    const parts = timeStr.split('-');
    const t = isEnd ? parts[1] : parts[0];
    const cleanTime = t.replace('h', '').trim();
    let [h, m] = cleanTime.split(':');
    if (!m) m = '00';
    return new Date(`2026-11-${day}T${h.padStart(2, '0')}:${m}:00-03:00`);
  }
  
  const cleanTime = timeStr.replace('h', '').trim();
  let [h, m] = cleanTime.split(':');
  if (!m) m = '00';
  
  const base = new Date(`2026-11-${day}T${h.padStart(2, '0')}:${m}:00-03:00`);
  if (isEnd) {
    base.setHours(base.getHours() + 1);
  }
  return base;
}

async function main() {
  console.log('Semeando palestras oficiais...');

  for (const day of SCHEDULE_DATA) {
    for (const event of day.events) {
      if (['INTERVALO', 'ABERTURA', 'CONFRATERNIZAÇÃO'].includes(event.type)) {
        continue;
      }
      
      const startTime = parseTime(day.day, event.time, false);
      const endTime = parseTime(day.day, event.time, true);

      const existing = await prisma.lecture.findFirst({
        where: { title: event.title }
      });

      if (existing) {
        await prisma.lecture.update({
          where: { id: existing.id },
          data: {
            speaker: event.speaker,
            description: event.description,
            startTime,
            endTime,
            active: true
          }
        });
      } else {
        await prisma.lecture.create({
          data: {
            title: event.title,
            speaker: event.speaker,
            description: event.description,
            startTime,
            endTime,
            location: event.track,
            active: true
          }
        });
      }
    }
  }

  console.log('Palestras oficiais inseridas/atualizadas com sucesso!');
}

main().catch(console.error);
