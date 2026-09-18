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
        time: 'Em breve',
        title: 'Bases do Fluxo Digital Aplicado à Periodontia e Implantodontia',
        speaker: 'Em breve',
        description: 'Conteúdo em breve...',
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
        time: 'Em breve',
        title: 'Ecossistema de Inovação da Unesp - Transformando o Futuro',
        speaker: 'Em breve',
        description: 'Conteúdo em breve...',
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
        time: 'Em breve',
        title: 'Harmonização Orofacial - Estetica e Função Transformando Vidas na Odontologia',
        speaker: 'Em breve',
        description: 'Conteúdo em breve...',
        type: 'PALESTRA',
        image: '/images/Palestras%20COFOA/Harmoniza%C3%A7%C3%A3o%20Orofacial%20-%20Estetica%20e%20Fun%C3%A7%C3%A3o%20Transformando%20Vidas%20na%20Odontologia.jpg'
      },
      {
        time: 'Em breve',
        title: 'Legislação da Odontologia da HOF - Simpósio',
        speaker: 'Em breve',
        description: 'Conteúdo em breve...',
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
        time: 'Em breve',
        title: 'Odontologia alem do consultorio a atuação do cirurgiao dentista no atendimento domiciliar',
        speaker: 'Em breve',
        description: 'Conteúdo em breve...',
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
                <div key={index} className={`${styles.eventCard} ${cardStateClass}`}>
                  <div className={styles.cardImageWrapper}>
                    <img src={event.image} alt={event.title} className={styles.cardImage} />
                    <div className={styles.cardTypeBadge}>{event.type}</div>
                  </div>
                  <div className={styles.cardContent}>
                    <div className={styles.cardHeader}>
                      <span className={styles.cardTime}>{event.time}</span>
                    </div>
                    <h4 className={styles.cardTitle}>{event.title}</h4>
                    <p className={styles.cardSpeaker}>{event.speaker}</p>
                    <p className={styles.cardDescription}>{event.description}</p>
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
    </div>
  );
}
