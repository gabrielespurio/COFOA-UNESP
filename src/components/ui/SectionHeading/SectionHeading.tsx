import styles from './SectionHeading.module.css';
import { cn } from '@/lib/utils';
import React from 'react';

interface SectionHeadingProps extends React.HTMLAttributes<HTMLDivElement> {
  title: string;
  subtitle?: string;
  label?: string;
  overline?: string;
  align?: 'left' | 'center';
  alignment?: 'left' | 'center';
  linePosition?: 'top' | 'bottom' | 'none';
}

export const SectionHeading = ({
  title,
  subtitle,
  label,
  overline,
  align,
  alignment,
  linePosition = 'bottom',
  className,
  ...props
}: SectionHeadingProps) => {
  const resolvedAlign = alignment || align || 'left';
  return (
    <div className={cn(styles.wrapper, styles[resolvedAlign], className)} {...props}>
      {overline && <span className={styles.overline}>{overline}</span>}
      {label && <span className={styles.label}>{label}</span>}
      {linePosition === 'top' && <div className={styles.line} />}
      <h2 className={styles.title}>{title}</h2>
      {linePosition === 'bottom' && <div className={styles.line} />}
      {subtitle && <p className={styles.subtitle}>{subtitle}</p>}
    </div>
  );
};
