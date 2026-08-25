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
        title: 'Programação a Definir', 
        speaker: 'Palestrante em breve',
        description: 'A grade científica deste dia está sendo cuidadosamente preparada pela nossa comissão organizadora.',
        type: 'AGUARDE',
        image: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&q=80&w=600'
      },
      { 
        time: 'Em breve', 
        title: 'Atividades Práticas', 
        speaker: 'Convidados Especiais',
        description: 'Em breve divulgaremos as atividades hands-on e workshops disponíveis para este dia de congresso.',
        type: 'EM BREVE',
        image: 'https://images.unsplash.com/photo-1606811841689-23dfddce3e95?auto=format&fit=crop&q=80&w=600'
      },
      { 
        time: 'Em breve', 
        title: 'Sessão Científica', 
        speaker: 'Comitê Científico',
        description: 'Espaço reservado para a apresentação de pesquisas e painéis de grande impacto na odontologia.',
        type: 'AGUARDE',
        image: 'https://images.unsplash.com/photo-1543269865-cbf427effbad?auto=format&fit=crop&q=80&w=600'
      },
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
        title: 'Fóruns e Palestras', 
        speaker: 'Palestrantes Confirmados',
        description: 'A programação completa com horários e temas será disponibilizada em nossos canais oficiais muito em breve.',
        type: 'AGUARDE',
        image: 'https://images.unsplash.com/photo-1557804506-669a67965ba0?auto=format&fit=crop&q=80&w=600'
      },
      { 
        time: 'Em breve', 
        title: 'Simpósios Temáticos', 
        speaker: 'Convidados Especiais',
        description: 'Grandes nomes da odontologia reunidos para discutir as últimas tendências e inovações do mercado.',
        type: 'EM BREVE',
        image: 'https://images.unsplash.com/photo-1588776814546-1ffcf47267a5?auto=format&fit=crop&q=80&w=600'
      },
      { 
        time: 'Em breve', 
        title: 'Programação Noturna', 
        speaker: 'A Definir',
        description: 'Atividades exclusivas sendo preparadas para fechar o segundo dia de congresso com chave de ouro.',
        type: 'AGUARDE',
        image: 'https://images.unsplash.com/photo-1629909613654-28e377c37b09?auto=format&fit=crop&q=80&w=600'
      },
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
        title: 'Apresentações Orais', 
        speaker: 'Comissão Avaliadora',
        description: 'Fique atento ao cronograma de submissão e horários das apresentações de trabalhos científicos.',
        type: 'EM BREVE',
        image: 'https://images.unsplash.com/photo-1524178232363-1fb2b075b655?auto=format&fit=crop&q=80&w=600'
      },
      { 
        time: 'Em breve', 
        title: 'Módulos de Especialidades', 
        speaker: 'Especialistas Nacionais',
        description: 'Uma grade focada no aprofundamento técnico das principais áreas da odontologia moderna.',
        type: 'AGUARDE',
        image: 'https://images.unsplash.com/photo-1579684385127-1ef15d508118?auto=format&fit=crop&q=80&w=600'
      },
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
        title: 'Encerramento Científico', 
        speaker: 'A Definir',
        description: 'As últimas atividades da nossa extensa grade de conteúdos elaborada para o COFOA XV.',
        type: 'EM BREVE',
        image: 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?auto=format&fit=crop&q=80&w=600'
      },
      { 
        time: 'Em breve', 
        title: 'Solenidade e Premiações', 
        speaker: 'Diretoria FOA',
        description: 'Em breve confirmaremos o horário oficial do nosso evento de encerramento e premiação de trabalhos.',
        type: 'AGUARDE',
        image: 'https://images.unsplash.com/photo-1561489396-888724a1543d?auto=format&fit=crop&q=80&w=600'
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
            style={{ transform: `translateX(calc(50% - 175px - ${activeCardIndex * 382}px))` }}
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
