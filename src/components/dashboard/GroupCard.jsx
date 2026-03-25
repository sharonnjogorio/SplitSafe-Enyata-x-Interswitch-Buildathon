import { Link } from 'react-router-dom'
import { formatRelativeTime } from '../../utils/formatters'
import styles from './GroupCard.module.css'

// ── Deterministic colour per group name ──────────────────────
const ICON_THEMES = ['blue', 'purple', 'green', 'amber']

function getTheme(name = '') {
  return ICON_THEMES[name.charCodeAt(0) % ICON_THEMES.length]
}

// ── Deterministic avatar bg colour per member name ──────────
const AVATAR_COLORS = [
  '#1D4ED8', '#7C3AED', '#059669',
  '#D97706', '#DC2626', '#0891B2',
]

function getAvatarColor(name = '') {
  return AVATAR_COLORS[name.charCodeAt(0) % AVATAR_COLORS.length]
}

function getInitials(name = '') {
  return name.split(' ').map((w) => w[0]).join('').slice(0, 2).toUpperCase()
}

// ── SVG icons — one per theme ────────────────────────────────
function GroupIcon({ theme }) {
  const icons = {
    blue: (   // beach umbrella / travel
      <svg className={`${styles.icon} ${styles[theme]}`} viewBox="0 0 24 24"
        fill="none" stroke="currentColor" strokeWidth="2"
        strokeLinecap="round" strokeLinejoin="round">
        <path d="M17.5 12c0 4.4-5.5 8-5.5 8s-5.5-3.6-5.5-8a5.5 5.5 0 0 1 11 0z"/>
        <circle cx="12" cy="12" r="1.5" fill="currentColor" stroke="none"/>
        <line x1="12" y1="2" x2="12" y2="6.5"/>
      </svg>
    ),
    purple: ( // building / apartment
      <svg className={`${styles.icon} ${styles[theme]}`} viewBox="0 0 24 24"
        fill="none" stroke="currentColor" strokeWidth="2"
        strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="7" height="18"/><rect x="14" y="9" width="7" height="12"/>
        <line x1="3" y1="21" x2="21" y2="21"/>
        <line x1="6" y1="8" x2="7" y2="8"/><line x1="6" y1="12" x2="7" y2="12"/>
        <line x1="6" y1="16" x2="7" y2="16"/>
        <line x1="17" y1="13" x2="18" y2="13"/><line x1="17" y1="17" x2="18" y2="17"/>
      </svg>
    ),
    green: (  // fork & knife / food
      <svg className={`${styles.icon} ${styles[theme]}`} viewBox="0 0 24 24"
        fill="none" stroke="currentColor" strokeWidth="2"
        strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2"/>
        <line x1="7" y1="2" x2="7" y2="11"/>
        <path d="M21 15V2a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3zm0 0v7"/>
      </svg>
    ),
    amber: (  // calendar / events
      <svg className={`${styles.icon} ${styles[theme]}`} viewBox="0 0 24 24"
        fill="none" stroke="currentColor" strokeWidth="2"
        strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="4" width="18" height="18" rx="2"/>
        <line x1="16" y1="2" x2="16" y2="6"/>
        <line x1="8" y1="2" x2="8" y2="6"/>
        <line x1="3" y1="10" x2="21" y2="10"/>
      </svg>
    ),
  }
  return icons[theme] || icons.blue
}

// ── Main component ────────────────────────────────────────────
export default function GroupCard({ group, userId }) {
  const theme = getTheme(group.name)

  // Count how many expenses are unsettled and involve this user
  const pendingCount = group.expenses?.filter(
    (e) => !e.settled && e.splitBetween?.includes(userId)
  ).length || 0

  const isSettled   = pendingCount === 0
  const maxAvatars  = 3
  const visible     = group.members.slice(0, maxAvatars)
  const overflow    = group.members.length - maxAvatars

  return (
    <Link to={`/groups/${group.id}`} className={styles.card}>

      {/* Top row */}
      <div className={styles.top}>
        <div className={`${styles.iconWrap} ${styles[theme]}`}>
          <GroupIcon theme={theme} />
        </div>

        {isSettled ? (
          <span className={`${styles.badge} ${styles.settled}`}>Settled</span>
        ) : (
          <span className={`${styles.badge} ${styles.pending}`}>
            {pendingCount} Pending
          </span>
        )}
      </div>

      {/* Name + meta */}
      <div className={styles.name}>{group.name}</div>
      <div className={styles.meta}>
        {group.description || `Last active ${formatRelativeTime(group.updatedAt || group.createdAt)}`}
      </div>

      {/* Avatar stack */}
      <div className={styles.avatarStack}>
        {visible.map((member) => (
          <div
            key={member.id}
            className={styles.avatar}
            style={{ background: getAvatarColor(member.name) }}
            title={member.name}
          >
            {member.avatar
              ? <img src={member.avatar} alt={member.name} />
              : getInitials(member.name)
            }
          </div>
        ))}
        {overflow > 0 && (
          <div className={styles.overflowChip}>+{overflow}</div>
        )}
      </div>

    </Link>
  )
}
