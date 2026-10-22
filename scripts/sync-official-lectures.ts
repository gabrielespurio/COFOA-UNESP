import 'dotenv/config';
import { prisma } from '../src/lib/prisma';

const OFFICIAL_SCHEDULE = [
  {
    existingId: 'cmuyyqpqs0001x8v1wao2fcn4',
    title: 'Ecossistema de Inovação da Unesp - Transformando o Futuro',
    speaker: 'Prof. Dr. Marcelo Ornaghi Orlandi',
    description: 'Professor titular no Instituto de Química de Araraquara (UNESP). Graduação em Física pela UFSCar, Mestre e Doutor em Ciência e Engenharia dos Materiais pela UFSCar. Pesquisador visitante na University of Tuebingen, École Polytechnique Montréal e Massachusetts Institute of Technology (MIT). Coordenador dos laboratórios de Microscopia Eletrônica do IQ-Araraquara. Mais de 100 artigos científicos publicados, 7 capítulos de livros e editor da obra sobre óxido de estanho (+5500 citações). Atuação em inovação tecnológica, startups, patentes e Vice-diretor da Agência UNESP de Inovação.',
    location: 'Auditório - Simpósio da Pós-Graduação',
    startTime: new Date('2026-11-26T08:00:00-03:00'),
    endTime: new Date('2026-11-26T09:50:00-03:00'),
    active: true,
  },
  {
    existingId: 'cmuyyqpsj0003x8v144q3i84q',
    title: 'Legislação da Odontologia da HOF - Simpósio',
    speaker: 'Prof. Karina Ferrão',
    description: 'Graduada em Odontologia pela Faculdade de Odontologia de Lins (FOL - 1994). Especialista em Periodontia (ABO MS) e Harmonização Orofacial (CFO). Mestre em Educação e Saúde (UNAERP). Presidente do Conselho Regional de Odontologia de São Paulo (CROSP - biênio 2026/2027). Professora responsável da Especialização em Harmonização Orofacial na FUNORTE Uberaba. Diretora da Sociedade Brasileira de Toxina Botulínica e Implantes Faciais na Odontologia (SBTI - 2017 a 2022). Speaker Allergan Aesthetics e Membro do Programa Botox Masters.',
    location: 'Auditório - Simpósio da Pós-Graduação',
    startTime: new Date('2026-11-26T10:10:00-03:00'),
    endTime: new Date('2026-11-26T12:00:00-03:00'),
    active: true,
  },
  {
    existingId: 'cmuyyqprn0002x8v19g2a1ek7',
    title: 'Bases do Fluxo Digital Aplicado à Periodontia e Implantodontia',
    speaker: 'Prof. Dr. Vitor de Toledo Stuani',
    description: 'Professor de Implantodontia no Departamento de Cirurgia e Traumatologia Buco-Maxilo-Facial e Periodontia da FORP-USP. Especialista em Periodontia e Odontologia Hospitalar. Mestrado em Reabilitação Oral e Doutorado em Periodontia pela FOB-USP. Pós-doutorado pela FOB-USP. Osteology Scholar na Harvard School of Dental Medicine. Membro do Comitê Diretivo do National Osteology Group Brazil. Ministrador de cursos em planejamento CAD/CAM, cirurgia guiada, impressão 3D e bioimpressão.',
    location: 'Auditório Principal - Congresso FOA',
    startTime: new Date('2026-11-26T08:00:00-03:00'),
    endTime: new Date('2026-11-26T09:50:00-03:00'),
    active: true,
  },
  {
    existingId: 'cmuyyqptn0004x8v1ov4338ov',
    title: 'Odontologia além do consultório: a atuação do cirurgião-dentista no atendimento domiciliar',
    speaker: 'Prof. Dr. Marcelo Sabbag Abla',
    description: 'Graduado em Odontologia pela Organização Santamarense de Educação e Cultura (OSEC - 1993). Especialista em Implantodontia pela UNISA (2001) e em Biologia Celular e Morfologia pela Escola Paulista de Medicina (2003). Mestre em Odontologia – Implantodontia pela UNESP (2004) e Doutor em Odontologia pela UNESP (2012). Coordenador de Conteúdo da ABLA+, Coordenador dos cursos da Prime Reabilitação e Estética e Diretor Clínico da Clínica Abla. Fundador da Gent Odonto Care em 2020.',
    location: 'Auditório Principal - Congresso FOA',
    startTime: new Date('2026-11-26T10:10:00-03:00'),
    endTime: new Date('2026-11-26T12:00:00-03:00'),
    active: true,
  },
  {
    existingId: 'cmuyyqpul0005x8v1xbe7wqw9',
    title: 'Cirurgias estéticas da face na odontologia moderna',
    speaker: 'Prof. Dr. Walter Cristiano Gealh',
    description: 'Graduação em Odontologia pela Universidade Estadual de Maringá (UEM). Residência em CTBMF pela Universidade Estadual de Maringá. Mestrado em CTBMF pela FOA/UNESP. Doutorado em Odontologia Integrada pela UEM. Especialização em Dor Orofacial (DOF) e Disfunção Temporomandibular (DTM). Especialização em Farmacologia.',
    location: 'Auditório Principal - Congresso FOA',
    startTime: new Date('2026-11-26T14:00:00-03:00'),
    endTime: new Date('2026-11-26T15:50:00-03:00'),
    active: true,
  },
  {
    existingId: 'cmuyyqpvi0006x8v1o9niv9o3',
    title: 'Sedação: Técnicas, Indicações e Aplicações Clínicas',
    speaker: 'Dr. Gustavo Gregorin Coelho',
    description: 'Graduação em Medicina pela Universidade de São Paulo (USP). Especialização / Residência médica em Anestesiologia pelo Hospital das Clínicas da Faculdade de Medicina de Ribeirão Preto – USP. Título de Especialista em Anestesiologia pela Sociedade Brasileira de Anestesiologia (SBA). Sócio do Serviço de Anestesiologia de Araçatuba (SAA).',
    location: 'Auditório Principal - Congresso FOA',
    startTime: new Date('2026-11-26T16:10:00-03:00'),
    endTime: new Date('2026-11-26T18:00:00-03:00'),
    active: true,
  },
  {
    existingId: 'cmuyyqpwi0007x8v1vnfs9h3h',
    title: 'Cirurgia Ortognática na era digital: Do Planejamento virtual à sala cirúrgica',
    speaker: 'Flávio Ferraz',
    description: 'Cirurgião Bucomaxilofacial do Hospital das Clínicas da Faculdade de Medicina da Universidade de São Paulo – USP e do Hospital Universitário da USP. Residência em CTBMF pelo HC-FMUSP. Fellowship em Planejamento Cirúrgico Virtual no Houston Methodist Hospital (Texas – USA). Mestrado em Ortodontia pela Universidade São Leopoldo Mandic (Campinas). Membro Titular do Colégio Brasileiro de Cirurgia e Traumatologia Bucomaxilofacial. Graduação em Odontologia pela Faculdade de Odontologia de Araçatuba (FOA - UNESP).',
    location: 'Auditório Principal',
    startTime: new Date('2026-11-27T08:00:00-03:00'),
    endTime: new Date('2026-11-27T09:50:00-03:00'),
    active: true,
  },
  {
    existingId: 'cmuyyqpx90008x8v14h34km3k',
    title: 'Estratégias de tratamento conservador das lesões dos maxilares',
    speaker: 'André Caroli Rocha',
    description: 'Especialista em Cirurgia e Traumatologia Bucomaxilofacial. Mestre em Patologia Bucal e Doutor em Diagnóstico Bucal. Assistente do serviço de CTBMF do Hospital das Clínicas – FMUSP. Assistente do departamento de Estomatologia do Hospital A.C. Camargo.',
    location: 'Auditório Principal',
    startTime: new Date('2026-11-27T10:10:00-03:00'),
    endTime: new Date('2026-11-27T12:00:00-03:00'),
    active: true,
  },
  {
    existingId: 'cmuyyqpzc000bx8v1xgl90crz',
    title: 'Odontologia do Sono: uma nova área de atuação do cirurgião dentista',
    speaker: 'Walter da Silva Jr.',
    description: 'Formado pela Faculdade de Odontologia de Araçatuba (UNESP - 1986). Doutor em Ciências da Reabilitação (distúrbios do sono) pelo HRAC/USP Bauru (2013). Diplomado em Odontologia do Sono pelo American Board of Dental Sleep Medicine (ABDSM - 2019). Membro do corpo editorial do Journal of Dental Sleep Medicine (JDSM - 2020) e da força-tarefa da AADSM para Educação em Odontologia do Sono (2020). Certificado pelo Sistema NOA – Aparelho Intraoral (Orthoapnea Madri/ES - 2022). Clínica privada desde 1986 e ministrador de cursos de capacitação em Odontologia do Sono.',
    location: 'Auditório Principal',
    startTime: new Date('2026-11-27T14:00:00-03:00'),
    endTime: new Date('2026-11-27T15:50:00-03:00'),
    active: true,
  },
  {
    existingId: 'cmuyyqq17000dx8v1z790vfo9',
    title: 'Ozônio como Estratégia Terapêutica na Odontologia Contemporânea',
    speaker: 'Sérgio Bruzadelli Macedo e Maria Teresa Maiolini Bruzadelli',
    description: 'Prof. Dr. Sérgio Bruzadelli Macedo: Especialista em CTBMF; Mestre e Doutor em CTBMF pela FOA-UNESP; Introdutor da Ozonioterapia em Odontologia no Brasil em 1996; Professor de CTBMF da Odontologia da UnB. \n\nDra. Maria Teresa Maiolini Bruzadelli: Graduada em Odontologia pela Universidade Federal de Alfenas (UNIFAL-MG); Especialista em Periodontia e Prótese pela ABO-ES; Pós-graduação em Implantodontia pela Faculdade Funorte ES; Habilitação em Ozonioterapia na Odontologia; Professora no curso de Habilitação em Ozonioterapia; Integrante do Projeto de Extensão de Ozonioterapia na Clínica de Necroses dos Maxilares no HUB/UnB.',
    location: 'Auditório Principal',
    startTime: new Date('2026-11-27T16:10:00-03:00'),
    endTime: new Date('2026-11-27T18:00:00-03:00'),
    active: true,
  },
  {
    existingId: 'cmuyyqpxw0009x8v11bzeryko',
    title: 'Odontologia Digital no dia-a-dia clínico',
    speaker: 'Fernando Lopes',
    description: 'Técnico em Prótese Dentária pelo Instituto Francano de Prótese Odontológica (IFPO - 1999). Cirurgião Dentista pela UNIFRAN (2007). Especialista em Implantodontia pela UNAERP (2015). Mestrando em Implantodontia na Faculdade ILAPEO. CEO do laboratório especializado em CAD/CAM Digital Center (responsável técnico por 9 unidades em SP e MG). Membro ativo do International Team of Implantology (ITI) desde 2015. Speaker Digital Straumann/Neodent desde 2017.',
    location: 'Auditório Principal',
    startTime: new Date('2026-11-28T08:00:00-03:00'),
    endTime: new Date('2026-11-28T09:50:00-03:00'),
    active: true,
  },
  {
    existingId: 'cmuyyqpyh000ax8v1rripj2ui',
    title: 'Fluxo Digital aplicado a estética Dental',
    speaker: 'Paulo Eduardo Ferraz Bottura Filho',
    description: 'Cirurgião Dentista pela Faculdade de Odontologia de Lins (UNIMEP - 2000). Especialista em Periodontia pela FOA-UNESP (2003). Mestre pela Faculdade de Medicina de São José do Rio Preto (FAMERP - 2012). Especialista em Implantes pelo COE São José do Rio Preto (2013). DSD Team Member (Miami - 2014). Ex-professor de Cirurgia, Periodontia e Anestesiologia da Unirp. Coautor dos livros "Cad Cam no laboratório e na Clínica" e "Arquitetura Facial".',
    location: 'Auditório Principal',
    startTime: new Date('2026-11-28T10:10:00-03:00'),
    endTime: new Date('2026-11-28T12:00:00-03:00'),
    active: true,
  },
  {
    existingId: 'cmuyyqq05000cx8v1vsbolvdj',
    title: 'Odontologia na Carreira Militar: Experiências, Desafios e Oportunidades',
    speaker: 'Tenente Lívia Trevelin Arêde',
    description: 'Graduação em Odontologia pela FOA-UNESP. Mestre e Especialista em Estomatologia pela FOA-UNESP. Habilitação em Laser pelo Instituto de Ensino Albert Einstein. Doutoranda em Periodontia pela FOA-UNESP com Doutorado Sanduíche pela Universidade de Toronto (Canadá). Atuação em consultório particular como estomatologista desde 2010. Atuação na Estratégia de Saúde da Família SMS Araçatuba (2012–2018). Oficial Dentista da Polícia Militar do Estado de São Paulo.',
    location: 'Auditório Principal',
    startTime: new Date('2026-11-28T14:00:00-03:00'),
    endTime: new Date('2026-11-28T15:00:00-03:00'),
    active: true,
  },
  {
    // NEW lecture from PowerPoint slide 20
    isNew: true,
    title: 'O Cirurgião-Dentista no Exército Brasileiro: Ingresso, Carreira e Atuação',
    speaker: '2º Tenente Yara Gabriele Nunes Maciel',
    description: 'Dentista do Exército Brasileiro. Formada em Odontologia pela Universidade Federal de Mato Grosso do Sul (UFMS - Campo Grande/MS). Pós-graduada em Prótese Dentária pelo Instituto Orofacial das Américas (IOA - São Paulo/SP). Pós-graduada em Dentística pelo Instituto Orofacial das Américas (IOA - São Paulo/SP). 2º Tenente Dentista do Exército Brasileiro. Atuação em Clínica Particular desde 2023.',
    location: 'Auditório Principal',
    startTime: new Date('2026-11-28T15:00:00-03:00'),
    endTime: new Date('2026-11-28T16:00:00-03:00'),
    active: true,
  },
  {
    existingId: 'cmuyyqq26000ex8v12djtxmh5',
    title: 'Odonto Além do Consultório: Como se Preparar para Concursos Públicos',
    speaker: 'Karina Camillo Carrascoza',
    description: 'Graduação em Odontologia pela FOP / Unicamp (2001). Especialização em Endodontia (APCD) e em Gestão Pública em Saúde (Unicamp). Mestrado em Farmacologia, Anestesiologia e Terapêutica (Unicamp). Doutorado em Saúde da Criança e do Adolescente (Unicamp). Pesquisadora visitante na Universidade de Tübingen (Alemanha). Cofundadora da Plataforma OdontoQuiz. Convocada em 6 Concursos Públicos: Americana (2x), Campinas, Santa Bárbara d\'Oeste, Cabreúva e Itupeva. Atual Coordenadora de Saúde Bucal.',
    location: 'Auditório Principal',
    startTime: new Date('2026-11-28T16:10:00-03:00'),
    endTime: new Date('2026-11-28T17:10:00-03:00'),
    active: true,
  },
];

