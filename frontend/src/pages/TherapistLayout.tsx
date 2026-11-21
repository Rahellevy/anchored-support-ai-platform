import { PortalLayout } from '../components/PortalLayout'
import { useOpenAlertCount } from '../features/alerts/useAlerts'

/** Frame for every /therapist page: header (with open-alert count) + banner. Pages render inside. */
export function TherapistLayout() {
  const openAlerts = useOpenAlertCount()

  return (
    <PortalLayout
      header={{
        subtitle: 'Clinician portal',
        links: [
          // Conversations belong under "Patients", so that tab stays highlighted there too.
          { to: '/therapist', label: 'Patients', alsoActiveFor: ['/therapist/conversations'] },
          { to: '/therapist/alerts', label: 'Alerts' },
        ],
        notificationsTo: '/therapist/alerts',
        notificationCount: openAlerts,
      }}
    />
  )
}
