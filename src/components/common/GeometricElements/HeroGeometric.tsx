import styles from './HeroGeometric.module.css';
import { cn } from '@/lib/utils';
import React from 'react';

export const HeroGeometric = ({ className, ...props }: React.SVGAttributes<SVGSVGElement>) => {
  return (
    <div className={cn(styles.wrapper, className)}>
      <svg 
        viewBox="0 0 1000 1000" 
        className={styles.svg}
        {...props}
      >
        <g strokeWidth="1" fill="none" className={styles.shapes}>
          <polygon points="500,100 900,900 100,900" stroke="var(--color-blue-cyan)" />
          <polygon points="500,200 800,800 200,800" stroke="var(--color-primary)" />
          <polygon points="500,300 700,700 300,700" stroke="var(--color-primary)" />
          <polygon points="500,400 600,600 400,600" stroke="var(--color-primary)" strokeDasharray="10, 10" />
          <circle cx="500" cy="650" r="300" stroke="var(--color-blue-cyan)" strokeDasharray="5, 20" />
          <line x1="100" y1="500" x2="900" y2="500" stroke="var(--color-accent-gold)" strokeWidth="0.5" />
          <line x1="500" y1="100" x2="500" y2="900" stroke="var(--color-accent-gold)" strokeWidth="0.5" />
        </g>
      </svg>
    </div>
  );
};
