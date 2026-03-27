// services/dashboardService.js
import { getAuthHeaders } from './api'

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

// GET /dashboard → { netBalance, totalOwedToYou, totalYouOwe, recentGroups[], recentTransactions[] }
export const getDashboard = async () => {
  const res = await fetch(`${BASE_URL}/dashboard`, { headers: getAuthHeaders() })
  if (!res.ok) throw new Error('Failed to load dashboard')
  return res.json()
}
