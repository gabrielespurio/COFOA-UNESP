import styles from './Badge.module.css';
import { cn } from '@/lib/utils';
import React from 'react';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'primary' | 'gold' | 'success' | 'warning' | 'error' | 'info' | 'outline';
  size?: 'sm' | 'md';
  children: React.ReactNode;
}

export const Badge = ({
  variant = 'primary',
  size = 'md',
  className,
  children,
  ...props
}: BadgeProps) => {
  return (
    <span
      className={cn(styles.badge, styles[variant], styles[size], className)}
      {...props}
    >
      {children}
    </span>
  );
};
