import { useContext } from 'react'
import { AuthContext_ } from '../context/AuthContext'
import { AppContext_ }  from '../context/AppContext'

export function useAuth() {
  const ctx = useContext(AuthContext_)
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>')
  return ctx
}

export function useApp() {
  const ctx = useContext(AppContext_)
  if (!ctx) throw new Error('useApp must be used inside <AppProvider>')
  return ctx
}
