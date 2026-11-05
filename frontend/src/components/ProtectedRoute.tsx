import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import type { Role } from '../types/auth'
import { homePathFor } from '../utils/homePath'

/**
 * Wraps routes that need a signed-in user with one of the allowed roles (see App.tsx).
 *  - not signed in      → /login
 *  - wrong role         → that user's own home page
 *
 * This only controls what the UI shows. The backend still checks every API call,
 * so never rely on this for security.
 */
export function ProtectedRoute({ allow }: { allow: Role[] }) {
  const { user, isLoading } = useAuth()

  if (isLoading) return null // still asking the backend who is signed in
  if (!user) return <Navigate to="/login" replace />

  const hasAllowedRole = user.roles.some((role) => allow.includes(role))
  if (!hasAllowedRole) return <Navigate to={homePathFor(user) ?? '/login'} replace />

  return <Outlet />
}
