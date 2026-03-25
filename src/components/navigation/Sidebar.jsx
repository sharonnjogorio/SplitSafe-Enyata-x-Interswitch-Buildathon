import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../../hooks/index'
import styles from './Sidebar.module.css'

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

const PaymentsIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="5" width="20" height="14" rx="2"/><line x1="2" y1="10" x2="22" y2="10"/>
  </svg>
)

const SavingsIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M19 7c0-1.1-.9-2-2-2H7C5.9 5 5 5.9 5 7v2c0 1.1.9 2 2 2h10c1.1 0 2-.9 2-2V7z"/>
    <path d="M19 13H5v5a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-5z"/>
    <line x1="12" y1="13" x2="12" y2="22"/>
  </svg>
)

const ActivityIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="1 4 1 10 7 10"/><polyline points="23 20 23 14 17 14"/>
    <path d="M20.49 9A9 9 0 0 0 5.64 5.64L1 10m22 4-4.64 4.36A9 9 0 0 1 3.51 15"/>
  </svg>
)

const SettlementsIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="8" cy="18" r="3"/><circle cx="16" cy="6" r="3"/>
    <line x1="8" y1="15" x2="16" y2="9"/>
  </svg>
)

const SettingsIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="3"/>
    <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>
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
  { label: 'Dashboard',     path: '/',            end: true,  Icon: DashboardIcon  },
  { label: 'Groups',        path: '/groups',       end: false, Icon: GroupsIcon     },
  { label: 'Payments',      path: '/payments',     end: false, Icon: PaymentsIcon   },
  { label: 'Social Savings',path: '/circles',      end: false, Icon: SavingsIcon    },
  { label: 'Activity Log',  path: '/activity',     end: false, Icon: ActivityIcon   },
  { label: 'Settlements',   path: '/settlements',  end: false, Icon: SettlementsIcon},
]

export default function Sidebar() {
  const { logout } = useAuth()
  const navigate   = useNavigate()

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
        <button
          className={styles.settleBtn}
          onClick={() => navigate('/settlements')}
        >
          Settle Up
        </button>

        <NavLink to="/settings" className={styles.bottomItem}>
          <span className={styles.bottomIcon}><SettingsIcon /></span>
          Settings
        </NavLink>

        <button
          className={styles.bottomItem}
          onClick={() => { logout(); navigate('/login') }}
        >
          <span className={styles.bottomIcon}><LogoutIcon /></span>
          Logout
        </button>

        <NavLink to="/settlements" className={styles.bottomItem}>
          <span className={styles.bottomIcon}><SettlementsIcon /></span>
          Settlements
        </NavLink>
      </div>

    </aside>
  )
}
