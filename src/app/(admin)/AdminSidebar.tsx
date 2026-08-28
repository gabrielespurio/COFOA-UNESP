'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Logo } from '@/components/common/Logo/Logo';
import { logout } from '@/actions/auth';
import styles from './layout.module.css';

const MENU_ITEMS = [
  { label: 'Dashboard', href: '/admin' },
  { label: 'Participantes', href: '/admin/participantes' },
  { label: 'Inscrições', href: '/admin/inscricoes' },
  { label: 'Categorias', href: '/admin/categorias' },
  { label: 'Lotes de Inscrição', href: '/admin/lotes' },
  { label: 'Pagamentos', href: '/admin/pagamentos' },
  { label: 'Cupons', href: '/admin/cupons' },
  { label: 'Trabalhos', href: '/admin/trabalhos' },
  { label: 'Certificados', href: '/admin/certificados' },
  { label: 'Configurações', href: '/admin/configuracoes' },
];

export function AdminSidebar({ children }: { children?: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const pathname = usePathname();

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

  return (
    <>
      <aside className={`${styles.sidebar} ${!sidebarOpen ? styles.sidebarClosed : ''} md:translate-x-0`}>
        <div className={styles.sidebarHeader}>
          <Logo type="icon" variant="full" height={32} />
          <span>COFOA XV</span>
          <span className={styles.adminBadge}>Admin</span>
        </div>
        <nav className={styles.nav}>
          {MENU_ITEMS.map((item) => {
            const isActive = item.href === '/admin' ? pathname === '/admin' : pathname.startsWith(item.href);
            return (
              <Link 
                key={item.href} 
                href={item.href} 
                className={`${styles.navItem} ${isActive ? styles.navItemActive : ''}`} 
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
            style={{ width: '100%', textAlign: 'left', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit' }}
          >
            Sair
          </button>
        </nav>
      </aside>
      
      <main className={styles.main}>

        <div className={styles.content}>
          {children}
        </div>
      </main>
    </>
  );
}
