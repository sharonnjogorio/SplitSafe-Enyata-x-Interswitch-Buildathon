import { createContext, useContext, useState } from 'react'
import { groupService } from '../services/groupService'

const AppContext = createContext(null)

// ── Mock data so you can build UI before the backend is ready ──
const MOCK_GROUPS = [
  {
    id: 'g1',
    name: 'Summer Road Trip',
    description: 'A curated archive of the August 2024 coastal expedition.',
    members: [
      { id: 'u1', name: 'You'         },
      { id: 'u2', name: 'Folu Adeyemi' },
      { id: 'u3', name: 'Amara Okafor' },
      { id: 'u4', name: 'Bola Tinubu'  },
    ],
    expenses: [
      {
        id: 'e1', description: 'Seaside Dinner', amount: 45000,
        paidBy: 'u2', splitBetween: ['u1','u2','u3','u4'],
        splitType: 'equal', createdAt: '2024-08-14T18:00:00Z',
      },
      {
        id: 'e2', description: 'Fuel Refill - Lagos Toll', amount: 28500,
        paidBy: 'u3', splitBetween: ['u1','u2','u3','u4'],
        splitType: 'equal', createdAt: '2024-08-14T12:00:00Z',
      },
      {
        id: 'e3', description: 'Beachfront Villa Deposit', amount: 210000,
        paidBy: 'u1', splitBetween: ['u1','u2','u3','u4'],
        splitType: 'equal', createdAt: '2024-08-13T10:00:00Z',
      },
    ],
    settlements: [],
    createdAt: '2024-08-10T00:00:00Z',
    updatedAt: '2024-08-14T18:00:00Z',
  },
  {
    id: 'g2',
    name: 'Apartment 4B',
    description: 'Rent & Utilities (Monthly)',
    members: [
      { id: 'u1', name: 'You'   },
      { id: 'u5', name: 'Chidi' },
    ],
    expenses: [
      {
        id: 'e4', description: 'Electricity Bill', amount: 18000,
        paidBy: 'u1', splitBetween: ['u1','u5'],
        splitType: 'equal', createdAt: '2024-10-12T09:00:00Z',
      },
    ],
    settlements: [],
    createdAt: '2024-09-01T00:00:00Z',
    updatedAt: '2024-10-12T09:00:00Z',
  },
]

export function AppProvider({ children }) {
  const [groups, setGroups]   = useState(MOCK_GROUPS)
  const [loading, setLoading] = useState(false)

  const getGroup = (id) => groups.find((g) => g.id === id)

  const createGroup = async (name, members) => {
    const newGroup = {
      id:          'g' + Date.now(),
      name,
      members,
      expenses:    [],
      settlements: [],
      createdAt:   new Date().toISOString(),
      updatedAt:   new Date().toISOString(),
    }
    // TODO: replace with real API call
    // const newGroup = await groupService.createGroup(name, members)
    setGroups((prev) => [...prev, newGroup])
    return newGroup.id
  }

  const addExpense = async (groupId, expense) => {
    const newExpense = { ...expense, id: 'e' + Date.now() }
    // TODO: replace with real API call
    // await groupService.addExpense(groupId, expense)
    setGroups((prev) =>
      prev.map((g) =>
        g.id === groupId
          ? { ...g, expenses: [...g.expenses, newExpense], updatedAt: new Date().toISOString() }
          : g
      )
    )
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
    <AppContext.Provider value={{ groups, loading, getGroup, createGroup, addExpense, markPaid }}>
      {children}
    </AppContext.Provider>
  )
}

export function useApp() {
  const ctx = useContext(AppContext_)
  if (!ctx) throw new Error('useApp must be used inside <AppProvider>')
  return ctx
}

export const AppContext_ = AppContext
