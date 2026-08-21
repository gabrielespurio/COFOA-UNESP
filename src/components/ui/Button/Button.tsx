'use client';
import styles from './Button.module.css';
import { cn } from '@/lib/utils';
import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
  loading?: boolean;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
  href?: string;
  children: React.ReactNode;
}

export const Button = React.forwardRef<HTMLButtonElement | HTMLAnchorElement, ButtonProps>(
  (
    {
      variant = 'primary',
      size = 'md',
      fullWidth = false,
      loading = false,
      icon,
      iconPosition = 'left',
      href,
      className,
      children,
      disabled,
      ...props
    },
    ref
  ) => {
    const classNames = cn(
      styles.button,
      styles[variant],
      styles[size],
      fullWidth && styles.fullWidth,
      loading && styles.loading,
      className
    );

    const content = (
      <>
        {loading ? (
          <span className={styles.spinner} aria-hidden="true" />
        ) : (
          icon && iconPosition === 'left' && <span className={styles.icon}>{icon}</span>
        )}
        <span className={styles.content}>{children}</span>
        {!loading && icon && iconPosition === 'right' && <span className={styles.icon}>{icon}</span>}
      </>
    );

    if (href) {
      return (
        <a 
          href={href} 
          className={classNames} 
          ref={ref as React.Ref<HTMLAnchorElement>} 
          {...(props as React.AnchorHTMLAttributes<HTMLAnchorElement>)}
        >
          {content}
        </a>
      );
    }

    return (
      <button 
        className={classNames} 
        disabled={disabled || loading} 
        ref={ref as React.Ref<HTMLButtonElement>} 
        {...props}
      >
        {content}
      </button>
    );
  }
);

Button.displayName = 'Button';
