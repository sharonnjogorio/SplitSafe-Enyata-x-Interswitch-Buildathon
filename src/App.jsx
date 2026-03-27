import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider }  from './context/AuthContext'
import { AppProvider }   from './context/AppContext'
import { useAuth }       from './hooks/index'

import LandingPage       from './pages/LandingPage'
import LoginPage         from './pages/auth/LoginPage'
import SignupPage        from './pages/auth/SignupPage'
import DashboardPage     from './pages/DashboardPage'
import GroupsPage        from './pages/groups/GroupsPage'
import GroupDetailPage   from './pages/groups/GroupDetailPage'
import SettlementsPage      from './pages/SettlementsPage'
import PaymentHistoryPage  from './pages/PaymentHistoryPage'
import ProfilePage         from './pages/ProfilePage'

function PrivateRoute({ children }) {
  const { user } = useAuth()
  return user ? children : <Navigate to="/login" replace />
}

function AppRoutes() {
  return (
    <Routes>
      {/* Public */}
      <Route path="/"        element={<LandingPage />} />
      <Route path="/login"   element={<LoginPage />} />
      <Route path="/signup"  element={<SignupPage />} />

      {/* Protected */}
      <Route path="/dashboard" element={
        <PrivateRoute><DashboardPage /></PrivateRoute>
      } />
      <Route path="/groups" element={
        <PrivateRoute><GroupsPage /></PrivateRoute>
      } />
      <Route path="/groups/:id" element={
        <PrivateRoute><GroupDetailPage /></PrivateRoute>
      } />
      <Route path="/settlements" element={
        <PrivateRoute><SettlementsPage /></PrivateRoute>
      } />
      <Route path="/payments" element={
        <PrivateRoute><PaymentHistoryPage /></PrivateRoute>
      } />
      <Route path="/profile" element={
        <PrivateRoute><ProfilePage /></PrivateRoute>
      } />

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppProvider>
          <AppRoutes />
        </AppProvider>
      </AuthProvider>
    </BrowserRouter>
  )
}