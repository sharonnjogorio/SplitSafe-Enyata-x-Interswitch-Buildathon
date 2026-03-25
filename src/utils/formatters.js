// utils/formatters.js

/**
 * Format a number as Nigerian Naira.
 * e.g. 45000 → "₦45,000"
 */
export function formatNaira(amount) {
  const abs = Math.abs(Number(amount) || 0)
  return '₦' + abs.toLocaleString('en-NG', { minimumFractionDigits: 0 })
}

/**
 * Format an ISO date string into a readable label.
 * e.g. "2024-08-14T18:00:00Z" → "Aug 14, 2024"
 */
export function formatDate(isoString) {
  if (!isoString) return ''
  return new Date(isoString).toLocaleDateString('en-NG', {
    day:   'numeric',
    month: 'short',
    year:  'numeric',
  })
}

/**
 * Returns a relative time string for sidebar/card meta text.
 * e.g. "2 hours ago", "Yesterday", "Aug 10"
 */
export function formatRelativeTime(isoString) {
  if (!isoString) return ''
  const diff = Date.now() - new Date(isoString).getTime()
  const mins  = Math.floor(diff / 60000)
  const hours = Math.floor(diff / 3600000)
  const days  = Math.floor(diff / 86400000)

  if (mins  <  1) return 'Just now'
  if (mins  < 60) return `${mins} min ago`
  if (hours < 24) return `${hours} hour${hours > 1 ? 's' : ''} ago`
  if (days  === 1) return 'Yesterday'
  if (days  <  7) return `${days} days ago`
  return formatDate(isoString)
}

/**
 * Truncate a member list to a readable string.
 * e.g. ["Ada","Bola","Chidi","Dami"] → "Ada, Bola +2 more"
 */
export function formatMemberList(members = [], max = 2) {
  const shown = members.slice(0, max).map((m) => m.name).join(', ')
  const rest  = members.length - max
  return rest > 0 ? `${shown} +${rest} more` : shown
}
