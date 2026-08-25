'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Logo } from '@/components/common/Logo/Logo';
import { logout } from '@/actions/auth';
import { cn } from '@/lib/utils';
import styles from './layout.module.css';

const MENU_ITEMS = [
  { label: 'Painel', href: '/area-participante' },
  { label: 'Programação', href: '/area-participante/programacao' },
  { label: 'Pagamento', href: '/area-participante/pagamento' },
  { label: 'Meus Trabalhos', href: '/area-participante/trabalhos' },
  { label: 'Meu Perfil', href: '/area-participante/perfil' },
  { label: 'Certificado', href: '/area-participante/certificado' },
];

export function ParticipantSidebar({ profileCompleted, children }: { profileCompleted: boolean, children?: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const pathname = usePathname();

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

  return (
    <>
      <aside className={cn(styles.sidebar, !sidebarOpen && styles.sidebarClosed)}>
        <div className={styles.sidebarHeader}>
          <Logo variant="full" height={40} />
        </div>
        <nav className={styles.nav}>
          {MENU_ITEMS.map((item) => {
            // Block navigation to other tabs if profile is not completed (except the profile tab itself)
            const isBlocked = !profileCompleted && item.href !== '/area-participante/perfil';
            const isActive = pathname === item.href;

            return (
              <Link 
                key={item.href} 
                href={isBlocked ? '#' : item.href} 
                className={cn(
                  styles.navItem, 
                  isActive && styles.navItemActive,
                  isBlocked && styles.navItemDisabled
                )} 
                onClick={(e) => {
                  if (isBlocked) e.preventDefault();
                  setSidebarOpen(false);
                }}
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
            Sair
          </button>
        </nav>
      </aside>
      
      <main className={styles.main}>
        <header className={styles.topbar}>
          <button className={styles.menuButton} onClick={toggleSidebar}>
            ☰
          </button>
          <div className={styles.userMenu}>
            <div className={styles.userAvatar}>P</div>
          </div>
        </header>
        <div className={styles.content}>
          {children}
        </div>
      </main>
    </>
  );
}
