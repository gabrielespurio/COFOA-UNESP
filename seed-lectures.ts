import 'dotenv/config';
import { prisma } from './src/lib/prisma';

const SCHEDULE_DATA = [
  {
    id: 'day-1',
    day: '25',
    month: 'NOV',
    label: 'Quarta-feira',
    events: [
      {
        time: 'Dia Todo',
        title: 'Apresentações Online',
        speaker: '-',
        description: 'Apresentações de trabalhos científicos no formato online.',
        type: 'ONLINE',
        image: ''
      }
    ]
  },
  {
    id: 'day-2',
    day: '26',
    month: 'NOV',
    label: 'Quinta-feira',
    events: [
      {
        time: '8:00h-9:50h',
        title: 'Ecossistema de Inovação da Unesp - Transformando o Futuro',
        speaker: 'Marcelo Ornaghi Orlandi',
        description: 'Professor titular no Instituto de Química de Araraquara(UNESP).',
        type: 'EMPREENDEDORISMO',
        image: ''
      },
      {
        time: '8:00h-9:50h',
        title: 'Bases do fluxo digital aplicado à Periodontia e Implantodontia',
        speaker: 'Vitor de Toledo Stuani',
        description: '* Professor de Implantodontia...',
        type: 'PERIODONTIA',
        image: ''
      },
      {
        time: '10:10h-12:00h',
        title: 'Aspectos legais da Harmonização Orofacial e Cirurgias Esteticas Orofaciais',
        speaker: 'Karina Ferrão',
        description: '- Graduada em Odontologia...',
        type: 'HOF',
        image: ''
      },
      {
        time: '10:10h-12:00h',
        title: 'Odontologia além do consultório: a atuação do cirurgião-dentista no atendimento domiciliar',
        speaker: 'Marcelo Abla',
        description: '• Graduado em Odontologia...',
        type: 'NOVOS CAMPOS DE ATUAÇÃO',
        image: ''
      },
      {
        time: '14:00h-15:50h',
        title: 'Cirurgias Estéticas da Face',
        speaker: 'Walter Gealh',
        description: 'Cirurgias Estéticas da Face HOF',
        type: 'HOF',
        image: ''
      },
      {
        time: '16:10h-18:00h',
        title: 'Técnicas de Sedação e suas indicações',
        speaker: 'Equipe SAA - Felipe Rodrigues de Camargo e Teodoro',
        description: '• Serviço de Anestesiologia...',
        type: 'ANESTESIOLOGIA',
        image: ''
      }
    ]
  },
  {
    id: 'day-3',
    day: '27',
    month: 'NOV',
    label: 'Sexta-feira',
    events: [
      {
        time: '8:00h-9:50h',
        title: 'Cirurgia Ortognática na era digital: Do Planejamento virtual à sala cirúrgica',
        speaker: 'Flávio Ferraz',
        description: '• - Cirurgião Bucomaxilofacial...',
        type: 'CTBMF',
        image: ''
      },
      {
        time: '10:10h-12:00h',
        title: 'Estratégias de tratamento conservador das lesões dos maxilares',
        speaker: 'André Caroli Rocha',
        description: 'Especialista em Cirurgia...',
        type: 'ESTOMATO',
        image: ''
      }
    ]
  },
  {
    id: 'day-4',
    day: '28',
    month: 'NOV',
    label: 'Sábado',
    events: [
      {
        time: '8:00h-9:50h',
        title: 'Odontologia Digital no dia-a-dia clínico',
        speaker: 'Fernando Lopes',
        description: '• TÉCNICO EM PRÓTESE DENTÁRIA...',
        type: 'IMPLANTO/PROTESE',
        image: ''
      },
      {
        time: '10:10h-12:00h',
        title: 'Fluxo Digital aplicado a estética Dental',
        speaker: 'Paulo Eduardo Ferraz Bottura Filho',
        description: '- Cirurgião Dentista...',
        type: 'DENTISTICA',
        image: ''
      },
      {
        time: '14:00h-15:50h',
        title: 'Odontologia do Sono: uma nova área de atuação do cirurgião dentista',
        speaker: 'Walter da Silva Jr.',
        description: '• Formado pela Faculdade...',
        type: 'SONO',
        image: ''
      },
      {
        time: '14:00h-15:00h',
        title: 'Odontologia na Carreira Militar: Experiências, Desafios e Oportunidades',
        speaker: 'Tenente Lívia Trevelin Arêde',
        description: '• Graduação em Odontologia...',
        type: 'TERAPIAS INTEGRATIVAS',
        image: ''
      },
      {
        time: '16:10h-18:00h',
        title: 'Ozônio como Estratégia Terapêutica na Odontologia Contemporânea',
        speaker: 'Sérgio Bruzadelli e Maria Teresa Maiolini Bruzadelli',
        description: 'Sérgio Bruzadelli Macedo...',
        type: 'TERAPIAS INTEGRATIVAS',
        image: ''
      },
      {
        time: '16:10h-17:10h',
        title: 'Odonto Além do Consultório: Como se Preparar para Concursos Públicos',
        speaker: 'Karina Camillo Carrascoza',
        description: '- Graduação em Odontologia...',
        type: 'TERAPIAS INTEGRATIVAS',
        image: ''
      }
    ]
  }
];

function parseTime(day: string, timeStr: string, isEnd: boolean) {
  // timeStr: '8:00h-9:50h'
  if (timeStr === 'Dia Todo') {
    return new Date(`2026-11-${day}T${isEnd ? '23:59:00' : '00:00:00'}-03:00`);
  }
  
  if (timeStr.includes('-')) {
    const parts = timeStr.split('-');
    const t = isEnd ? parts[1] : parts[0];
    const cleanTime = t.replace('h', '').trim();
    // format to HH:MM
    let [h, m] = cleanTime.split(':');
    if (!m) m = '00';
    return new Date(`2026-11-${day}T${h.padStart(2, '0')}:${m}:00-03:00`);
  }
  
  // single time like '17:10h'
  const cleanTime = timeStr.replace('h', '').trim();
  let [h, m] = cleanTime.split(':');
  if (!m) m = '00';
  
  const base = new Date(`2026-11-${day}T${h.padStart(2, '0')}:${m}:00-03:00`);
  if (isEnd) {
    base.setHours(base.getHours() + 1); // add 1 hour roughly if no end time
  }
  return base;
}

async function main() {
  console.log('Seeding real lectures...');
  
  // First, deactivate existing lectures to not lose history
  await prisma.lecture.updateMany({
    data: { active: false }
  });

  for (const day of SCHEDULE_DATA) {
    for (const event of day.events) {
      if (['INTERVALO', 'ABERTURA', 'ENCERRAMENTO'].includes(event.type)) {
        continue;
      }
      
      const startTime = parseTime(day.day, event.time, false);
      const endTime = parseTime(day.day, event.time, true);

      await prisma.lecture.create({
        data: {
          title: event.title,
          speaker: event.speaker,
          description: event.description,
          startTime,
          endTime,
          location: 'Auditório / Sala Específica (A confirmar)',
          active: true
        }
      });
    }
  }

  console.log('Real lectures inserted!');
}

main().catch(console.error);
