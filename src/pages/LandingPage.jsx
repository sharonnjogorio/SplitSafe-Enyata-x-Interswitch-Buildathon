import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import styles from './LandingPage.module.css'

const AVATAR_COLORS = ['#1D4ED8', '#7C3AED', '#059669', '#D97706', '#DC2626']

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
      <div className={styles.navLinks}>
        <a href="#" className={styles.navLink}>Features</a>
        <a href="#" className={styles.navLink}>Security</a>
        <a href="#" className={styles.navLink}>Pricing</a>
      </div>
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
          <div className={styles.socialProof}>
            <div className={styles.avatarStack}>
              {AVATAR_COLORS.slice(0, 4).map((c, i) => (
                <div key={i} className={styles.proofAvatar}
                  style={{ background: c }}>{['A','B','C','D'][i]}</div>
              ))}
              <div className={styles.overflowChip}>+k</div>
            </div>
            <span className={styles.socialProofText}>Join 10k+ Trusted members.</span>
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
                <div className={styles.metricLabel}>Treasury Protocol</div>
                <div className={styles.metricTitle}>Automated Re-balancing</div>
              </div>
              <div className={styles.metricValue}>
                <div className={styles.metricNum}>$8,420</div>
                <div className={styles.metricSub}>Portfolio Value</div>
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
              <span className={styles.networkPrecision}>98.4% Precision</span>
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
function SlideTwo({ onNext, current }) {
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

          <Dots current={1} total={3} onChange={() => {}} />
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
                <div className={styles.verifiedTitle}>Precision Verified</div>
                <div className={styles.verifiedSub}>99.9% Efficiency Gained</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// ── Slide 3: Social Savings ───────────────────────────────────
function SlideThree({ onGetStarted }) {
  // SVG circle ring math
  const radius = 54
  const circumference = 2 * Math.PI * radius
  const pct = 85
  const offset = circumference - (pct / 100) * circumference

  return (
    <div className={`${styles.slide} ${styles.active}`}>
      <div className={styles.slideBody}>

        {/* Left */}
        <div className={styles.hero}>
          <span className={styles.badge}>Step 03 / Social Savings</span>
          <h1 className={styles.heroTitle}>
            Community-Driven{' '}
            <span className={styles.heroTitleAccent}>Wealth.</span>
          </h1>
          <p className={styles.heroDesc}>
            Grow your wealth together through social savings pools (Ajo). Track
            contributions, manage payout timelines, and automate your financial growth.
          </p>

          <div className={styles.btnRow}>
            <button className={styles.nextBtn} onClick={onGetStarted}>
              Get Started →
            </button>
            <button className={styles.demoBtn}>View Demo</button>
          </div>

          <div className={styles.socialProof}>
            <div className={styles.avatarStack}>
              {AVATAR_COLORS.slice(0, 3).map((c, i) => (
                <div key={i} className={styles.proofAvatar} style={{ background: c }}>
                  {['A','B','C'][i]}
                </div>
              ))}
              <div className={styles.overflowChip}>+12k</div>
            </div>
            <span className={styles.socialProofText}>JOIN 12,000+ ACTIVE POOLS</span>
          </div>

          <Dots current={2} total={3} onChange={() => {}} />
        </div>

        {/* Right */}
        <div className={styles.visual}>
          <div className={styles.circleCard}>

            <div className={styles.circleCardTop}>
              <div>
                <div className={styles.circleCardTitle}>Vacation Fund</div>
                <div className={styles.circleCardGoal}>Collective Goal: $12,500.00</div>
              </div>
              <div className={styles.automationChip}>
                <div className={styles.automationChipIcon}>
                  <svg className={styles.automationChipIconSvg} viewBox="0 0 24 24"
                    fill="none" stroke="currentColor" strokeWidth="2">
                    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
                  </svg>
                </div>
                <div>
                  <div className={styles.automationLabel}>Automation</div>
                  <div className={styles.automationValue}>Payout Scheduled</div>
                </div>
              </div>
            </div>

            {/* Progress ring */}
            <div className={styles.progressRingWrap}>
              <svg className={styles.progressRing} width="140" height="140" viewBox="0 0 140 140">
                <circle className={styles.ringBg}   cx="70" cy="70" r={radius}/>
                <circle className={styles.ringFill} cx="70" cy="70" r={radius}
                  strokeDasharray={circumference}
                  strokeDashoffset={offset}
                />
              </svg>
              <div className={styles.ringLabel}>
                <span className={styles.ringPct}>{pct}%</span>
                <span className={styles.ringText}>Complete</span>
              </div>
            </div>

            {/* Members */}
            <div className={styles.memberRow}>
              <div className={styles.memberAvatar} style={{ background: '#DBEAFE' }}>
                <span style={{ color: '#1D4ED8', fontWeight: 700 }}>SJ</span>
              </div>
              <div className={styles.memberInfo}>
                <div className={styles.memberName}>Sarah Jenkins</div>
                <div className={styles.memberContrib}>Contribution: $2,400</div>
              </div>
              <span className={styles.paidBadge}>Paid</span>
            </div>

            <div className={styles.memberRow}>
              <div className={styles.memberAvatar} style={{ background: '#F3F4F6' }}>
                <span style={{ color: '#374151', fontWeight: 700 }}>MC</span>
              </div>
              <div className={styles.memberInfo}>
                <div className={styles.memberName}>Marcus Chen</div>
                <div className={styles.memberContrib}>Contribution: $2,400</div>
              </div>
              <span className={styles.upNextBadge}>Up Next</span>
            </div>

          </div>

          {/* Ajo cycle chip */}
          <div style={{ position: 'relative', marginTop: 8 }}>
            <div className={styles.ajoCycleCard}>
              <div className={styles.ajoCycleLabel}>Ajo Cycle</div>
              <div className={styles.ajoCycleValue}>
                <span className={styles.ajoDot}/>
                12 of 14 Months
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

  const next = () => setSlide((s) => Math.min(s + 1, 2))

  return (
    <div className={styles.page}>
      <Navbar />

      <div className={styles.slideWrap}>
        {slide === 0 && <SlideOne  onNext={next} />}
        {slide === 1 && <SlideTwo  onNext={next} current={slide} />}
        {slide === 2 && <SlideThree onGetStarted={() => navigate('/signup')} />}
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
