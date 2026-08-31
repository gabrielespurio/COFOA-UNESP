import styles from './page.module.css';
import { Container } from '@/components/ui/Container/Container';
import { SectionHeading } from '@/components/ui/SectionHeading/SectionHeading';
import { Button } from '@/components/ui/Button/Button';
import { Badge } from '@/components/ui/Badge/Badge';
import { Logo } from '@/components/common/Logo/Logo';
import { HeroGeometric } from '@/components/common/GeometricElements/HeroGeometric';
import { SectionDivider } from '@/components/common/GeometricElements/SectionDivider';
import { LandingSchedule } from '@/components/public/LandingSchedule/LandingSchedule';
import { EVENT, REGISTRATION_CATEGORIES, REGISTRATION_BATCHES } from '@/lib/constants';
import { formatCurrency } from '@/lib/utils';
import { Countdown } from '@/components/ui/Countdown/Countdown';
import { TimeTravelDebugger } from './TimeTravelDebugger';
import { getCurrentDate, getBatchStatus, formatShortDate } from '@/lib/dateUtils';
import { getSession } from '@/lib/auth';
import { cookies } from 'next/headers';
import { OrganizationSection } from '@/components/public/OrganizationSection/OrganizationSection';

export const dynamic = 'force-dynamic';

export default async function HomePage() {
  const currentDate = await getCurrentDate();
  const session = await getSession();

  const checkoutHref = session 
    ? '/area-participante/inscricao' 
    : '/login?redirectTo=/area-participante/inscricao';
  const cookieStore = await cookies();
  const simulatedDateStr = cookieStore.get('simulated_date')?.value || null;

  return (
    <>
      <TimeTravelDebugger initialDate={simulatedDateStr} />
      {/* ═══════════════════ HERO ═══════════════════ */}
      <section className={styles.hero} id="hero">
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
            <Button variant="primary" size="lg" href={checkoutHref}>
              Realizar inscrição
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
      <section className={styles.section} id="sobre" style={{ position: 'relative' }}>
        <HeroGeometric className={styles.aboutGeometricBackground} />
        <Container>
          <div className={styles.aboutGrid}>
            <div className={styles.aboutContent}>
              <SectionHeading
                overline="Sobre o Evento"
                title="COFOA XV"
                alignment="left"
              />
              <div className={styles.aboutText}>
                <p>
                  O Congresso da Faculdade de Odontologia de Araçatuba (COFOA/Unesp) chega à sua 15ª edição, reafirmando sua posição entre os mais relevantes eventos acadêmicos e científicos da Odontologia no país. Ao longo de sua trajetória, o Congresso tem ampliado seu alcance e representatividade, reunindo estudantes, cirurgiões-dentistas, pesquisadores e docentes em um ambiente dedicado à troca de experiências e construção do conhecimento.
                </p>
                <p>
                  A programação contempla diferentes áreas da Odontologia, promovendo educação continuada, discussão de casos clínicos e integração entre ensino, pesquisa e prática profissional. Contaremos com palestrantes renomados abordando temas contemporâneos vitais para a prática clínica.
                </p>
              </div>
              
              <div className={styles.aboutTribute}>
                <div className={styles.tributeIcon}>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 15l-2 5l9-9l-9-9l2 5l-10 4z" />
                  </svg>
                </div>
                <div className={styles.tributeContent}>
                  <h4>Homenagem Especial</h4>
                  <p>
                    Com grande honra, a FOA/Unesp dedica esta edição ao <strong>Prof. Dr. Ruy dos Santos Pintos</strong>, em reconhecimento à sua contribuição à história da instituição. Seu legado de excelência acadêmica e sensibilidade humana é celebrado por toda a comunidade.
                  </p>
                </div>
              </div>

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

          <div className={styles.integratedEvents}>
            <div className={styles.eventCard}>
              <div className={styles.eventCardHeader}>
                <span className={styles.eventNumber}>43ª</span>
                <h5>Jornada Odontológica</h5>
              </div>
              <p>Uma das mais tradicionais do Brasil, incentivando a iniciação científica e a discussão de trabalhos entre graduação e pós-graduação.</p>
            </div>
            <div className={styles.eventCard}>
              <div className={styles.eventCardHeader}>
                <span className={styles.eventNumber}>21º</span>
                <h5>Simpósio de Pós-Graduação</h5>
              </div>
              <p>Reafirma o compromisso com a excelência na formação stricto sensu, estimulando a produção científica e o intercâmbio de conhecimento.</p>
            </div>
          </div>
        </Container>
      </section>

      <SectionDivider flip />

      {/* ═══════════════════ ORGANIZAÇÃO ═══════════════════ */}
      <section className={styles.section} id="organizacao">
        <Container>
          <SectionHeading
            overline="Organização"
            title="Disciplina de Cirurgia e Traumatologia Bucomaxilofacial - FOA/UNESP"
            alignment="center"
          />
          <OrganizationSection />
        </Container>
      </section>

      <SectionDivider flip />

      {/* ═══════════════════ INFORMAÇÕES RÁPIDAS ═══════════════════ */}
      <section className={`${styles.section} ${styles.sectionAlt}`} id="info">
        <Container>
          <SectionHeading
            overline="Informações"
            title="Nossos Parceiros"
            alignment="center"
          />
          <div className={styles.infoGrid} style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))' }}>
            {['Organizadores', 'Patrocinadores', 'Convidados'].map((title, index) => (
              <div key={index} className={styles.placeholderCard}>
                <div className={styles.placeholderIconWrapper}>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                    <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                  </svg>
                </div>
                <h3 className={styles.placeholderTitle}>{title}</h3>
                <div className={styles.placeholderBadge}>Em Breve</div>
              </div>
            ))}
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
            subtitle="Escolha sua categoria e aproveite os valores do lote atual."
            alignment="center"
          />

          {(() => {
            // Find active batch
            let activeBatch = REGISTRATION_BATCHES.find(b => getBatchStatus(b.startDate, b.endDate, currentDate) === 'ACTIVE');
            
            // If no active batch, find the next upcoming one
            if (!activeBatch) {
              activeBatch = REGISTRATION_BATCHES.find(b => getBatchStatus(b.startDate, b.endDate, currentDate) === 'UPCOMING') || REGISTRATION_BATCHES[REGISTRATION_BATCHES.length - 1];
            }
            
            const isSoldOut = getBatchStatus(activeBatch.startDate, activeBatch.endDate, currentDate) === 'SOLD_OUT';

            return (
              <>
                <div className={styles.activeBatchHeader}>
                  <div className={styles.activeBatchInfo}>
                    <h4>{activeBatch.name}</h4>
                    <p>Válido até {activeBatch.endDate ? formatShortDate(activeBatch.endDate) : 'Data a definir'}</p>
                  </div>
                  {isSoldOut ? (
                    <Badge variant="outline">Inscrições Encerradas</Badge>
                  ) : (
                    <Badge variant="success">Lote Aberto</Badge>
                  )}
                </div>

                <div className={styles.categoriesWrapper}>
                  {/* Presencial */}
                  <div className={styles.categoryColumn}>
                    <h3 className={styles.categoryColumnTitle}>
                      <Badge variant="primary" size="sm">Presencial</Badge>
                    </h3>
                    <div className={styles.categoryCardGrid}>
                      {REGISTRATION_CATEGORIES.filter(c => c.type === 'presencial').map(cat => (
                        <div key={cat.id} className={styles.categoryPriceCard}>
                          <div className={styles.categoryPriceCardContent}>
                            <h4 className={styles.categoryPriceName}>{cat.name}</h4>
                            <div className={styles.categoryPriceValue}>
                              {formatCurrency(activeBatch.prices[cat.priceTier])}
                            </div>
                          </div>
                          <Button variant="secondary" href={checkoutHref} disabled={isSoldOut}>
                            Inscrever-se
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Online */}
                  <div className={styles.categoryColumn}>
                    <h3 className={styles.categoryColumnTitle}>
                      <Badge variant="info" size="sm">On-line</Badge>
                    </h3>
                    <div className={styles.categoryCardGrid}>
                      {REGISTRATION_CATEGORIES.filter(c => c.type === 'online').map(cat => (
                        <div key={cat.id} className={styles.categoryPriceCard}>
                          <div className={styles.categoryPriceCardContent}>
                            <h4 className={styles.categoryPriceName}>{cat.name}</h4>
                            <div className={styles.categoryPriceValue}>
                              {formatCurrency(activeBatch.prices[cat.priceTier])}
                            </div>
                          </div>
                          <Button variant="secondary" href={checkoutHref} disabled={isSoldOut}>
                            Inscrever-se
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </>
            );
          })()}

          <div className={styles.sectionCta}>
            <Button variant="primary" size="lg" href={checkoutHref}>
              Realizar inscrição agora
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
          <LandingSchedule />

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
              <Button variant="outline" href="https://maps.google.com/maps?q=Faculdade%20de%20Odontologia%20de%20Ara%C3%A7atuba%20UNESP" target="_blank" rel="noopener noreferrer">
                Ver no Google Maps
              </Button>
            </div>
            <div className={styles.locationMap}>
              <iframe
                src="https://maps.google.com/maps?q=Faculdade%20de%20Odontologia%20de%20Ara%C3%A7atuba%20UNESP&t=&z=15&ie=UTF8&iwloc=&output=embed"
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="Mapa de Localização - FOA UNESP"
              ></iframe>
            </div>
          </div>
        </Container>
      </section>
    </>
  );
}