async function updateDatabase() {
  console.log('🔄 Atualizando palestras no banco de dados com base no PPTX oficial...');

  for (const item of OFFICIAL_SCHEDULE) {
    if (item.existingId) {
      await prisma.lecture.update({
        where: { id: item.existingId },
        data: {
          title: item.title,
          speaker: item.speaker,
          description: item.description,
          location: item.location,
          startTime: item.startTime,
          endTime: item.endTime,
          active: item.active,
        },
      });
      console.log(`✅ Atualizada palestra existente: ${item.title} (${item.speaker})`);
    } else if (item.isNew) {
      const existing = await prisma.lecture.findFirst({
        where: { title: item.title },
      });
      if (!existing) {
        await prisma.lecture.create({
          data: {
            title: item.title,
            speaker: item.speaker,
            description: item.description,
            location: item.location,
            startTime: item.startTime,
            endTime: item.endTime,
            active: item.active,
          },
        });
        console.log(`✨ Criada nova palestra: ${item.title} (${item.speaker})`);
      } else {
        await prisma.lecture.update({
          where: { id: existing.id },
          data: {
            speaker: item.speaker,
            description: item.description,
            location: item.location,
            startTime: item.startTime,
            endTime: item.endTime,
            active: item.active,
          },
        });
        console.log(`✅ Palestra já existia e foi atualizada: ${item.title}`);
      }
    }
  }

  console.log('🎉 Todas as palestras foram sincronizadas com sucesso com o banco de dados!');
}

updateDatabase()
  .catch((err) => {
    console.error('❌ Erro ao sincronizar:', err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
