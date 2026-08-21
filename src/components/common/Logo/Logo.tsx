import Image from 'next/image';
import styles from './Logo.module.css';
import { cn } from '@/lib/utils';
import React from 'react';

interface LogoProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'full' | 'symbol' | 'compact' | 'monochrome';
  type?: 'icon' | 'default'; // backwards compatibility for some places where type was used
  height?: number | string;
}

export const Logo = ({ variant = 'full', type, height = 40, className, ...props }: LogoProps) => {
  const isSymbol = variant === 'symbol' || variant === 'compact' || type === 'icon';
  const isMonochrome = variant === 'monochrome';
  
  const src = isSymbol ? '/images/logo-icon.png' : '/images/logo-full.png';
  const aspectRatio = isSymbol ? 1 : 16 / 9; // approximate aspect ratio

  // For monochrome, we apply a CSS filter to turn it white if it's on a dark background (usually the case for monochrome here)
  const filterStyle = isMonochrome ? { filter: 'brightness(0) invert(1)' } : {};

  return (
    <div 
      className={cn(styles.logoWrapper, className)} 
      style={{ height, display: 'flex', alignItems: 'center', ...props.style }}
      {...props}
    >
      <Image 
        src={src} 
        alt="COFOA XV Logo" 
        width={typeof height === 'number' ? height * aspectRatio : 120} 
        height={typeof height === 'number' ? height : 40}
        style={{ ...filterStyle, height: '100%', width: 'auto', objectFit: 'contain' }}
        priority
      />
    </div>
  );
};
