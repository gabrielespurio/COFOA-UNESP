import React from 'react';
import Link from 'next/link';
import { EVENT, NAV_LINKS } from '@/lib/constants';
import { Logo } from '@/components/common/Logo/Logo';
import { Container } from '@/components/ui/Container/Container';
import styles from './Footer.module.css';

interface FooterProps {
  isLoggedIn?: boolean;
}

export const Footer = ({ isLoggedIn = false }: FooterProps) => {
  const visibleLinks = NAV_LINKS.filter(
    (link) => !link.requiresAuth || isLoggedIn
  );

  return (
    <footer className={styles.footer}>
      <div className={styles.geometricDecor}></div>
      <Container>
        <div className={styles.grid}>
          {/* Column 1: Brand & Info */}
          <div className={styles.brandCol}>
            <Logo height={48} className={styles.logo} />
            <div className={styles.eventInfo}>
              <p className={styles.eventName}>{EVENT.fullName}</p>
              <p className={styles.eventDate}>{EVENT.dates.display}</p>
              <p className={styles.eventLocation}>{EVENT.location.name}</p>
            </div>
          </div>

          {/* Column 2: Navigation */}
          <div className={styles.navCol}>
            <h3 className={styles.colTitle}>Navegação</h3>
            <ul className={styles.linkList}>
              {visibleLinks.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className={styles.link}>
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 3: Quick Links */}
          <div className={styles.navCol}>
            <h3 className={styles.colTitle}>Links Rápidos</h3>
            <ul className={styles.linkList}>
              {isLoggedIn && (
                <>
                  <li>
                    <Link href="/inscricoes" className={styles.link}>
                      Inscrições
                    </Link>
                  </li>
                  <li>
                    <Link href="/trabalhos" className={styles.link}>
                      Submissão de Trabalhos
                    </Link>
                  </li>
                </>
              )}
              <li>
                <Link href={isLoggedIn ? "/area-participante" : "/login"} className={styles.link}>
                  {isLoggedIn ? "Área do Participante" : "Fazer Login"}
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 4: Contact */}
          <div className={styles.navCol}>
            <h3 className={styles.colTitle}>Contato</h3>
            <ul className={styles.linkList}>
              <li className={styles.contactItem}>
                <span className={styles.contactLabel}>E-mail</span>
                <span className={styles.contactValue}>cofoa.unesp@gmail.com</span>
              </li>
              <li className={styles.contactItem}>
                <span className={styles.contactLabel}>Instagram</span>
                <span className={styles.contactValue}>@congressofoa</span>
              </li>
            </ul>
          </div>
        </div>

        <div className={styles.bottomBar}>
          <p className={styles.copyright}>
            © {EVENT.year} {EVENT.name} — {EVENT.institutionShort}
          </p>
          <div className={styles.legalLinks}>
            <Link href="/privacidade" className={styles.legalLink}>
              Política de Privacidade
            </Link>
            <span className={styles.separator}>|</span>
            <Link href="/termos" className={styles.legalLink}>
              Termos de Uso
            </Link>
          </div>
        </div>
      </Container>
    </footer>
  );
};
