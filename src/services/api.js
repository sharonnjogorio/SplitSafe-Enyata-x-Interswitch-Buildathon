// services/api.js
// Shared helpers used by all service files.

/**
 * Returns the Authorization header using the token
 * stored in localStorage by AuthContext.
 */
export function getAuthHeaders() {
  try {
    const user  = JSON.parse(localStorage.getItem('splitsafe_user') || '{}')
    const token = user?.token
    return token ? { Authorization: `Bearer ${token}` } : {}
  } catch {
    return {}
  }
}
