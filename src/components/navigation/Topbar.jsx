import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../../hooks/index'
import styles from './Topbar.module.css'

const TABS = [
  { label: 'Dashboard', path: '/dashboard', end: true  },
  { label: 'Groups',    path: '/groups',    end: false },
  { label: 'Settlements', path: '/settlements', end: false },
]

function getInitials(name = '') {
  return name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()
}

export default function Topbar() {
  const { user } = useAuth()
  const navigate = useNavigate()

  return (
    <header className={styles.topbar}>

      <NavLink to="/" className={styles.logo}>SplitSafe</NavLink>

      <nav className={styles.tabs}>
        {TABS.map((tab) => (
          <NavLink
            key={tab.path}
            to={tab.path}
            end={tab.end}
            className={({ isActive }) =>
              `${styles.tab} ${isActive ? styles.active : ''}`
            }
          >
            {tab.label}
          </NavLink>
        ))}
      </nav>

      <div className={styles.right}>

        {/* Search bar */}
        <div className={styles.searchBar}>
          <svg className={styles.searchIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
          <input
            type="text"
            className={styles.searchInput}
            placeholder="Search transactions..."
          />
        </div>

        {/* Bell */}
        <button className={styles.iconBtn} aria-label="Notifications">
          <svg className={styles.iconBtnSvg} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
            <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
          </svg>
        </button>

        {/* User avatar */}
        <div className={styles.avatar} title={user?.name} onClick={() => navigate('/profile')} style={{ cursor: 'pointer' }}>
          {user?.avatar
            ? <img src={user.avatar} alt={user.name} className={styles.avatarImg} />
            : getInitials(user?.name || 'U')
          }
        </div>

      </div>
    </header>
  )
}
