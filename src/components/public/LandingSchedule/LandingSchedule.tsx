'use client';

import React, { useState } from 'react';
import styles from './LandingSchedule.module.css';

const SCHEDULE_DATA = [
  {
    id: 'day-1',
    day: '25',
    month: 'NOV',
    label: 'Quarta-feira',
    events: [
      {
        time: '8:00h-9:50h',
        title: 'Bases do Fluxo Digital Aplicado à Periodontia e Implantodontia',
        speaker: 'Vitor de Toledo Stuani',
        description: '* Professor de Implantodontia no Departamento de Cirurgia e Traumatologia Buco-Maxilo-Facial e Periodontia da FORP-USP\n* Especialista em Periodontia\n* Especialista em Odontologia Hospitalar\n* Mestrado em Reabilitação Oral e Doutorado em Periodontia- FOB-USP\n* Pós-doutorado- FOB-USP\n* Osteology Scholar - Harvard School of Dental Medicine\n* Membro do Comitê Diretivo do National Osteology Group Brazil\n* Cursos de atualização em planejamento CAD/CAM, cirurgia guiada, impressão 3D e bioimpressão',
        type: 'PALESTRA',
        image: '/images/Palestras%20COFOA/Bases%20do%20Fluxo%20Digital%20Aplicado%20%C3%A0%20Periodontia%20e%20Implantodontia.jpg'
      },
      {
        time: 'Em breve',
        title: 'Cirurgia Ortognática na era digital - Do Planejamento virtual à sala cirúrgica',
        speaker: 'Em breve',
        description: 'Conteúdo em breve...',
        type: 'PALESTRA',
        image: '/images/Palestras%20COFOA/Cirurgia%20Ortogn%C3%A1tica%20na%20era%20digital%20-%20Do%20Planejamento%20virtual%20%C3%A0%20sala%20cir%C3%BArgica.jpg'
      },
      {
        time: '8:00h-9:50h',
        title: 'Ecossistema de Inovação da Unesp - Transformando o Futuro',
        speaker: 'Marcelo Ornaghi Orlandi',
        description: 'Professor titular no Instituto de Química de Araraquara(UNESP).\nGraduação em Física pela Universidade Federal de São Carlos (UFSCar)\nMestre e Doutor em Ciência e Engenharia dos Materiais pela UFSCar\nPesquisador visitante na University of Tuebingen, na École Polytechnique Montréal (PolyMtl)\nPesquisador visitante no Massachusetts Institute of Technology (MIT)\nCoordenador dos laboratórios de Microscopia Eletrônica do Instituto de Química de Araraquara.\n\nRealiza pesquisas em Ciência e Engenharia de Materiais, com ênfase em materiais cerâmicos semicondutores. As aplicações dos materiais em estudo são: sensores de gás, varistores e fotocatálise. Possui+100 artigos científicos publicados em revistas internacionais, 7 capítulos de livros e é editor da mais completa obra sobre o óxido de estanho. Os artigos e livros tiveram mais de 5500 citações na plataforma Google Scholar. Atua na inovação tecnológica, onde foi empreendedor de 2018 a 2025, e como assessor de startups, e possui experiência na produção de patentes. É vice-diretor da Agência UNESP de Inovação, atuando também no empreendedorismo inovador na universidade.',
        type: 'PALESTRA',
        image: '/images/Palestras%20COFOA/Ecossistema%20de%20Inova%C3%A7%C3%A3o%20da%20Unesp%20-%20Transformando%20o%20Futuro.jpg'
      },
      {
        time: 'Em breve',
        title: 'Estratégias de tratamento conservador das lesões dos maxilares',
        speaker: 'Em breve',
        description: 'Conteúdo em breve...',
        type: 'PALESTRA',
        image: '/images/Palestras%20COFOA/Estrat%C3%A9gias%20de%20tratamento%20conservador%20das%20les%C3%B5es%20dos%20maxilares.jpg'
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
        time: 'Em breve',
        title: 'Fluxo Digital aplicado a estética Dental',
        speaker: 'Em breve',
        description: 'Conteúdo em breve...',
        type: 'PALESTRA',
        image: '/images/Palestras%20COFOA/Fluxo%20Digital%20aplicado%20a%20est%C3%A9tica%20Dental.jpg'
      },
      {
        time: '14:00h-15:50h',
        title: 'Harmonização Orofacial - Estetica e Função Transformando Vidas na Odontologia',
        speaker: 'Karina Ferrão',
        description: '- Graduada em Odontologia pela Faculdade de Odontologia de Lins (FOL)\n- 1994- Especialista em Periodontia- ABO MS - Especialista em Harmonização Orofacial - CFO\n- Mestre em Educação e Saúde- UNAERP\n- Presidente do Conselho Regional de Odontologia de São Paulo biênio 2026/2027\n- Professora responsável da Especialização em Harmonização Orofacial - FUNORTE Uberaba\n- Diretora da Sociedade Brasileira de Toxina Botulínica e Implantes Faciais na Odontologia (SBTI) - 2017 a 2022\n- Speaker Allergan Aesthetics\n- Membro do Programa Botox Masters Allergan Aesthetics',
        type: 'PALESTRA',
        image: '/images/Palestras%20COFOA/Harmoniza%C3%A7%C3%A3o%20Orofacial%20-%20Estetica%20e%20Fun%C3%A7%C3%A3o%20Transformando%20Vidas%20na%20Odontologia.jpg'
      },
      {
        time: '10:10h-12:00h',
        title: 'Legislação da Odontologia da HOF - Simpósio',
        speaker: 'Karina Ferrão',
        description: '- Graduada em Odontologia pela Faculdade de Odontologia de Lins (FOL)\n- 1994- Especialista em Periodontia- ABO MS - Especialista em Harmonização Orofacial - CFO\n- Mestre em Educação e Saúde- UNAERP\n- Presidente do Conselho Regional de Odontologia de São Paulo biênio 2026/2027\n- Professora responsável da Especialização em Harmonização Orofacial - FUNORTE Uberaba\n- Diretora da Sociedade Brasileira de Toxina Botulínica e Implantes Faciais na Odontologia (SBTI) - 2017 a 2022\n- Speaker Allergan Aesthetics\n- Membro do Programa Botox Masters Allergan Aesthetics',
        type: 'PALESTRA',
        image: '/images/Palestras%20COFOA/Legisla%C3%A7%C3%A3o%20da%20Odontologia%20da%20HOF%20-%20Simp%C3%B3sio.jpg'
      },
      {
        time: 'Em breve',
        title: 'Odonto Além do Consultório - Como se Preparar para Concursos Públicos',
        speaker: 'Em breve',
        description: 'Conteúdo em breve...',
        type: 'PALESTRA',
        image: '/images/Palestras%20COFOA/Odonto%20Al%C3%A9m%20do%20Consult%C3%B3rio%20-%20Como%20se%20Preparar%20para%20Concursos%20P%C3%BAblicos.jpg'
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
        time: 'Em breve',
        title: 'Odontologia Digital no dia-a-dia clínico',
        speaker: 'Em breve',
        description: 'Conteúdo em breve...',
        type: 'PALESTRA',
        image: '/images/Palestras%20COFOA/Odontologia%20Digital%20no%20dia-a-dia%20cl%C3%ADnico.jpg'
      },
      {
        time: '10:10h-12:00h',
        title: 'Odontologia alem do consultorio a atuação do cirurgiao dentista no atendimento domiciliar',
        speaker: 'Marcelo Abla',
        description: '• Graduado em Odontologia pela Organização Santamarense de Educação e Cultura (1993).\n• Especialista em Implantodontia pela Universidade de Santo Amaro (UNISA) (2001) e em Biologia Celular e Morfologia pela Escola Paulista de Medicina (2003).\n• Mestre em Odontologia – Implantodontia pela Universidade Estadual Paulista (UNESP) (2004).\n• Doutor em Odontologia pela Universidade Estadual Paulista (UNESP) (2012).\n• Coordenador de Conteúdo da ABLA+.\n• Coordenador dos cursos da Prime Reabilitação e Estética.\n• Diretor Clínico da Clínica Abla.\n• Atua na área de Odontologia, com ênfase em Implantodontia, reabilitação oral, cirurgia e estética facial.\n• Fundador da Gent Odonto Care em 2020.',
        type: 'PALESTRA',
        image: '/images/Palestras%20COFOA/Odontologia%20alem%20do%20consultorio%20a%20atua%C3%A7%C3%A3o%20do%20cirurgiao%20dentista%20no%20atendimento%20domiciliar.jpg'
      },
      {
        time: 'Em breve',
        title: 'Odontologia do Sono - uma nova área de atuação do cirurgião dentista',
        speaker: 'Em breve',
        description: 'Conteúdo em breve...',
        type: 'PALESTRA',
        image: '/images/Palestras%20COFOA/Odontologia%20do%20Sono%20-%20uma%20nova%20%C3%A1rea%20de%20atua%C3%A7%C3%A3o%20do%20cirurgi%C3%A3o%20dentista.jpg'
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
        time: 'Em breve',
        title: 'Odontologia na Carreira Militar - Experiências Desafios e Oportunidades',
        speaker: 'Em breve',
        description: 'Conteúdo em breve...',
        type: 'PALESTRA',
        image: '/images/Palestras%20COFOA/Odontologia%20na%20Carreira%20Militar%20-%20Experi%C3%AAncias%20Desafios%20e%20Oportunidades.jpg'
      },
      {
        time: 'Em breve',
        title: 'Ozônio como Estratégia Terapêutica na Odontologia Contemporânea',
        speaker: 'Em breve',
        description: 'Conteúdo em breve...',
        type: 'PALESTRA',
        image: '/images/Palestras%20COFOA/Oz%C3%B4nio%20como%20Estrat%C3%A9gia%20Terap%C3%AAutica%20na%20Odontologia%20Contempor%C3%A2nea.jpg'
      },
      {
        time: 'Em breve',
        title: 'Sedacao Técnicas - Indicações e Aplicações Clínicas',
        speaker: 'Em breve',
        description: 'Conteúdo em breve...',
        type: 'PALESTRA',
        image: '/images/Palestras%20COFOA/Sedacao%20T%C3%A9cnicas%20-%20Indica%C3%A7%C3%B5es%20e%20Aplica%C3%A7%C3%B5es%20Cl%C3%ADnicas.jpg'
      }
    ]
  }
];

