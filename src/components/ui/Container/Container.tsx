import styles from './Container.module.css';
import { cn } from '@/lib/utils';
import React from 'react';

interface ContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  narrow?: boolean;
  children: React.ReactNode;
}

export const Container = ({ narrow, className, children, ...props }: ContainerProps) => {
  return (
    <div className={cn(styles.container, narrow && styles.narrow, className)} {...props}>
      {children}
    </div>
  );
};
