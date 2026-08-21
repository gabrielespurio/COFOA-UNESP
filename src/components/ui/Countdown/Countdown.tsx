'use client';

import React, { useState, useEffect } from 'react';
import styles from './Countdown.module.css';

interface CountdownProps {
  targetDate: string; // ISO string
}

export function Countdown({ targetDate }: CountdownProps) {
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    
    const calculateTimeLeft = () => {
      const difference = new Date(targetDate).getTime() - new Date().getTime();
      
      if (difference > 0) {
        setTimeLeft({
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
          minutes: Math.floor((difference / 1000 / 60) % 60),
          seconds: Math.floor((difference / 1000) % 60),
        });
      } else {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
      }
    };

    calculateTimeLeft(); // Initial calculation
    const timer = setInterval(calculateTimeLeft, 1000);

    return () => clearInterval(timer);
  }, [targetDate]);

  if (!isMounted) {
    return <div className={styles.wrapper} style={{ opacity: 0 }}>...</div>; // Avoid hydration mismatch
  }

  const formatNumber = (num: number) => num.toString().padStart(2, '0');

  return (
    <div className={styles.wrapper}>
      <h3 className={styles.title}>CONTAGEM REGRESSIVA PARA O COFOA XV</h3>
      
      <div className={styles.grid}>
        <div className={styles.item}>
          <span className={styles.number}>{formatNumber(timeLeft.days)}</span>
          <span className={styles.label}>DIAS</span>
        </div>
        
        <div className={styles.item}>
          <span className={styles.number}>{formatNumber(timeLeft.hours)}</span>
          <span className={styles.label}>HORAS</span>
        </div>
        
        <div className={styles.item}>
          <span className={styles.number}>{formatNumber(timeLeft.minutes)}</span>
          <span className={styles.label}>MINUTOS</span>
        </div>
        
        <div className={styles.item}>
          <span className={styles.number}>{formatNumber(timeLeft.seconds)}</span>
          <span className={styles.label}>SEGUNDOS</span>
        </div>
      </div>
    </div>
  );
}
