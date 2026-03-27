// services/groupService.js
import { getAuthHeaders } from './api'

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

function normalizeGroup(g) {
  return {
    ...g,
    id: g._id || g.id,
    members: (g.members || []).map((m) => ({
      ...m,
      id: m._id || m.id,
    })),
    expenses:    [],
    settlements: [],
  }
}

function normalizeExpense(e) {
  // paidBy comes back as a populated object { _id, name, email }
  const paidBy =
    e.paidBy && typeof e.paidBy === 'object'
      ? e.paidBy._id || e.paidBy.id
      : e.paidBy

  // participants comes back as [{ user: { _id, name, email }, share }]
  // we extract just the user ID from each participant
  const splitBetween = (e.participants || e.splitBetween || []).map((p) => {
    if (!p) return p
    // backend shape: { user: { _id, name, email }, share }
    if (p.user) return p.user._id || p.user.id || p.user
    // fallback: flat user object or plain string
    return p._id || p.id || p
  })

  return {
    ...e,
    id: e._id || e.id,
    paidBy,
    splitBetween,
    splitType: e.splitType || 'equal',
  }
}

async function handleError(res, fallback) {
  let msg
  try { msg = (await res.json()).message } catch { /* non-JSON body */ }
  throw new Error(msg || fallback)
}

export const groupService = {
  // GET /groups → { count, groups[] }
  getGroups: async () => {
    const res = await fetch(`${BASE_URL}/groups`, { headers: getAuthHeaders() })
    if (!res.ok) await handleError(res, 'Failed to load groups')
    const data = await res.json()
    return (data.groups || []).map(normalizeGroup)
  },

  // GET /groups/:id → { group, isAdmin }
  getGroup: async (groupId) => {
    const res = await fetch(`${BASE_URL}/groups/${groupId}`, { headers: getAuthHeaders() })
    if (!res.ok) await handleError(res, 'Failed to load group')
    const data = await res.json()
    return normalizeGroup(data.group)
  },

  // POST /groups → { message, group }
  createGroup: async (name) => {
    const res = await fetch(`${BASE_URL}/groups`, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
      body:    JSON.stringify({ name }),
    })
    if (!res.ok) await handleError(res, 'Failed to create group')
    const data = await res.json()
    return normalizeGroup(data.group)
  },

  // POST /groups/:id/members  { email }
  addMember: async (groupId, email) => {
    const res = await fetch(`${BASE_URL}/groups/${groupId}/members`, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
      body:    JSON.stringify({ email }),
    })
    if (!res.ok) await handleError(res, 'Failed to add member')
    return res.json()
  },

  // GET /expenses/group/:id → { count, expenses[] }
  getExpenses: async (groupId) => {
    const res = await fetch(`${BASE_URL}/expenses/group/${groupId}`, {
      headers: getAuthHeaders(),
    })
    if (!res.ok) await handleError(res, 'Failed to load expenses')
    const data = await res.json()
    return (data.expenses || []).map(normalizeExpense)
  },

  // POST /expenses → { message, expense }
  addExpense: async (groupId, expense) => {
    const res = await fetch(`${BASE_URL}/expenses`, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
      body:    JSON.stringify({
        groupId,
        description:  expense.description,
        amount:       expense.amount,
        paidBy:       expense.paidBy,
        participants: expense.splitBetween,
        splitType:    expense.splitType || 'equal',
      }),
    })
    if (!res.ok) await handleError(res, 'Failed to add expense')
    const data = await res.json()
    const raw = data.expense || data
    return normalizeExpense({ ...raw, createdAt: raw.createdAt || new Date().toISOString() })
  },

  // DELETE /expenses/:id
  deleteExpense: async (expenseId) => {
    const res = await fetch(`${BASE_URL}/expenses/${expenseId}`, {
      method:  'DELETE',
      headers: getAuthHeaders(),
    })
    if (!res.ok) await handleError(res, 'Failed to delete expense')
    return res.json()
  },

  // GET /settlement/group/:id
  getSettlements: async (groupId) => {
    const res = await fetch(`${BASE_URL}/settlement/group/${groupId}`, {
      headers: getAuthHeaders(),
    })
    if (!res.ok) await handleError(res, 'Failed to load settlements')
    return res.json()
  },

  // GET /balances/group/:id
  getBalances: async (groupId) => {
    const res = await fetch(`${BASE_URL}/balances/group/${groupId}`, {
      headers: getAuthHeaders(),
    })
    if (!res.ok) await handleError(res, 'Failed to load balances')
    return res.json()
  },
}
