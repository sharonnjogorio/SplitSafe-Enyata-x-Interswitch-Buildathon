// services/settlementService.js
import { getAuthHeaders } from './api'

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

async function handleError(res, fallback) {
  let msg
  try { msg = (await res.json()).message } catch { /* non-JSON */ }
  throw new Error(msg || fallback)
}

export const settlementService = {
  // GET /settlement/group/:groupId
  // Returns the optimised settlement plan (not persisted yet)
  getSettlement: async (groupId) => {
    const res = await fetch(`${BASE_URL}/settlement/group/${groupId}`, {
      headers: getAuthHeaders(),
    })
    if (!res.ok) await handleError(res, 'Failed to load settlement')
    return res.json()
  },

  // POST /settlement/confirm
  // Persists the settlement transactions to the DB → returns _id per transaction
  confirmSettlement: async (groupId, transactions) => {
    const res = await fetch(`${BASE_URL}/settlement/confirm`, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
      body:    JSON.stringify({ groupId, transactions }),
    })
    if (!res.ok) await handleError(res, 'Failed to confirm settlement')
    return res.json() // { message, transactions: [{ _id, from, to, amount, status }] }
  },

  // POST /settlement/remind/:id
  remindDebtor: async (transactionId) => {
    const res = await fetch(`${BASE_URL}/settlement/remind/${transactionId}`, {
      method:  'POST',
      headers: getAuthHeaders(),
    })
    if (!res.ok) await handleError(res, 'Failed to send reminder')
    return res.json()
  },
}
