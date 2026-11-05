import { Navigate, Route, Routes } from 'react-router-dom'
import { ProtectedRoute } from './components/ProtectedRoute'
import { LoginPage } from './pages/LoginPage'
import { PlaceholderPage } from './pages/PlaceholderPage'
import { TherapistDashboardPage } from './pages/TherapistDashboardPage'
import { homePathFor } from './utils/homePath'
import {useAuth} from "./hooks/useAuth.ts";

/**
 * Every URL in the app. To add a page:
 *  1. create it in src/pages/
 *  2. add a <Route> below (inside a ProtectedRoute if it needs a signed-in user)
 */
export function App() {
  return (
      <Routes>
        <Route path="/login" element={<LoginPage />} />

        {/* Therapist portal */}
        <Route element={<ProtectedRoute allow={['Therapist']} />}>
          <Route path="/therapist" element={<TherapistDashboardPage />} />
          <Route path="/therapist/alerts" element={<PlaceholderPage title="Alerts" />} />
        </Route>

        {/* Not built yet: placeholders so every role has somewhere to land after login */}
        <Route element={<ProtectedRoute allow={['Patient']} />}>
          <Route path="/chat" element={<PlaceholderPage title="Patient chat" />} />
        </Route>
        <Route element={<ProtectedRoute allow={['Admin']} />}>
          <Route path="/admin" element={<PlaceholderPage title="Admin" />} />
        </Route>

        {/* Any other URL: send the user to their home page (or the login page) */}
        <Route path="*" element={<HomeRedirect />} />
      </Routes>
  )
}

function HomeRedirect() {
  const { user, isLoggingIn } = useAuth()
  if (isLoggingIn) return null
  return <Navigate to={(user && homePathFor(user)) ?? '/login'} replace />
}
