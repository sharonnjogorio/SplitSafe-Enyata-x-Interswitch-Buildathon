import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../hooks/index'
import styles from './LoginPage.module.css'

export default function LoginPage() {
  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading]   = useState(false)
  const [error, setError]       = useState('')

  const { login } = useAuth()
  const navigate  = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await login(email, password)
      navigate('/')
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
        <a href="#" className={styles.helpLink}>Help Center</a>
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
              <input
                type="password"
                className={styles.input}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="current-password"
              />
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

          <div className={styles.dividerOr}>Or continue with</div>

          <div className={styles.socialList}>
            <button type="button" className={styles.socialBtn}>
              {/* Google icon */}
              <svg className={styles.socialIcon} viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              Continue with Google
            </button>

            <button type="button" className={styles.socialBtn}>
              {/* Apple icon */}
              <svg className={styles.socialIcon} viewBox="0 0 24 24" fill="currentColor">
                <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.7 9.05 7.4c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.39-1.32 2.76-2.53 3.99zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"/>
              </svg>
              Continue with Apple
            </button>
          </div>
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
