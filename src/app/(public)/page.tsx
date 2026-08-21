import styles from './page.module.css';
import { Container } from '@/components/ui/Container/Container';
import { SectionHeading } from '@/components/ui/SectionHeading/SectionHeading';
import { Button } from '@/components/ui/Button/Button';
import { Badge } from '@/components/ui/Badge/Badge';
import { Logo } from '@/components/common/Logo/Logo';
import { HeroGeometric } from '@/components/common/GeometricElements/HeroGeometric';
import { SectionDivider } from '@/components/common/GeometricElements/SectionDivider';
import { EVENT, REGISTRATION_CATEGORIES, REGISTRATION_BATCHES } from '@/lib/constants';
import { formatCurrency } from '@/lib/utils';
import { Countdown } from '@/components/ui/Countdown/Countdown';
import { TimeTravelDebugger } from './TimeTravelDebugger';
import { getCurrentDate, getBatchStatus, formatShortDate } from '@/lib/dateUtils';
import { cookies } from 'next/headers';

export default async function HomePage() {
  const currentDate = await getCurrentDate();
  const cookieStore = await cookies();
  const simulatedDateStr = cookieStore.get('simulated_date')?.value || null;

  return (
    <>
      <TimeTravelDebugger initialDate={simulatedDateStr} />
      {/* ═══════════════════ HERO ═══════════════════ */}
      <section className={styles.hero} id="hero">
        <HeroGeometric />
        <div className={styles.heroContent}>
          <div className={styles.heroLogoWrapper}>
            <Logo variant="full" height={150} />
          </div>

          <p className={styles.heroEdition}>
            {EVENT.fullName}
          </p>

          <div className={styles.heroInfo}>
            <div className={styles.heroInfoItem}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                <line x1="16" y1="2" x2="16" y2="6" />
                <line x1="8" y1="2" x2="8" y2="6" />
                <line x1="3" y1="10" x2="21" y2="10" />
              </svg>
              <span>{EVENT.dates.display}</span>
            </div>
            <div className={styles.heroDividerDot} />
            <div className={styles.heroInfoItem}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                <circle cx="12" cy="10" r="3" />
              </svg>
              <span>{EVENT.location.shortName} — {EVENT.location.displayCity}</span>
            </div>
          </div>

          <div className={styles.heroActions}>
            <Button variant="primary" size="lg" href="/inscricoes">
              Inscreva-se
            </Button>
            <Button variant="outline" size="lg" href="/sobre">
              Saiba mais
            </Button>
          </div>
        </div>

        <div className={styles.heroScrollIndicator}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="7 13 12 18 17 13" />
            <polyline points="7 6 12 11 17 6" />
          </svg>
        </div>
      </section>

      {/* ═══════════════════ COUNTDOWN ═══════════════════ */}
      <section className={styles.countdownSection}>
        <Container>
          <Countdown targetDate="2026-11-25T08:00:00-03:00" />
        </Container>
      </section>

      <SectionDivider />

      {/* ═══════════════════ SOBRE ═══════════════════ */}
      <section className={styles.section} id="sobre">
        <Container>
          <div className={styles.aboutGrid}>
            <div className={styles.aboutContent}>
              <SectionHeading
                overline="Sobre o Evento"
                title="COFOA XV"
                alignment="left"
              />
              <div className={styles.aboutText}>
                <p className={styles.placeholder}>
                  [Conteúdo placeholder — A descrição oficial do COFOA XV será fornecida pela organização do evento. 
                  Este espaço apresentará a história do congresso, seus objetivos, público-alvo e a importância 
                  do evento para a comunidade odontológica.]
                </p>
                <p className={styles.placeholder}>
                  [O COFOA XV reunirá profissionais, acadêmicos e pesquisadores da odontologia 
                  em quatro dias de atividades na Faculdade de Odontologia de Araçatuba — FOA UNESP.]
                </p>
              </div>
              <Button variant="outline" href="/sobre">
                Conheça o COFOA XV
              </Button>
            </div>
            <div className={styles.aboutVisual}>
              <div className={styles.aboutCard}>
                <span className={styles.aboutCardEdition}>XV</span>
                <span className={styles.aboutCardLabel}>Edição</span>
              </div>
              <div className={styles.aboutDecorative}>
                <svg viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg" className={styles.aboutTriangles}>
                  <polygon points="100,20 180,160 20,160" stroke="var(--color-primary)" strokeWidth="1" fill="none" opacity="0.15" />
                  <polygon points="100,40 160,150 40,150" stroke="var(--color-blue-cyan)" strokeWidth="1" fill="none" opacity="0.12" />
                  <polygon points="100,60 140,140 60,140" stroke="var(--color-primary)" strokeWidth="0.5" fill="none" opacity="0.1" />
                </svg>
              </div>
            </div>
          </div>
        </Container>
      </section>

      <SectionDivider flip />

      {/* ═══════════════════ INFORMAÇÕES RÁPIDAS ═══════════════════ */}
      <section className={`${styles.section} ${styles.sectionAlt}`} id="info">
        <Container>
          <SectionHeading
            overline="Informações"
            title="O Congresso em Números"
            alignment="center"
          />
          <div className={styles.infoGrid}>
            <div className={styles.infoCard}>
              <svg className={styles.infoIcon} width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="var(--color-accent-gold)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                <line x1="16" y1="2" x2="16" y2="6" />
                <line x1="8" y1="2" x2="8" y2="6" />
                <line x1="3" y1="10" x2="21" y2="10" />
              </svg>
              <span className={styles.infoValue}>{EVENT.dates.shortDisplay}</span>
              <span className={styles.infoLabel}>Data do Evento</span>
            </div>
            <div className={styles.infoCard}>
              <svg className={styles.infoIcon} width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="var(--color-accent-gold)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" />
                <polyline points="12 6 12 12 16 14" />
              </svg>
              <span className={styles.infoValue}>{EVENT.dates.days} Dias</span>
              <span className={styles.infoLabel}>De Programação</span>
            </div>
            <div className={styles.infoCard}>
              <svg className={styles.infoIcon} width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="var(--color-accent-gold)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" />
                <polyline points="12 6 12 12 8 14" />
              </svg>
              <span className={styles.infoValue}>{EVENT.hours.display}</span>
              <span className={styles.infoLabel}>Horário</span>
            </div>
            <div className={styles.infoCard}>
              <svg className={styles.infoIcon} width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="var(--color-accent-gold)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                <polyline points="9 22 9 12 15 12 15 22" />
              </svg>
              <span className={styles.infoValue}>{EVENT.location.shortName}</span>
              <span className={styles.infoLabel}>{EVENT.location.displayCity}</span>
            </div>
          </div>
        </Container>
      </section>

      <SectionDivider />

      {/* ═══════════════════ INSCRIÇÕES ═══════════════════ */}
      <section className={styles.section} id="inscricoes">
        <Container>
          <SectionHeading
            overline="Inscrições"
            title="Garanta sua Vaga"
            subtitle="Escolha sua categoria e realize sua inscrição para o COFOA XV."
            alignment="center"
          />

          {/* Lotes */}
          <div className={styles.batchesGrid}>
            {REGISTRATION_BATCHES.map((batch) => {
              const status = getBatchStatus(batch.startDate, batch.endDate, currentDate);
              const isCurrent = status === 'ACTIVE';
              const isSoldOut = status === 'SOLD_OUT';

              return (
                <div
                  key={batch.id}
                  className={`${styles.batchCard} ${isCurrent ? styles.batchCardHighlight : ''} ${isSoldOut ? styles.batchCardSoldOut : ''}`}
                >
                  {isCurrent && (
                    <div className={styles.batchBadgeTop}>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                        <polyline points="22 4 12 14.01 9 11.01"></polyline>
                      </svg>
                      Lote atual
                    </div>
                  )}
                  {isSoldOut && (
                    <div className={styles.batchBadgeTop} style={{ background: 'var(--color-text-muted)' }}>
                      Esgotado
                    </div>
                  )}

                  <h3 className={styles.batchName}>{batch.name}</h3>
                  <p className={styles.batchDates}>
                    {batch.startDate && batch.endDate 
                      ? `${formatShortDate(batch.startDate)} a ${formatShortDate(batch.endDate)}` 
                      : 'Datas a definir'}
                  </p>

                  <ul className={styles.batchFeaturesList}>
                    {[
                      { name: 'Graduandos e Pós da FOA UNESP', price: batch.prices.presencial_tier1 },
                      { name: 'Graduandos e Pós Externos', price: batch.prices.presencial_tier2 },
                      { name: 'Profissionais da Odontologia', price: batch.prices.presencial_tier3 },
                      { name: '1 trabalho on-line', price: batch.prices.online_tier1 },
                      { name: '2 trabalhos ou Banca on-line', price: batch.prices.online_tier2 },
                    ].map((feature, idx) => (
                      <li key={idx} className={styles.batchFeatureItem}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="20 6 9 17 4 12"></polyline>
                        </svg>
                        <span className={styles.batchFeatureName}>{feature.name}</span>
                        <span className={styles.batchFeaturePrice}>{formatCurrency(feature.price)}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              );
            })}
          </div>

          {/* Categorias */}
          <div className={styles.categoriesSection}>
            <h3 className={styles.categoriesTitle}>Categorias de Inscrição</h3>
            <div className={styles.categoriesGrid}>
              <div className={styles.categoryGroup}>
                <h4 className={styles.categoryGroupTitle}>
                  <Badge variant="primary" size="sm">Presencial</Badge>
                </h4>
                <ul className={styles.categoryList}>
                  {REGISTRATION_CATEGORIES.filter(c => c.type === 'presencial').map(cat => (
                    <li key={cat.id} className={styles.categoryItem}>
                      {cat.name}
                    </li>
                  ))}
                </ul>
              </div>
              <div className={styles.categoryGroup}>
                <h4 className={styles.categoryGroupTitle}>
                  <Badge variant="info" size="sm">On-line</Badge>
                </h4>
                <ul className={styles.categoryList}>
                  {REGISTRATION_CATEGORIES.filter(c => c.type === 'online').map(cat => (
                    <li key={cat.id} className={styles.categoryItem}>
                      {cat.name}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          <div className={styles.sectionCta}>
            <Button variant="primary" size="lg" href="/inscricoes">
              Realizar inscrição
            </Button>
          </div>
        </Container>
      </section>



      {/* ═══════════════════ PROGRAMAÇÃO ═══════════════════ */}
      <section className={styles.section} id="programacao">
        <Container>
          <SectionHeading
            overline="Programação"
            title="Programação do Evento"
            alignment="center"
          />
          <div className={styles.scheduleTimeline}>
            {['25', '26', '27', '28'].map((day) => (
              <div key={day} className={styles.scheduleDay}>
                <div className={styles.scheduleDayHeader}>
                  <span className={styles.scheduleDayNumber}>{day}</span>
                  <span className={styles.scheduleDayMonth}>NOV</span>
                </div>
                <div className={styles.scheduleDayContent}>
                  <div className={styles.scheduleDayEmpty}>
                    <p>Programação em breve</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className={styles.sectionCta}>
            <Button variant="outline" size="lg" href="/programacao">
              Ver programação completa
            </Button>
          </div>
        </Container>
      </section>

      <SectionDivider flip />

      {/* ═══════════════════ LOCALIZAÇÃO ═══════════════════ */}
      <section className={`${styles.section} ${styles.sectionAlt}`} id="local">
        <Container>
          <div className={styles.locationGrid}>
            <div className={styles.locationInfo}>
              <SectionHeading
                overline="Localização"
                title="Como Chegar"
                alignment="left"
              />
              <div className={styles.locationDetails}>
                <h3 className={styles.locationName}>
                  {EVENT.location.name}
                </h3>
                <p className={styles.locationAddress}>
                  {EVENT.location.address}
                </p>
                <p className={styles.locationCity}>
                  {EVENT.location.city} — {EVENT.location.state}
                </p>
              </div>
              <Button variant="outline" href="/local">
                Ver no mapa
              </Button>
            </div>
            <div className={styles.locationMap}>
              <div className={styles.locationMapPlaceholder}>
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="var(--color-blue-gray)" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                  <circle cx="12" cy="10" r="3" />
                </svg>
                <p>Mapa interativo em breve</p>
              </div>
            </div>
          </div>
        </Container>
      </section>
    </>
  );
}
