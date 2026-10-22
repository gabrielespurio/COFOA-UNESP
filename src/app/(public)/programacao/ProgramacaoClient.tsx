'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { Badge } from '@/components/ui/Badge/Badge';
import { Button } from '@/components/ui/Button/Button';
import styles from './page.module.css';

interface LectureItem {
  id: string;
  time: string;
  title: string;
  speaker: string;
  curriculum: string;
  track: 'Simpósio da Pós-Graduação' | 'Congresso de Odontologia FOA' | 'Encerramento';
  category: string;
  isSpecial?: boolean;
}

interface DaySchedule {
  key: string;
  dateStr: string;
  dayOfWeek: string;
  lectures: LectureItem[];
}

const PROGRAMACAO_DATA: DaySchedule[] = [
  {
    key: '2026-11-26',
    dateStr: '26 de Novembro',
    dayOfWeek: 'Quinta-feira',
    lectures: [
      {
        id: 'qui-1',
        time: '08:00h - 09:50h',
        title: 'Ecossistema de Inovação da Unesp - Transformando o Futuro',
        speaker: 'Prof. Dr. Marcelo Ornaghi Orlandi',
        track: 'Simpósio da Pós-Graduação',
        category: 'Inovação & Empreendedorismo',
        curriculum:
          'Professor titular no Instituto de Química de Araraquara (UNESP). Graduação em Física pela UFSCar, Mestre e Doutor em Ciência e Engenharia dos Materiais pela UFSCar. Pesquisador visitante na University of Tuebingen, École Polytechnique Montréal e Massachusetts Institute of Technology (MIT). Coordenador dos laboratórios de Microscopia Eletrônica do IQ-Araraquara. Mais de 100 artigos científicos publicados, 7 capítulos de livros e editor da obra sobre óxido de estanho (+5500 citações). Atuação em inovação tecnológica, startups, patentes e Vice-diretor da Agência UNESP de Inovação.',
      },
      {
        id: 'qui-2',
        time: '08:00h - 09:50h',
        title: 'Bases do Fluxo Digital Aplicado à Periodontia e Implantodontia',
        speaker: 'Prof. Dr. Vitor de Toledo Stuani',
        track: 'Congresso de Odontologia FOA',
        category: 'Periodontia & Implantodontia',
        curriculum:
          'Professor de Implantodontia no Departamento de Cirurgia e Traumatologia Buco-Maxilo-Facial e Periodontia da FORP-USP. Especialista em Periodontia e Odontologia Hospitalar. Mestrado em Reabilitação Oral e Doutorado em Periodontia pela FOB-USP. Pós-doutorado pela FOB-USP. Osteology Scholar na Harvard School of Dental Medicine. Membro do Comitê Diretivo do National Osteology Group Brazil. Ministrador de cursos em planejamento CAD/CAM, cirurgia guiada, impressão 3D e bioimpressão.',
      },
      {
        id: 'qui-3',
        time: '10:10h - 12:00h',
        title: 'Legislação da Odontologia da HOF - Simpósio',
        speaker: 'Prof. Karina Ferrão',
        track: 'Simpósio da Pós-Graduação',
        category: 'Harmonização Orofacial (HOF)',
        curriculum:
          'Graduada em Odontologia pela Faculdade de Odontologia de Lins (FOL - 1994). Especialista em Periodontia (ABO MS) e Harmonização Orofacial (CFO). Mestre em Educação e Saúde (UNAERP). Presidente do Conselho Regional de Odontologia de São Paulo (CROSP - biênio 2026/2027). Professora responsável da Especialização em Harmonização Orofacial na FUNORTE Uberaba. Diretora da Sociedade Brasileira de Toxina Botulínica e Implantes Faciais na Odontologia (SBTI - 2017 a 2022). Speaker Allergan Aesthetics e Membro do Programa Botox Masters.',
      },
      {
        id: 'qui-4',
        time: '10:10h - 12:00h',
        title: 'Odontologia além do consultório: a atuação do cirurgião-dentista no atendimento domiciliar',
        speaker: 'Prof. Dr. Marcelo Sabbag Abla',
        track: 'Congresso de Odontologia FOA',
        category: 'Atendimento Domiciliar',
        curriculum:
          'Graduado em Odontologia pela Organização Santamarense de Educação e Cultura (OSEC - 1993). Especialista em Implantodontia pela UNISA (2001) e em Biologia Celular e Morfologia pela Escola Paulista de Medicina (2003). Mestre em Odontologia – Implantodontia pela UNESP (2004) e Doutor em Odontologia pela UNESP (2012). Coordenador de Conteúdo da ABLA+, Coordenador dos cursos da Prime Reabilitação e Estética e Diretor Clínico da Clínica Abla. Fundador da Gent Odonto Care em 2020.',
      },
      {
        id: 'qui-5',
        time: '14:00h - 15:50h',
        title: 'Cirurgias estéticas da face na odontologia moderna',
        speaker: 'Prof. Dr. Walter Cristiano Gealh',
        track: 'Congresso de Odontologia FOA',
        category: 'Cirurgia & Estética Facial',
        curriculum:
          'Graduação em Odontologia pela Universidade Estadual de Maringá (UEM). Residência em CTBMF pela Universidade Estadual de Maringá. Mestrado em CTBMF pela FOA/UNESP. Doutorado em Odontologia Integrada pela UEM. Especialização em Dor Orofacial (DOF) e Disfunção Temporomandibular (DTM). Especialização em Farmacologia.',
      },
      {
        id: 'qui-6',
        time: '16:10h - 18:00h',
        title: 'Sedação: Técnicas, Indicações e Aplicações Clínicas',
        speaker: 'Dr. Gustavo Gregorin Coelho',
        track: 'Congresso de Odontologia FOA',
        category: 'Anestesiologia & Sedação',
        curriculum:
          'Graduação em Medicina pela Universidade de São Paulo (USP). Especialização / Residência médica em Anestesiologia pelo Hospital das Clínicas da Faculdade de Medicina de Ribeirão Preto – USP. Título de Especialista em Anestesiologia pela Sociedade Brasileira de Anestesiologia (SBA). Sócio do Serviço de Anestesiologia de Araçatuba (SAA).',
      },
    ],
  },
  {
    key: '2026-11-27',
    dateStr: '27 de Novembro',
    dayOfWeek: 'Sexta-feira',
    lectures: [
      {
        id: 'sex-1',
        time: '08:00h - 09:50h',
        title: 'Cirurgia Ortognática na era digital: Do Planejamento virtual à sala cirúrgica',
        speaker: 'Flávio Ferraz',
        track: 'Congresso de Odontologia FOA',
        category: 'Cirurgia Bucomaxilofacial',
        curriculum:
          'Cirurgião Bucomaxilofacial do Hospital das Clínicas da Faculdade de Medicina da Universidade de São Paulo – USP e do Hospital Universitário da USP. Residência em CTBMF pelo HC-FMUSP. Fellowship em Planejamento Cirúrgico Virtual no Houston Methodist Hospital (Texas – USA). Mestrado em Ortodontia pela Universidade São Leopoldo Mandic (Campinas). Membro Titular do Colégio Brasileiro de Cirurgia e Traumatologia Bucomaxilofacial. Graduação em Odontologia pela Faculdade de Odontologia de Araçatuba (FOA - UNESP).',
      },
      {
        id: 'sex-2',
        time: '10:10h - 12:00h',
        title: 'Estratégias de tratamento conservador das lesões dos maxilares',
        speaker: 'André Caroli Rocha',
        track: 'Congresso de Odontologia FOA',
        category: 'Estomatologia & Patologia Bucal',
        curriculum:
          'Especialista em Cirurgia e Traumatologia Bucomaxilofacial. Mestre em Patologia Bucal e Doutor em Diagnóstico Bucal. Assistente do serviço de CTBMF do Hospital das Clínicas – FMUSP. Assistente do departamento de Estomatologia do Hospital A.C. Camargo.',
      },
      {
        id: 'sex-3',
        time: '14:00h - 15:50h',
        title: 'Odontologia do Sono: uma nova área de atuação do cirurgião dentista',
        speaker: 'Walter da Silva Jr.',
        track: 'Congresso de Odontologia FOA',
        category: 'Odontologia do Sono',
        curriculum:
          'Formado pela Faculdade de Odontologia de Araçatuba (UNESP - 1986). Doutor em Ciências da Reabilitação (distúrbios do sono) pelo HRAC/USP Bauru (2013). Diplomado em Odontologia do Sono pelo American Board of Dental Sleep Medicine (ABDSM - 2019). Membro do corpo editorial do Journal of Dental Sleep Medicine (JDSM - 2020) e da força-tarefa da AADSM para Educação em Odontologia do Sono (2020). Certificado pelo Sistema NOA – Aparelho Intraoral (Orthoapnea Madri/ES - 2022). Clínica privada desde 1986 e ministrador de cursos de capacitação na área.',
      },
      {
        id: 'sex-4',
        time: '16:10h - 18:00h',
        title: 'Ozônio como Estratégia Terapêutica na Odontologia Contemporânea',
        speaker: 'Sérgio Bruzadelli Macedo e Maria Teresa Maiolini Bruzadelli',
        track: 'Congresso de Odontologia FOA',
        category: 'Terapias Integrativas',
        curriculum:
          'Prof. Dr. Sérgio Bruzadelli Macedo: Especialista em CTBMF; Mestre e Doutor em CTBMF pela FOA-UNESP; Introdutor da Ozonioterapia em Odontologia no Brasil em 1996; Professor de CTBMF da Odontologia da UnB. \n\nDra. Maria Teresa Maiolini Bruzadelli: Graduada em Odontologia pela UNIFAL-MG; Especialista em Periodontia e Prótese pela ABO-ES; Pós-graduação em Implantodontia pela Faculdade Funorte ES; Habilitação em Ozonioterapia na Odontologia; Professora no curso de Habilitação em Ozonioterapia; Integrante do Projeto de Extensão de Ozonioterapia na Clínica de Necroses dos Maxilares no HUB/UnB.',
      },
    ],
  },
  {
    key: '2026-11-28',
    dateStr: '28 de Novembro',
    dayOfWeek: 'Sábado',
    lectures: [
      {
        id: 'sab-1',
        time: '08:00h - 09:50h',
        title: 'Odontologia Digital no dia-a-dia clínico',
        speaker: 'Fernando Lopes',
        track: 'Congresso de Odontologia FOA',
        category: 'Odontologia Digital & Prótese',
        curriculum:
          'Técnico em Prótese Dentária pelo Instituto Francano de Prótese Odontológica (IFPO - 1999). Cirurgião Dentista pela UNIFRAN (2007). Especialista em Implantodontia pela UNAERP (2015). Mestrando em Implantodontia na Faculdade ILAPEO. CEO do laboratório especializado em CAD/CAM Digital Center (responsável técnico por 9 unidades em SP e MG). Membro ativo do International Team of Implantology (ITI) desde 2015. Speaker Digital Straumann/Neodent desde 2017.',
      },
      {
        id: 'sab-2',
        time: '10:10h - 12:00h',
        title: 'Fluxo Digital aplicado a estética Dental',
        speaker: 'Paulo Eduardo Ferraz Bottura Filho',
        track: 'Congresso de Odontologia FOA',
        category: 'Dentística & Estética Dental',
        curriculum:
          'Cirurgião Dentista pela Faculdade de Odontologia de Lins (UNIMEP - 2000). Especialista em Periodontia pela FOA-UNESP (2003). Mestre pela Faculdade de Medicina de São José do Rio Preto (FAMERP - 2012). Especialista em Implantes pelo COE São José do Rio Preto (2013). DSD Team Member (Miami - 2014). Ex-professor de Cirurgia, Periodontia e Anestesiologia da Unirp. Coautor dos livros "Cad Cam no laboratório e na Clínica" e "Arquitetura Facial".',
      },
      {
        id: 'sab-3',
        time: '14:00h - 15:00h',
        title: 'Odontologia na Carreira Militar: Experiências, Desafios e Oportunidades',
        speaker: 'Tenente Lívia Trevelin Arêde',
        track: 'Congresso de Odontologia FOA',
        category: 'Carreira Militar (Polícia Militar)',
        curriculum:
          'Graduação em Odontologia pela FOA-UNESP. Mestre e Especialista em Estomatologia pela FOA-UNESP. Habilitação em Laser pelo Instituto de Ensino Albert Einstein. Doutoranda em Periodontia pela FOA-UNESP com Doutorado Sanduíche pela Universidade de Toronto (Canadá). Atuação em consultório particular como estomatologista desde 2010. Atuação na Estratégia de Saúde da Família SMS Araçatuba (2012–2018). Oficial Dentista da Polícia Militar do Estado de São Paulo.',
      },
      {
        id: 'sab-4',
        time: '15:00h - 16:00h',
        title: 'O Cirurgião-Dentista no Exército Brasileiro: Ingresso, Carreira e Atuação',
        speaker: '2º Tenente Yara Gabriele Nunes Maciel',
        track: 'Congresso de Odontologia FOA',
        category: 'Carreira Militar (Exército Brasileiro)',
        curriculum:
          'Dentista do Exército Brasileiro. Formada em Odontologia pela Universidade Federal de Mato Grosso do Sul (UFMS - Campo Grande/MS). Pós-graduada em Prótese Dentária pelo Instituto Orofacial das Américas (IOA - São Paulo/SP). Pós-graduada em Dentística pelo Instituto Orofacial das Américas (IOA - São Paulo/SP). 2º Tenente Dentista do Exército Brasileiro. Atuação em Clínica Particular desde 2023.',
      },
      {
        id: 'sab-5',
        time: '16:10h - 17:10h',
        title: 'Odonto Além do Consultório: Como se Preparar para Concursos Públicos',
        speaker: 'Karina Camillo Carrascoza',
        track: 'Congresso de Odontologia FOA',
        category: 'Concursos Públicos',
        curriculum:
          'Graduação em Odontologia pela FOP / Unicamp (2001). Especialização em Endodontia (APCD) e em Gestão Pública em Saúde (Unicamp). Mestrado em Farmacologia, Anestesiologia e Terapêutica (Unicamp). Doutorado em Saúde da Criança e do Adolescente (Unicamp). Pesquisadora visitante na Universidade de Tübingen (Alemanha). Cofundadora da Plataforma OdontoQuiz. Convocada em 6 Concursos Públicos: Americana (2x), Campinas, Santa Bárbara d\'Oeste, Cabreúva e Itupeva. Atual Coordenadora de Saúde Bucal.',
      },
      {
        id: 'sab-6',
        time: '21:00h',
        title: 'Jantar de Encerramento do COFOA XV',
        speaker: 'Comissão Organizadora',
        track: 'Encerramento',
        category: 'Confraternização Oficial',
        isSpecial: true,
        curriculum:
          'Grande confraternização e encerramento oficial das atividades do Congresso de Odontologia da Faculdade de Odontologia de Araçatuba (COFOA XV). Momento de celebração, networking e integração entre participantes, palestrantes e comissão organizadora.',
      },
    ],
  },
];

