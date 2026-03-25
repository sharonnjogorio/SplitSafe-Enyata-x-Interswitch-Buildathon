import { createContext, useContext, useState } from 'react'
import { authService } from '../services/authService'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  // Initialise from localStorage so the user stays logged in on refresh
  const [user, setUser] = useState(() => {
    try {
      const stored = localStorage.getItem('splitsafe_user')
      return stored ? JSON.parse(stored) : null
    } catch {
      return null
    }
  })

  const login = async (email, password) => {
    const userData = await authService.login(email, password)
    setUser(userData)
    localStorage.setItem('splitsafe_user', JSON.stringify(userData))
    return userData
  }

  const signup = async (fullName, email, password) => {
    const userData = await authService.signup(fullName, email, password)
    setUser(userData)
    localStorage.setItem('splitsafe_user', JSON.stringify(userData))
    return userData
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem('splitsafe_user')
  }

  return (
    <AuthContext.Provider value={{ user, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext_)
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>')
  return ctx
}

export const AuthContext_ = AuthContext
