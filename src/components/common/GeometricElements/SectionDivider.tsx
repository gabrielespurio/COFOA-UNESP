import styles from './SectionDivider.module.css';
import { cn } from '@/lib/utils';
import React from 'react';

interface SectionDividerProps extends React.SVGAttributes<SVGSVGElement> {
  flipHorizontal?: boolean;
  flip?: boolean;
}

export const SectionDivider = ({ flipHorizontal, flip, className, ...props }: SectionDividerProps) => {
  const isFlipped = flipHorizontal || flip;
  return (
    <div className={cn(styles.wrapper, isFlipped && styles.flipped, className)}>
      <svg 
        viewBox="0 0 1440 40" 
        preserveAspectRatio="none" 
        className={styles.svg}
        {...props}
      >
        <path d="M0,20 L1440,20" stroke="var(--color-primary)" strokeWidth="0.5" fill="none" opacity="0.2" />
        <path d="M720,0 L760,40 M730,0 L770,40 M740,0 L780,40" stroke="var(--color-accent-gold)" strokeWidth="1" fill="none" opacity="0.3" />
        <path d="M680,40 L720,0 M690,40 L730,0 M700,40 L740,0" stroke="var(--color-blue-cyan)" strokeWidth="1" fill="none" opacity="0.3" />
      </svg>
    </div>
  );
};
