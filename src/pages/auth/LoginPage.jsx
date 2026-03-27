import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../hooks/index'
import styles from './LoginPage.module.css'

export default function LoginPage() {
  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading]   = useState(false)
  const [error, setError]       = useState('')
  const [showPassword, setShowPassword] = useState(false)

  const { login } = useAuth()
  const navigate  = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await login(email, password)
      navigate('/dashboard')
    } catch (err) {
      setError('Invalid email or password. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className={styles.page}>

      {/* Top bar */}
      <header className={styles.topbar}>
        <Link to="/" className={styles.logo}>
          {/* Shield icon */}
          <svg className={styles.logoIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
          </svg>
          SplitSafe
        </Link>
      </header>

      {/* Centered content */}
      <main className={styles.main}>

        {/* Heading with yellow accent bar */}
        <div className={styles.headingBlock}>
          <div className={styles.accentBar} />
          <div className={styles.headingText}>
            <h1 className={styles.title}>Welcome<br />Back.</h1>
            <p className={styles.subtitle}>
              Access your smart settlements and architectural insights.
            </p>
          </div>
        </div>

        {/* Form card */}
        <div className={styles.card}>
          <form onSubmit={handleSubmit}>

            <div className={styles.formGroup}>
              <label className={styles.label}>Email Address</label>
              <input
                type="email"
                className={styles.input}
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
              />
            </div>

            <div className={styles.formGroup}>
              <div className={styles.labelRow}>
                <label className={styles.label}>Password</label>
                <button type="button" className={styles.forgotLink}>
                  Forgot password?
                </button>
              </div>
              <div className={styles.passwordWrapper}>
                <input
                  type={showPassword ? 'text' : 'password'}
                  className={styles.input}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  className={styles.eyeBtn}
                  onClick={() => setShowPassword(v => !v)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? (
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="16" height="16">
                      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/>
                      <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/>
                      <line x1="1" y1="1" x2="23" y2="23"/>
                    </svg>
                  ) : (
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="16" height="16">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                      <circle cx="12" cy="12" r="3"/>
                    </svg>
                  )}
                </button>
              </div>
            </div>

            {error && <p className={styles.errorMsg}>{error}</p>}

            <button
              type="submit"
              className={styles.loginBtn}
              disabled={loading || !email || !password}
            >
              {loading ? 'Logging in…' : 'Login'}
            </button>

          </form>

        </div>

        <p className={styles.switchText}>
          Don't have an account?{' '}
          <Link to="/signup" style={{ color: 'var(--color-primary)', fontWeight: 700 }}>
            Sign Up
          </Link>
        </p>

      </main>

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
