import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../hooks/index'
import styles from './SignupPage.module.css'

export default function SignupPage() {
  const [form, setForm] = useState({
    fullName: '', email: '', password: '', confirmPassword: '',
  })
  const [agreed, setAgreed]   = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState('')

  const { signup } = useAuth()
  const navigate   = useNavigate()

  const update = (field) => (e) =>
    setForm((prev) => ({ ...prev, [field]: e.target.value }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    if (form.password !== form.confirmPassword) {
      setError('Passwords do not match.')
      return
    }
    if (!agreed) {
      setError('Please accept the Terms of Service to continue.')
      return
    }
    setLoading(true)
    try {
      await signup(form.fullName, form.email, form.password)
      navigate('/dashboard')
    } catch (err) {
      setError(err.message || 'Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className={styles.page}>

      {/* Marketing navbar */}
      <nav className={styles.navbar}>
        <Link to="/" className={styles.navLogo}>
          <svg className={styles.navLogoIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
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
          <Link to="/login" className={styles.loginLink}>Login</Link>
          <Link to="/signup" className={styles.signupBtn}>Sign Up</Link>
        </div>
      </nav>

      {/* Two column body */}
      <div className={styles.body}>

        {/* Left hero */}
        <div className={styles.hero}>
          <span className={styles.heroBadge}>Fintech Evolution</span>
          <h1 className={styles.heroTitle}>
            Architecting <span className={styles.heroTitleAccent}>Clarity</span><br />
            in Shared Expenses.
          </h1>
          <p className={styles.heroDesc}>
            Join SplitSafe to experience the most sophisticated way to manage group
            finances, smart settlements and architectural wealth tracking.
          </p>

          {/* Smart Visualizer preview widget */}
          <div className={styles.heroWidget}>
            <div className={styles.heroWidgetTop}>
              <div className={styles.heroWidgetIcon}>↗</div>
              <span className={styles.heroWidgetLabel}>Smart Visualizer</span>
            </div>
            <div className={styles.heroWidgetBar}>
              <div className={styles.heroWidgetBarFill} />
            </div>
            <div className={styles.heroWidgetMeta}>
              <span>Total Owed: $2,450</span>
              <span>66% Settled</span>
            </div>
          </div>
        </div>

        {/* Right form card */}
        <div className={styles.formCard}>
          <h2 className={styles.formTitle}>Create your account</h2>
          <p className={styles.formSubtitle}>Start your journey toward financial precision.</p>

          <form onSubmit={handleSubmit}>

            <div className={styles.formGroup}>
              <label className={styles.label}>Full Name</label>
              <div className={styles.inputWrapper}>
                <svg className={styles.inputIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/>
                </svg>
                <input
                  type="text"
                  className={styles.input}
                  placeholder="Enter your full name"
                  value={form.fullName}
                  onChange={update('fullName')}
                  required
                />
              </div>
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label}>Email Address</label>
              <div className={styles.inputWrapper}>
                <svg className={styles.inputIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="2" y="4" width="20" height="16" rx="2"/><path d="m2 7 10 7 10-7"/>
                </svg>
                <input
                  type="email"
                  className={styles.input}
                  placeholder="email@example.com"
                  value={form.email}
                  onChange={update('email')}
                  required
                />
              </div>
            </div>

            <div className={styles.formRow}>
              <div className={styles.formGroup}>
                <label className={styles.label}>Password</label>
                <div className={styles.inputWrapper}>
                  <svg className={styles.inputIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                  </svg>
                  <input
                    type="password"
                    className={styles.input}
                    placeholder="••••••••"
                    value={form.password}
                    onChange={update('password')}
                    required
                  />
                </div>
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label}>Confirm Password</label>
                <div className={styles.inputWrapper}>
                  <svg className={styles.inputIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                  </svg>
                  <input
                    type="password"
                    className={styles.input}
                    placeholder="••••••••"
                    value={form.confirmPassword}
                    onChange={update('confirmPassword')}
                    required
                  />
                </div>
              </div>
            </div>

            <label className={styles.termsRow}>
              <input
                type="checkbox"
                checked={agreed}
                onChange={(e) => setAgreed(e.target.checked)}
              />
              I agree to the{' '}
              <span style={{ color: 'var(--color-primary)' }}>Terms of Service</span> and{' '}
              <span style={{ color: 'var(--color-primary)' }}>Privacy Policy</span>.
            </label>

            {error && <p className={styles.errorText}>{error}</p>}

            <button
              type="submit"
              className={styles.createBtn}
              disabled={loading || !form.fullName || !form.email || !form.password}
            >
              {loading ? 'Creating account…' : 'Create Account'}
            </button>

          </form>

          <p className={styles.switchText}>
            Already have an account?{' '}
            <Link to="/login" style={{ color: 'var(--color-primary)', fontWeight: 700 }}>
              Login
            </Link>
          </p>
        </div>

      </div>

      {/* Footer */}
      <footer className={styles.footer}>
        <span>© 2024 SplitSafe Financial Technologies. All rights reserved.</span>
        <div className={styles.footerLinks}>
          <a href="#" className={styles.footerLink}>Security Audit</a>
          <a href="#" className={styles.footerLink}>Privacy Principles</a>
          <a href="#" className={styles.footerLink}>Contact Support</a>
        </div>
      </footer>

    </div>
  )
}
