import { Navigate } from 'react-router-dom'
import { useAuth } from '../hooks/index'
import Sidebar from '../components/navigation/Sidebar'
import Topbar from '../components/navigation/Topbar'
import styles from './AppLayout.module.css'

export default function AppLayout({ children }) {
  const { user } = useAuth()

  if (!user) return <Navigate to="/login" replace />

  return (
    <div className={styles.shell}>
      <Sidebar />
      <div className={styles.main}>
        <Topbar />
        <main className={styles.content}>
          {children}
        </main>
      </div>
    </div>
  )
}
