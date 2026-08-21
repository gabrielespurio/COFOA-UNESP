'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { NAV_LINKS } from '@/lib/constants';
import { Logo } from '@/components/common/Logo/Logo';
import { Button } from '@/components/ui/Button/Button';
import { Container } from '@/components/ui/Container/Container';
import styles from './Header.module.css';

interface HeaderProps {
  transparent?: boolean;
  isLoggedIn?: boolean;
}

export const Header = ({ transparent = false, isLoggedIn = false }: HeaderProps) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 80);
    };
    
    // Check initial scroll position
    handleScroll();

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [mobileMenuOpen]);

  // Close mobile menu on path change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  const isSolid = !transparent || isScrolled;

  const visibleLinks = NAV_LINKS.filter(
    (link) => !link.requiresAuth || isLoggedIn
  );

  return (
    <>
      <header className={cn(styles.header, isSolid ? styles.solid : styles.transparent)}>
        <Container>
          <nav className={styles.nav}>
            <Link href="/" className={styles.logoLink} aria-label="Início">
              <Logo variant="compact" height={36} className={cn(styles.logo, !isSolid && styles.logoTransparent)} />
            </Link>

            <ul className={styles.desktopNav}>
              {visibleLinks.map((link) => (
                <li key={link.href}>
                  <Link 
                    href={link.href}
                    className={cn(
                      styles.navLink, 
                      pathname === link.href && styles.active
                    )}
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>

            <div className={styles.desktopActions}>
              {isLoggedIn ? (
                <Button href="/area-participante" variant={isSolid ? 'primary' : 'outline'} size="sm" className={styles.ctaButton}>
                  Minha Área
                </Button>
              ) : (
                <Button href="/login" variant={isSolid ? 'primary' : 'outline'} size="sm" className={styles.ctaButton}>
                  Entrar
                </Button>
              )}
            </div>

            <button 
              className={cn(styles.hamburger, isSolid ? styles.hamburgerSolid : styles.hamburgerTransparent)} 
              aria-label="Abrir menu"
              onClick={() => setMobileMenuOpen(true)}
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="3" y1="12" x2="21" y2="12"></line>
                <line x1="3" y1="6" x2="21" y2="6"></line>
                <line x1="3" y1="18" x2="21" y2="18"></line>
              </svg>
            </button>
          </nav>
        </Container>
      </header>

      {/* Mobile Menu Overlay */}
      <div 
        className={cn(styles.mobileMenuOverlay, mobileMenuOpen && styles.mobileMenuOpen)}
        onClick={() => setMobileMenuOpen(false)}
        aria-hidden={!mobileMenuOpen}
      />
      
      <div 
        className={cn(styles.mobileMenuDrawer, mobileMenuOpen && styles.mobileMenuOpen)}
        role="dialog"
        aria-modal="true"
        aria-label="Menu de navegação"
      >
        <div className={styles.mobileMenuHeader}>
          <Logo variant="compact" height={32} />
          <button 
            className={styles.closeButton} 
            onClick={() => setMobileMenuOpen(false)}
            aria-label="Fechar menu"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>

        <nav className={styles.mobileNav}>
          <ul className={styles.mobileNavList}>
            {visibleLinks.map((link) => (
              <li key={link.href}>
                <Link 
                  href={link.href}
                  className={cn(
                    styles.mobileNavLink, 
                    pathname === link.href && styles.active
                  )}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className={styles.mobileMenuFooter}>
          {isLoggedIn ? (
            <Button href="/area-participante" fullWidth size="lg">
              Minha Área
            </Button>
          ) : (
            <Button href="/login" fullWidth size="lg">
              Entrar
            </Button>
          )}
        </div>
      </div>
    </>
  );
};
