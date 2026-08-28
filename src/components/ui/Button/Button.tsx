'use client';
import styles from './Button.module.css';
import { cn } from '@/lib/utils';
import React from 'react';

type ButtonProps = {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
  loading?: boolean;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
  href?: string;
  children: React.ReactNode;
} & React.ButtonHTMLAttributes<HTMLButtonElement> & React.AnchorHTMLAttributes<HTMLAnchorElement>;

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
    const [isNavigating, setIsNavigating] = React.useState(false);
    const isLoading = loading || isNavigating;

    const classNames = cn(
      styles.button,
      styles[variant],
      styles[size],
      fullWidth && styles.fullWidth,
      isLoading && styles.loading,
      className
    );

    const content = (
      <>
        {isLoading ? (
          <span className={styles.spinner} aria-hidden="true" />
        ) : (
          icon && iconPosition === 'left' && <span className={styles.icon}>{icon}</span>
        )}
        <span className={styles.content}>{children}</span>
        {!isLoading && icon && iconPosition === 'right' && <span className={styles.icon}>{icon}</span>}
      </>
    );

    if (href) {
      const handleAnchorClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
        if (props.onClick) {
          props.onClick(e);
        }
        
        // Force a hard navigation with a visual delay to completely bypass Next.js ChunkLoadErrors
        if (!e.defaultPrevented) {
          e.preventDefault();
          setIsNavigating(true);
          setTimeout(() => {
            window.location.href = href;
          }, 800);
        }
      };

      return (
        <a 
          href={href} 
          className={classNames} 
          ref={ref as React.Ref<HTMLAnchorElement>} 
          onClick={handleAnchorClick}
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
