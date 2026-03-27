// services/paymentService.js
import { getAuthHeaders } from './api'

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

export const paymentService = {
  // GET /payments/history → { count, transactions[] }
  getHistory: async () => {
    const res = await fetch(`${BASE_URL}/payments/history`, {
      headers: getAuthHeaders(),
    })
    if (!res.ok) throw new Error('Failed to load payment history')
    return res.json()
  },

  // GET /payments/verify/:txnRef
  verifyPayment: async (txnRef) => {
    const res = await fetch(`${BASE_URL}/payments/verify/${txnRef}`, {
      headers: getAuthHeaders(),
    })
    if (!res.ok) throw new Error('Payment verification failed')
    return res.json()
  },

  // POST /payments/initiate → { transactionId, ... }
  initPayment: async (payload) => {
    const res = await fetch(`${BASE_URL}/payments/initiate`, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
      body:    JSON.stringify(payload),
    })
    if (!res.ok) throw new Error('Failed to initiate payment')
    return res.json()
  },
}

export const verifyPayment = paymentService.verifyPayment
export const initPayment   = paymentService.initPayment
