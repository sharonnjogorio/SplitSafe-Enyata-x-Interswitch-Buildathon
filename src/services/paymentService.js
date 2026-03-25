// services/paymentService.js
// Interswitch Web Checkout integration.

import { getAuthHeaders } from './api'

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

export const paymentService = {
  /**
   * Initialise a payment with your backend.
   * Your backend calls Interswitch and returns a checkout URL.
   *
   * @param {object} params — { groupId, from, to, amount }
   * @returns {{ checkoutUrl: string }}
   */
  initPayment: async ({ groupId, from, to, amount }) => {
    const res = await fetch(`${BASE_URL}/payments/init`, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
      body:    JSON.stringify({ groupId, from, to, amount }),
    })
    if (!res.ok) throw new Error('Failed to initialise payment')
    return res.json()  // expected: { checkoutUrl: string }
  },

  /**
   * Verify a completed transaction by reference.
   * Called from PaymentCallbackPage after Interswitch redirects back.
   *
   * @param {string} txnRef — the reference from the Interswitch callback URL
   * @returns {{ status, amount, from, fromName, to, toName, groupId, reference }}
   */
  verifyPayment: async (txnRef) => {
    const res = await fetch(`${BASE_URL}/payments/verify/${txnRef}`, {
      headers: getAuthHeaders(),
    })
    if (!res.ok) throw new Error('Payment verification failed')
    return res.json()
  },
}

// Named exports used directly in pages
export const initPayment   = paymentService.initPayment
export const verifyPayment = paymentService.verifyPayment