export function LandingSchedule() {
  const [activeTab, setActiveTab] = useState(SCHEDULE_DATA[0].id);
  const [activeCardIndex, setActiveCardIndex] = useState(0);
  const [selectedEvent, setSelectedEvent] = useState<any>(null);

  const activeDay = SCHEDULE_DATA.find(d => d.id === activeTab);
  const events = activeDay?.events || [];

  const handleTabChange = (id: string) => {
    setActiveTab(id);
    setActiveCardIndex(0);
  };

  const handlePrev = () => {
    setActiveCardIndex((prev) => Math.max(0, prev - 1));
  };

  const handleNext = () => {
    setActiveCardIndex((prev) => Math.min(events.length - 1, prev + 1));
  };

  return (
    <div className={styles.scheduleWrapper}>
      <div className={styles.tabsHeader}>
        <div className={styles.tabsContainer}>
          {SCHEDULE_DATA.map((day) => (
            <button 
              key={day.id}
              className={`${styles.tabButton} ${activeTab === day.id ? styles.tabActive : ''}`}
              onClick={() => handleTabChange(day.id)}
            >
              <span className={styles.tabDate}>{day.day} {day.month}</span>
              <span className={styles.tabLabel}>{day.label}</span>
            </button>
          ))}
        </div>
      </div>

      <div className={styles.carouselWrapper}>
        <button 
          className={`${styles.controlArrow} ${styles.controlArrowLeft}`} 
          onClick={handlePrev} 
          disabled={activeCardIndex === 0}
          aria-label="Anterior"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="19" y1="12" x2="5" y2="12"></line>
            <polyline points="12 19 5 12 12 5"></polyline>
          </svg>
        </button>

        <div className={styles.carouselContainer}>
          <div 
            className={styles.carouselTrack}
            style={{ transform: `translateX(calc(50% - (var(--card-width, 350px) / 2) - (${activeCardIndex} * (var(--card-width, 350px) + var(--card-gap, 32px)))))` }}
          >
            {events.map((event, index) => {
              const isActive = index === activeCardIndex;
              const isPrev = index < activeCardIndex;
              const isNext = index > activeCardIndex;
              
              let cardStateClass = '';
              if (isActive) cardStateClass = styles.cardActive;
              else if (isPrev) cardStateClass = styles.cardPrev;
              else if (isNext) cardStateClass = styles.cardNext;

              return (
                <div 
                  key={index} 
                  className={`${styles.eventCard} ${cardStateClass}`} 
                  onClick={() => setSelectedEvent(event)}
                  style={{ cursor: 'pointer' }}
                >
                  <div className={styles.cardImageWrapper}>
                    <img src={event.image} alt={event.title} className={styles.cardImage} />
                    <div className={styles.cardTypeBadge}>{event.type}</div>
                  </div>
                  <div className={styles.cardContent}>
                    <div className={styles.cardHeader}>
                      <span className={styles.cardTime}>{event.time}</span>
                    </div>
                    <h4 className={styles.cardTitle}>{event.title}</h4>
                    <p className={styles.cardSpeaker} style={{ fontSize: '0.85rem', color: '#aaa', marginTop: 'auto' }}>
                      Clique para ver mais detalhes
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <button 
          className={`${styles.controlArrow} ${styles.controlArrowRight}`} 
          onClick={handleNext} 
          disabled={activeCardIndex === events.length - 1}
          aria-label="Próximo"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="5" y1="12" x2="19" y2="12"></line>
            <polyline points="12 5 19 12 12 19"></polyline>
          </svg>
        </button>
      </div>
      
      <div className={styles.carouselIndicators}>
        <span className={styles.indicatorText}>
          {events[activeCardIndex]?.type} — Palestra {activeCardIndex + 1} de {events.length}
        </span>
        <div className={styles.dots}>
          {events.map((_, idx) => (
            <button 
              key={idx} 
              className={`${styles.dot} ${idx === activeCardIndex ? styles.dotActive : ''}`}
              onClick={() => setActiveCardIndex(idx)}
              aria-label={`Ir para a palestra ${idx + 1}`}
            />
          ))}
        </div>
      </div>

      {selectedEvent && (
        <div className={styles.modalOverlay} onClick={() => setSelectedEvent(null)}>
          <div className={styles.modalContent} onClick={e => e.stopPropagation()}>
            <button className={styles.modalClose} onClick={() => setSelectedEvent(null)}>✕</button>
            <img src={selectedEvent.image} alt={selectedEvent.title} className={styles.modalImage} />
            <div className={styles.modalBody}>
              <div className={styles.modalTime}>{selectedEvent.time}</div>
              <h3 className={styles.modalTitle}>{selectedEvent.title}</h3>
              {selectedEvent.speaker && selectedEvent.speaker !== 'Em breve' && (
                <h4 className={styles.modalSpeaker}>{selectedEvent.speaker}</h4>
              )}
              <div className={styles.modalDescription}>
                {selectedEvent.description.split('\n').map((line: string, i: number) => (
                  <p key={i}>{line}</p>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
