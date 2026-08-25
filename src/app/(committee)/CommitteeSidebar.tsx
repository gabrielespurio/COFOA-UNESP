'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Logo } from '@/components/common/Logo/Logo';
import { cn } from '@/lib/utils';
import { logout } from '@/actions/auth';
import styles from '../(participant)/layout.module.css';

const MENU_ITEMS = [
  { href: '/comissao', label: 'Painel Gerencial' },
  { href: '/comissao/trabalhos', label: 'Trabalhos Submetidos' },
];

export function CommitteeSidebar({ children }: { children?: React.ReactNode }) {
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <>
      {/* Backdrop */}
      {sidebarOpen && (
        <div 
          className={styles.backdrop}
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={cn(styles.sidebar, !sidebarOpen && styles.sidebarClosed)}>
        <div className={styles.sidebarHeader}>
          <Logo variant="full" height={40} />
          <div style={{ marginTop: '0.5rem', fontSize: '0.75rem', color: 'var(--color-primary-light)', fontWeight: 600, letterSpacing: '0.05em' }}>
            COMISSÃO CIENTÍFICA
          </div>
        </div>
        
        <nav className={styles.nav}>
          {MENU_ITEMS.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link 
                key={item.href} 
                href={item.href}
                className={cn(styles.navItem, isActive && styles.navItemActive)}
                onClick={() => setSidebarOpen(false)}
              >
                {item.label}
              </Link>
            );
          })}

          <button 
            className={styles.navItem} 
            onClick={() => {
              setSidebarOpen(false);
              logout();
            }}
            style={{ width: '100%', textAlign: 'left', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit', marginTop: 'auto' }}
          >
            Sair do Sistema
          </button>
        </nav>
      </aside>

      <main className={styles.main}>
        <header className={styles.topbar}>
          <button className={styles.menuButton} onClick={() => setSidebarOpen(!sidebarOpen)}>
            ☰
          </button>
          <div className={styles.userMenu}>
            <div className={styles.userAvatar}>C</div>
          </div>
        </header>
        <div className={styles.content}>
          {children}
        </div>
      </main>
    </>
  );
}
