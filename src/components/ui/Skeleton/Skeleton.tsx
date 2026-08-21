import styles from './Skeleton.module.css';
import { cn } from '@/lib/utils';
import React from 'react';

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'text' | 'circular' | 'rectangular';
  width?: string | number;
  height?: string | number;
}

export const Skeleton = ({
  variant = 'text',
  width,
  height,
  className,
  ...props
}: SkeletonProps) => {
  return (
    <div
      className={cn(styles.skeleton, styles[variant], className)}
      style={{ width, height, ...props.style }}
      {...props}
    />
  );
};
