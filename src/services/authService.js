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
    const res = await fetch(`${BASE_URL}/auth/login`, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ email, password }),
    })
    if (!res.ok) {
      let msg
      try { msg = (await res.json()).message } catch { /* non-JSON body */ }
      throw new Error(msg || 'Login failed')
    }
    // Response shape: { message, token, user: { id, name, email } }
    const data = await res.json()
    return { ...data.user, token: data.token }
  },

  /**
   * Create a new account then auto-login to obtain a token.
   * Returns a user object with { id, name, email, token }.
   */
  signup: async (fullName, email, password) => {
    // Step 1 — register (endpoint uses "name", not "fullName")
    const regRes = await fetch(`${BASE_URL}/auth/register`, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ name: fullName, email, password }),
    })
    if (!regRes.ok) {
      let msg
      try { msg = (await regRes.json()).message } catch { /* non-JSON body */ }
      throw new Error(msg || 'Signup failed')
    }

    // Step 2 — auto-login to get token (register returns no token)
    const loginRes = await fetch(`${BASE_URL}/auth/login`, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ email, password }),
    })
    if (!loginRes.ok) {
      let msg
      try { msg = (await loginRes.json()).message } catch { /* non-JSON body */ }
      throw new Error(msg || 'Login after signup failed')
    }
    const data = await loginRes.json()
    return { ...data.user, token: data.token }
  },
}

