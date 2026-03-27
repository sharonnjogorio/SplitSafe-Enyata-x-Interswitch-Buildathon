import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import styles from './LandingPage.module.css'


// ── Shared navbar ─────────────────────────────────────────────
function Navbar() {
  return (
    <nav className={styles.navbar}>
      <Link to="/" className={styles.navLogo}>
        <svg className={styles.navLogoIcon} viewBox="0 0 24 24" fill="none"
          stroke="currentColor" strokeWidth="2">
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
        </svg>
        SplitSafe
      </Link>
      <div className={styles.navActions}>
        <Link to="/login"  className={styles.loginLink}>Login</Link>
        <Link to="/signup" className={styles.signupBtn}>Sign Up</Link>
      </div>
    </nav>
  )
}

// ── Dot indicators ────────────────────────────────────────────
function Dots({ current, total, onChange }) {
  return (
    <div className={styles.dots}>
      {Array.from({ length: total }).map((_, i) => (
        <button
          key={i}
          className={`${styles.dot} ${i === current ? styles.activeDot : ''}`}
          onClick={() => onChange(i)}
          aria-label={`Go to slide ${i + 1}`}
        />
      ))}
    </div>
  )
}

// ── Slide 1: Introduction ─────────────────────────────────────
function SlideOne({ onNext }) {
  return (
    <div className={`${styles.slide} ${styles.active}`}>
      <div className={styles.slideBody}>

        {/* Left */}
        <div className={styles.hero}>
          <span className={styles.badge}>Introduction</span>
          <h1 className={styles.heroTitle}>
            Architecting Clarity in Shared Expenses.
          </h1>
          <p className={styles.heroDesc}>
            Join SplitSafe to experience the most sophisticated way to manage group
            finances, smart settlements, and architectural wealth tracking.
          </p>
          <div className={styles.btnRow}>
            <button className={styles.nextBtn} onClick={onNext}>Next</button>
          </div>
        </div>

        {/* Right */}
        <div className={styles.visual}>

          {/* System status card */}
          <div className={styles.systemCard}>
            <div className={styles.systemCardTop}>
              <div>
                <div className={styles.systemCardLabel}>System Status</div>
                <div className={styles.systemCardTitle}>Optimization Engine</div>
              </div>
              <span className={styles.liveTag}>
                <span className={styles.liveDot}/>
                Live Analysis
              </span>
            </div>

            <div className={styles.metricRow}>
              <div className={styles.metricIcon}>
                <svg className={styles.metricIconSvg} viewBox="0 0 24 24" fill="none"
                  stroke="currentColor" strokeWidth="2">
                  <rect x="2" y="3" width="20" height="14" rx="2"/>
                  <line x1="8" y1="21" x2="16" y2="21"/>
                  <line x1="12" y1="17" x2="12" y2="21"/>
                </svg>
              </div>
              <div className={styles.metricBody}>
                <div className={styles.metricLabel}>Smart Settlement</div>
                <div className={styles.metricTitle}>Minimizing 12 Transfers</div>
              </div>
              <div className={styles.metricValue}>
                <div className={styles.metricNum}>-42%</div>
                <div className={styles.metricSub}>Complexity</div>
              </div>
            </div>

            <div className={styles.metricRow}>
              <div className={styles.metricIcon}>
                <svg className={styles.metricIconSvg} viewBox="0 0 24 24" fill="none"
                  stroke="currentColor" strokeWidth="2">
                  <rect x="2" y="5" width="20" height="14" rx="2"/>
                  <line x1="2" y1="10" x2="22" y2="10"/>
                </svg>
              </div>
              <div className={styles.metricBody}>
                <div className={styles.metricLabel}>Interswitch Pay</div>
                <div className={styles.metricTitle}>Secure In-App Payments</div>
              </div>
              <div className={styles.metricValue}>
                <div className={styles.metricNum}>₦0 Fee</div>
                <div className={styles.metricSub}>To settle</div>
              </div>
            </div>
          </div>

          {/* Network efficiency card */}
          <div className={styles.networkCard}>
            <div className={styles.networkLabel}>Network Efficiency</div>
            <div className={styles.networkBars}>
              <div className={`${styles.networkBar} ${styles.xshort}`}/>
              <div className={`${styles.networkBar} ${styles.short}`}/>
              <div className={`${styles.networkBar} ${styles.mid}`}/>
              <div className={`${styles.networkBar} ${styles.tall}`}/>
              <div className={`${styles.networkBar} ${styles.mid}`}/>
              <div className={`${styles.networkBar} ${styles.short}`}/>
              <div className={`${styles.networkBar} ${styles.tall}`}/>
              <div className={`${styles.networkBar} ${styles.mid}`}/>
            </div>
            <div className={styles.networkBottom}>
              <span className={styles.networkPrecision}>Optimised Settlements</span>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none"
                stroke="rgba(255,255,255,0.7)" strokeWidth="2">
                <polyline points="22 7 13.5 15.5 8.5 10.5 2 17"/>
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Feature cards below */}
      <div className={styles.featureGrid}>
        {[
          {
            title: 'Precision Splitting',
            desc:  'Advanced algorithms ensure every cent is accounted for across complex multi-currency groups.',
            icon:  <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>,
          },
          {
            title: 'Vault-Grade Security',
            desc:  'Your financial data is protected by institutional-level encryption and biometric authentication.',
            icon:  <><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></>,
          },
          {
            title: 'Smart Settlements',
            desc:  'Intelligent debt-shuffling reduces the number of transactions needed to square up completely.',
            icon:  <><polyline points="22 7 13.5 15.5 8.5 10.5 2 17"/><polyline points="16 7 22 7 22 13"/></>,
          },
        ].map((f) => (
          <div key={f.title} className={styles.featureCard}>
            <div className={styles.featureIconWrap}>
              <svg className={styles.featureIconSvg} viewBox="0 0 24 24" fill="none"
                stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                {f.icon}
              </svg>
            </div>
            <div className={styles.featureTitle}>{f.title}</div>
            <div className={styles.featureDesc}>{f.desc}</div>
          </div>
        ))}
      </div>
    </div>
  )
}

