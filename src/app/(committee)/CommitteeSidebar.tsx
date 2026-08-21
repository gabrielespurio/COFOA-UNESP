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

export function CommitteeSidebar() {
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <>
      {/* Mobile Toggle */}
      <button 
        className="md:hidden fixed top-4 left-4 z-50 p-2 bg-primary text-white rounded-md"
        onClick={() => setSidebarOpen(!sidebarOpen)}
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <line x1="3" y1="12" x2="21" y2="12"></line>
          <line x1="3" y1="6" x2="21" y2="6"></line>
          <line x1="3" y1="18" x2="21" y2="18"></line>
        </svg>
      </button>

      {/* Backdrop */}
      {sidebarOpen && (
        <div 
          className="md:hidden fixed inset-0 bg-black/50 z-30"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={cn(styles.sidebar, !sidebarOpen && styles.sidebarClosed, "md:translate-x-0")}>
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
        </nav>

        <div className={styles.sidebarFooter}>
          <form action={logout}>
            <button type="submit" className={styles.logoutBtn}>
              Sair do Sistema
            </button>
          </form>
        </div>
      </aside>
    </>
  );
}
