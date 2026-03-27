import { createContext, useContext, useState, useEffect } from 'react'
import { groupService } from '../services/groupService'
import { AuthContext_ } from './AuthContext'

const AppContext = createContext(null)

export const AppContext_ = AppContext

export function AppProvider({ children }) {
  const { user } = useContext(AuthContext_)
  const [groups, setGroups]   = useState([])
  const [loading, setLoading] = useState(false)

  // Re-fetch groups (+ their expenses) whenever the logged-in user changes
  useEffect(() => {
    if (!user) {
      setGroups([])
      return
    }
    setLoading(true)
    groupService.getGroups()
      .then(async (baseGroups) => {
        // Load expenses for every group concurrently
        const full = await Promise.all(
          baseGroups.map(async (g) => {
            const expenses = await groupService.getExpenses(g.id).catch(() => [])
            return { ...g, expenses, settlements: [] }
          })
        )
        setGroups(full)
      })
      .catch(() => setGroups([]))
      .finally(() => setLoading(false))
  }, [user])

  const getGroup = (id) => groups.find((g) => g.id === id)

  // Reload a single group's data from the API and update state
  const refreshGroup = async (groupId) => {
    try {
      const [group, expenses] = await Promise.all([
        groupService.getGroup(groupId),
        groupService.getExpenses(groupId),
      ])
      setGroups((prev) =>
        prev.map((g) => g.id === groupId ? { ...group, expenses, settlements: [] } : g)
      )
    } catch { /* silent */ }
  }

  // Backend auto-adds the creator — ignore the members param from the UI
  const createGroup = async (name) => {
    try {
      const newGroup = await groupService.createGroup(name)
      setGroups((prev) => [...prev, { ...newGroup, expenses: [], settlements: [] }])
      return newGroup.id
    } catch {
      // Fallback: local-only group if backend unavailable
      const newGroup = {
        id:          'g' + Date.now(),
        name,
        members:     [],
        expenses:    [],
        settlements: [],
        createdAt:   new Date().toISOString(),
        updatedAt:   new Date().toISOString(),
      }
      setGroups((prev) => [...prev, newGroup])
      return newGroup.id
    }
  }

  const addExpense = async (groupId, expense) => {
    try {
      const newExpense = await groupService.addExpense(groupId, expense)
      setGroups((prev) =>
        prev.map((g) =>
          g.id === groupId
            ? { ...g, expenses: [...(g.expenses || []), newExpense], updatedAt: new Date().toISOString() }
            : g
        )
      )
    } catch {
      // Fallback: local-only expense
      const newExpense = { ...expense, id: 'e' + Date.now() }
      setGroups((prev) =>
        prev.map((g) =>
          g.id === groupId
            ? { ...g, expenses: [...(g.expenses || []), newExpense], updatedAt: new Date().toISOString() }
            : g
        )
      )
    }
  }

  const markPaid = (groupId, from, to, amount) => {
    const settlement = { from, to, amount, paidAt: new Date().toISOString() }
    setGroups((prev) =>
      prev.map((g) =>
        g.id === groupId
          ? { ...g, settlements: [...(g.settlements || []), settlement] }
          : g
      )
    )
  }

  return (
    <AppContext.Provider value={{ groups, loading, getGroup, refreshGroup, createGroup, addExpense, markPaid }}>
      {children}
    </AppContext.Provider>
  )
}

export function useApp() {
  const ctx = useContext(AppContext_)
  if (!ctx) throw new Error('useApp must be used inside <AppProvider>')
  return ctx
}
