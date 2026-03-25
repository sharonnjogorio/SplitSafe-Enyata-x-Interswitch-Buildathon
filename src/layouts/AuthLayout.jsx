import styles from './AuthLayout.module.css'

export default function AuthLayout({ children, heroTitle, heroDesc }) {
  return (
    <div className={styles.wrapper}>

      <div className={styles.formSide}>
        {children}
      </div>

      <div className={styles.heroSide}>
        <img
          src="/assets/images/auth-bg.jpg"
          alt=""
          className={styles.heroBg}
          aria-hidden="true"
        />
        <div className={styles.heroContent}>
          <div className={styles.heroAccent} />
          <h2 className={styles.heroTitle}>
            {heroTitle || 'Precision in Sharing'}
          </h2>
          <p className={styles.heroDesc}>
            {heroDesc || 'SplitSafe uses advanced algorithms to ensure every settlement is mathematically perfect and socially frictionless.'}
          </p>
        </div>
        <div className={styles.statusPill}>
          <span className={styles.statusDot} />
          System Status: Optimal
        </div>
      </div>

    </div>
  )
}
