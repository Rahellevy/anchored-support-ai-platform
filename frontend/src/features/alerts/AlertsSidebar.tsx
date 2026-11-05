import { Link } from 'react-router-dom'
import { Card } from '../../components/Card'
import { pluralize } from '../../utils/format'
import { useMyPatients } from '../patients/usePatients'
import styles from './alerts.module.css'

/** Right-hand column on the Alerts page: recent patient activity and notification settings. */
export function AlertsSidebar() {
  const { data: patients = [] } = useMyPatients()
  const byActivity = [...patients].sort((a, b) => b.conversationsLast7Days - a.conversationsLast7Days)

  return (
    <aside className={styles.sidebar}>
      <Card>
        <h2 className={styles.sideTitle}>Patient activity, last 7 days</h2>
        <ul className={styles.activity}>
          {byActivity.map((patient) => (
            <li key={patient.id}>
              {patient.latestConversationId ? (
                <Link to={`/therapist/conversations/${patient.latestConversationId}`}>{patient.name}</Link>
              ) : (
                <span>{patient.name}</span>
              )}
              <span className={styles.muted}>
                {patient.conversationsLast7Days > 0 ? pluralize(patient.conversationsLast7Days, 'conversation') : 'None'}
              </span>
            </li>
          ))}
        </ul>
      </Card>

      <Card>
        <h2 className={styles.sideTitle}>Notification settings</h2>
        <p className={styles.settingsText}>
          High: in-app and email (email only says an alert is waiting; no conversation content).
        </p>
        <p className={styles.settingsText}>Medium: in-app only.</p>
        <p className={styles.muted}>Configured by your administrator</p>
      </Card>
    </aside>
  )
}
