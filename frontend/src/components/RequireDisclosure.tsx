import { Navigate, Outlet } from 'react-router-dom'
import { useDisclosureStatus } from '../features/disclosures/useDisclosure'

/**
 * Wraps patient routes (see App.tsx): until the patient has accepted the first-use disclosure,
 * every patient page redirects to /patient/welcome. The backend enforces the same rule.
 */
export function RequireDisclosure() {
  const { data: status, isPending, isError } = useDisclosureStatus('first-use')

  if (isPending) return null
  if (isError) return <p>Could not load your account. Please refresh the page.</p>
  if (!status.accepted) return <Navigate to="/patient/welcome" replace />
  return <Outlet />
}
