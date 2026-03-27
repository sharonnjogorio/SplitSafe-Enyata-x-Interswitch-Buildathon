import { useState, useEffect } from 'react'
import { useAuth } from '../hooks/index'
import { getAuthHeaders } from '../services/api'
import { formatNaira } from '../utils/formatters'
import AppLayout from '../layouts/AppLayout'
import styles from './ProfilePage.module.css'

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

function getInitials(name = '') {
  return name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()
}

const AVATAR_COLORS = ['#1D4ED8', '#7C3AED', '#059669', '#D97706', '#DC2626', '#0891B2']
function getAvatarColor(name = '') {
  return AVATAR_COLORS[name.charCodeAt(0) % AVATAR_COLORS.length]
}

export default function ProfilePage() {
  const { user } = useAuth()

  const [profile,  setProfile]  = useState(null)
  const [loading,  setLoading]  = useState(true)
  const [error,    setError]    = useState('')
  const [saving,   setSaving]   = useState(false)
  const [saved,    setSaved]    = useState(false)

  const [form, setForm] = useState({ name: '', phone: '' })

  useEffect(() => {
    fetch(`${BASE_URL}/auth/me`, { headers: getAuthHeaders() })
      .then(res => {
        if (!res.ok) throw new Error('Failed to load profile')
        return res.json()
      })
      .then(data => {
        const p = data.user || data
        setProfile(p)
        setForm({ name: p.name || '', phone: p.phone || '' })
      })
      .catch(err => setError(err.message))
      .finally(()  => setLoading(false))
  }, [])

  async function handleSave() {
    if (!form.name.trim()) return
    setSaving(true)
    setError('')
    setSaved(false)
    try {
      const res = await fetch(`${BASE_URL}/auth/update-profile`, {
        method:  'PUT',
        headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
        body:    JSON.stringify({ name: form.name.trim(), phone: form.phone.trim() }),
      })
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.message || 'Failed to update profile')
      }
      const data = await res.json()
      const updated = data.user || data
      setProfile(updated)
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    } catch (err) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <AppLayout><p style={{ padding: '2rem', color: 'var(--color-text-secondary)' }}>Loading profile…</p></AppLayout>

  const displayName = form.name || profile?.name || 'User'

  return (
    <AppLayout>
      <h1 className={styles.pageTitle}>Profile</h1>

      <div className={styles.layout}>

        {/* ── Avatar card ── */}
        <div className={styles.avatarCard}>
          <div
            className={styles.avatarCircle}
            style={{ background: getAvatarColor(displayName) }}
          >
            {getInitials(displayName)}
          </div>
          <p className={styles.avatarName}>{displayName}</p>
          <p className={styles.avatarEmail}>{profile?.email}</p>
        </div>

        {/* ── Edit form ── */}
        <div className={styles.formCard}>
          <div className={styles.cardHeader}>
            <h2 className={styles.cardTitle}>Account Details</h2>
          </div>

          <div className={styles.fieldGroup}>
            <label className={styles.fieldLabel}>Full name</label>
            <input
              className={styles.fieldInput}
              value={form.name}
              onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
              placeholder="Your full name"
            />
          </div>

          <div className={styles.fieldGroup}>
            <label className={styles.fieldLabel}>Email address</label>
            <input
              className={`${styles.fieldInput} ${styles.fieldInputReadonly}`}
              value={profile?.email || ''}
              disabled
            />
            <p className={styles.fieldHint}>Email cannot be changed.</p>
          </div>

          <div className={styles.fieldGroup}>
            <label className={styles.fieldLabel}>Phone number</label>
            <input
              className={styles.fieldInput}
              value={form.phone}
              onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
              placeholder="e.g. 08012345678"
              type="tel"
            />
          </div>

          {error && <div className={styles.alertBox} data-variant="error">{error}</div>}
          {saved && <div className={styles.alertBox} data-variant="success">Profile updated successfully.</div>}

          <button
            className={styles.saveBtn}
            onClick={handleSave}
            disabled={saving}
          >
            {saving ? 'Saving…' : 'Save Changes'}
          </button>
        </div>

      </div>
    </AppLayout>
  )
}