// ── Slide 2: Optimization ─────────────────────────────────────
function SlideTwo({ onNext }) {
  return (
    <div className={`${styles.slide} ${styles.active}`}>
      <div className={styles.slideBody}>

        {/* Left */}
        <div className={styles.hero}>
          <span className={styles.badgeBlue}>Step 02 — Optimization</span>
          <h1 className={styles.heroTitle} style={{ marginTop: 8 }}>
            Experience the{' '}
            <span className={styles.heroTitleAccent}>Magic Moment.</span>
          </h1>
          <p className={styles.heroDesc}>
            Our algorithms restructure fragmented group debts into a handful of
            simplified payments. Save time, reduce friction, and settle with precision.
          </p>

          <div className={styles.pillRow}>
            <span className={styles.pill}>✦ Path Optimization</span>
            <span className={styles.pill}>◫ Zero Leakage</span>
            <span className={styles.pillYellow}>⚡ Instant Settlement</span>
          </div>

          <div className={styles.btnRow}>
            <button className={styles.nextBtn} onClick={onNext}>Next →</button>
          </div>

          <Dots current={1} total={2} onChange={() => {}} />
        </div>

        {/* Right */}
        <div className={styles.visual}>
          <div className={styles.ledgerCard}>
            <div className={styles.ledgerTop}>
              <div>
                <div className={styles.ledgerTitle}>The Ledger State</div>
                <div className={styles.ledgerSubtitle}>Algorithmic Reduction Active</div>
              </div>
              <span className={styles.previewTag}>Live Preview</span>
            </div>

            {/* Simplified graph */}
            <div className={styles.graphArea}>
              <div className={styles.graphLines}>
                {/* Decorative lines */}
                {[-60,-35,-10,15,40,65].map((deg, i) => (
                  <div key={i} className={styles.graphLine}
                    style={{
                      width: 80,
                      right: '50%',
                      top: '50%',
                      transform: `rotate(${deg}deg)`,
                      opacity: 0.15 + i * 0.05,
                    }}
                  />
                ))}
                <div className={styles.graphCenter}>
                  <svg className={styles.graphCenterIcon} viewBox="0 0 24 24" fill="none"
                    stroke="currentColor" strokeWidth="2">
                    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
                  </svg>
                  <span className={styles.finalTag}>Final</span>
                </div>
              </div>
            </div>

            <div className={styles.ledgerStats}>
              <div className={styles.statBlock}>
                <div className={styles.statSmallLabel}>Input Complexity</div>
                <div className={styles.statValue}>12 Transactions</div>
              </div>
              <span className={styles.arrowIcon}>→</span>
              <div className={styles.statBlock}>
                <div className={styles.statSmallLabel}>Settlement Path</div>
                <div className={styles.statValueGreen}>3 Payments</div>
              </div>
            </div>

            <div className={styles.verifiedBadge}>
              <div className={styles.verifiedIcon}>
                <svg className={styles.verifiedIconSvg} viewBox="0 0 24 24" fill="none"
                  stroke="currentColor" strokeWidth="3">
                  <polyline points="20 6 9 17 4 12"/>
                </svg>
              </div>
              <div>
                <div className={styles.verifiedTitle}>Minimum Transactions</div>
                <div className={styles.verifiedSub}>Debts fully resolved</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}


// ── Main LandingPage ──────────────────────────────────────────
export default function LandingPage() {
  const [slide, setSlide] = useState(0)
  const navigate = useNavigate()

  const next = () => setSlide((s) => Math.min(s + 1, 1))

  return (
    <div className={styles.page}>
      <Navbar />

      <div className={styles.slideWrap}>
        {slide === 0 && <SlideOne onNext={next} />}
        {slide === 1 && <SlideTwo onNext={() => navigate('/signup')} />}
      </div>

      <footer className={styles.footer}>
        <span>© 2026 SplitSafe Financial. Built for Architectural Precision.</span>
        <div className={styles.footerLinks}>
          <a href="#" className={styles.footerLink}>Privacy Policy</a>
          <a href="#" className={styles.footerLink}>Terms of Service</a>
          <a href="#" className={styles.footerLink}>Cookie Settings</a>
        </div>
      </footer>
    </div>
  )
}
