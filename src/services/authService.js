// services/authService.js
// All authentication API calls go here.
// Swap the mock implementations for real fetch calls
// once your backend endpoints are ready.

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

export const authService = {
  /**
   * Log in with email and password.
   * Returns a user object with { id, name, email, token }.
   */
  login: async (email, password) => {
    // ── MOCK (remove when backend is ready) ──────────
    if (import.meta.env.VITE_USE_MOCK === 'true') {
      await delay(600)
      return {
        id:    'u1',
        name:  email.split('@')[0],
        email,
        token: 'mock-token-123',
      }
    }
    // ── REAL ─────────────────────────────────────────
    const res = await fetch(`${BASE_URL}/auth/login`, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ email, password }),
    })
    if (!res.ok) throw new Error((await res.json()).message || 'Login failed')
    return res.json()
  },

  /**
   * Create a new account.
   * Returns a user object with { id, name, email, token }.
   */
  signup: async (fullName, email, password) => {
    // ── MOCK ─────────────────────────────────────────
    if (import.meta.env.VITE_USE_MOCK === 'true') {
      await delay(800)
      return {
        id:    'u' + Date.now(),
        name:  fullName,
        email,
        token: 'mock-token-new',
      }
    }
    // ── REAL ─────────────────────────────────────────
    const res = await fetch(`${BASE_URL}/auth/signup`, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ fullName, email, password }),
    })
    if (!res.ok) throw new Error((await res.json()).message || 'Signup failed')
    return res.json()
  },
}

// Helper
const delay = (ms) => new Promise((r) => setTimeout(r, ms))
