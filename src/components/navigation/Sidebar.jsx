import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../../hooks/index'
import styles from './Sidebar.module.css'

function getInitials(name = '') {
  return name.split(' ').map((w) => w[0]).join('').slice(0, 2).toUpperCase()
}

/* ── SVG icon components ── */
const DashboardIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/>
    <rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/>
  </svg>
)

const GroupsIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="9" cy="7" r="4"/><path d="M3 21v-2a4 4 0 0 1 4-4h4a4 4 0 0 1 4 4v2"/>
    <circle cx="19" cy="9" r="2"/><path d="M23 21v-1a3 3 0 0 0-2-2.83"/>
  </svg>
)


const SettlementsIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="8" cy="18" r="3"/><circle cx="16" cy="6" r="3"/>
    <line x1="8" y1="15" x2="16" y2="9"/>
  </svg>
)


const LogoutIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
    <polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/>
  </svg>
)

const ShieldIcon = () => (
  <svg viewBox="0 0 24 24" fill="white" stroke="none">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
  </svg>
)

const NAV_ITEMS = [
  { label: 'Dashboard',   path: '/dashboard',   end: true,  Icon: DashboardIcon   },
  { label: 'Groups',      path: '/groups',      end: false, Icon: GroupsIcon      },
  { label: 'Settlements', path: '/settlements', end: false, Icon: SettlementsIcon },
]

export default function Sidebar() {
  const { user, logout } = useAuth()
  const navigate         = useNavigate()

  return (
    <aside className={styles.sidebar}>

      <div className={styles.brand}>
        <div className={styles.brandIcon}>
          <ShieldIcon />
        </div>
        <span className={styles.brandName}>SplitSafe</span>
      </div>

      <nav className={styles.nav}>
        {NAV_ITEMS.map(({ label, path, end, Icon }) => (
          <NavLink
            key={path}
            to={path}
            end={end}
            className={({ isActive }) =>
              `${styles.navItem} ${isActive ? styles.active : ''}`
            }
          >
            <span className={styles.navIcon}><Icon /></span>
            {label}
          </NavLink>
        ))}
      </nav>

      <div className={styles.bottom}>
        <div className={styles.userCard}>
          <div className={styles.userAvatar}>{getInitials(user?.name)}</div>
          <div className={styles.userInfo}>
            <span className={styles.userName}>{user?.name}</span>
            <span className={styles.userEmail}>{user?.email}</span>
          </div>
        </div>

        <button
          className={styles.bottomItem}
          onClick={() => { logout(); navigate('/login') }}
        >
          <span className={styles.bottomIcon}><LogoutIcon /></span>
          Logout
        </button>
      </div>

    </aside>
  )
}