export function ProgramacaoClient() {
  const [selectedDay, setSelectedDay] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [expandedCurriculums, setExpandedCurriculums] = useState<Record<string, boolean>>({});

  const toggleCurriculum = (id: string) => {
    setExpandedCurriculums((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const filteredDays = useMemo(() => {
    return PROGRAMACAO_DATA.map((day) => {
      // Filter by day
      if (selectedDay !== 'all' && day.key !== selectedDay) {
        return null;
      }

      // Filter by search query
      const filteredLectures = day.lectures.filter((lec) => {
        if (!searchQuery.trim()) return true;
        const q = searchQuery.toLowerCase();
        return (
          lec.title.toLowerCase().includes(q) ||
          lec.speaker.toLowerCase().includes(q) ||
          lec.category.toLowerCase().includes(q) ||
          lec.track.toLowerCase().includes(q) ||
          lec.curriculum.toLowerCase().includes(q)
        );
      });

      if (filteredLectures.length === 0) return null;

      return {
        ...day,
        lectures: filteredLectures,
      };
    }).filter(Boolean) as DaySchedule[];
  }, [selectedDay, searchQuery]);

  return (
    <div className={styles.wrapper}>
      {/* Search & Actions Bar */}
      <div className={styles.controlsBar}>
        <div className={styles.searchBox}>
          <svg
            className={styles.searchIcon}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            width="20"
            height="20"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
          <input
            type="text"
            className={styles.searchInput}
            placeholder="Buscar por tema, palestrante, especialidade..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          {searchQuery && (
            <button
              type="button"
              className={styles.clearSearchBtn}
              onClick={() => setSearchQuery('')}
            >
              ✕
            </button>
          )}
        </div>

        <Link href="/area-participante/programacao" className={styles.enrollCtaBtn}>
          🎟️ Inscrever-se em Palestras
        </Link>
      </div>

      {/* Day Tabs */}
      <div className={styles.tabsNav}>
        <button
          type="button"
          className={`${styles.tabBtn} ${selectedDay === 'all' ? styles.tabBtnActive : ''}`}
          onClick={() => setSelectedDay('all')}
        >
          Todos os Dias
        </button>
        {PROGRAMACAO_DATA.map((day) => (
          <button
            key={day.key}
            type="button"
            className={`${styles.tabBtn} ${selectedDay === day.key ? styles.tabBtnActive : ''}`}
            onClick={() => setSelectedDay(day.key)}
          >
            <span className={styles.tabDate}>{day.dateStr}</span>
            <span className={styles.tabDayOfWeek}>{day.dayOfWeek}</span>
          </button>
        ))}
      </div>

      {/* Schedule Timeline */}
      <div className={styles.timelineContainer}>
        {filteredDays.length === 0 ? (
          <div className={styles.noResults}>
            <p>Nenhuma palestra encontrada com os critérios pesquisados.</p>
            <Button variant="outline" size="sm" onClick={() => { setSearchQuery(''); setSelectedDay('all'); }}>
              Limpar filtros
            </Button>
          </div>
        ) : (
          filteredDays.map((day) => (
            <div key={day.key} className={styles.dayGroup}>
              <div className={styles.dayHeaderSticky}>
                <div className={styles.dayHeaderContent}>
                  <div className={styles.dayHeaderDate}>{day.dateStr}</div>
                  <div className={styles.dayHeaderSubtitle}>{day.dayOfWeek}</div>
                </div>
                <div className={styles.dayLecturesCount}>
                  {day.lectures.length} {day.lectures.length === 1 ? 'atividade' : 'atividades'}
                </div>
              </div>

              <div className={styles.lecturesList}>
                {day.lectures.map((lec) => {
                  const isExpanded = !!expandedCurriculums[lec.id];
                  const isSimposio = lec.track === 'Simpósio da Pós-Graduação';
                  const isEncerramento = lec.isSpecial;

                  return (
                    <article
                      key={lec.id}
                      className={`${styles.lectureCard} ${
                        isSimposio ? styles.simposioCard : ''
                      } ${isEncerramento ? styles.encerramentoCard : ''}`}
                    >
                      <div className={styles.cardHeader}>
                        <div className={styles.timeBadgeWrapper}>
                          <span className={styles.timeTag}>🕒 {lec.time}</span>
                          <Badge
                            variant={
                              isEncerramento ? 'gold' : isSimposio ? 'info' : 'primary'
                            }
                            size="sm"
                          >
                            {lec.track}
                          </Badge>
                        </div>
                        <span className={styles.categoryTag}>{lec.category}</span>
                      </div>

                      <h3 className={styles.lectureTitle}>{lec.title}</h3>

                      <div className={styles.speakerRow}>
                        <div className={styles.speakerAvatar}>
                          {isEncerramento ? '🥂' : '👨‍⚕️'}
                        </div>
                        <div>
                          <span className={styles.speakerLabel}>Palestrante / Responsável</span>
                          <h4 className={styles.speakerName}>{lec.speaker}</h4>
                        </div>
                      </div>

                      <div className={styles.cardFooter}>
                        <button
                          type="button"
                          className={styles.curriculumToggleBtn}
                          onClick={() => toggleCurriculum(lec.id)}
                        >
                          <span>{isExpanded ? 'Ocultar mini-currículo' : 'Ver mini-currículo'}</span>
                          <span className={styles.arrowIcon}>{isExpanded ? '▲' : '▼'}</span>
                        </button>

                        <Link
                          href="/area-participante/programacao"
                          className={styles.cardActionLink}
                        >
                          Inscrever-se →
                        </Link>
                      </div>

                      {isExpanded && (
                        <div className={styles.curriculumBox}>
                          <div className={styles.curriculumTitle}>Mini Currículo:</div>
                          <p className={styles.curriculumText}>{lec.curriculum}</p>
                        </div>
                      )}
                    </article>
                  );
                })}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
