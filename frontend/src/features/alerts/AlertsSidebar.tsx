import { Link } from 'react-router-dom'
import { Card } from '../../components/Card'
import { pluralize } from '../../utils/format'
import { useMyPatients } from '../patients/usePatients'
import styles from './alerts.module.css'

/** Right-hand column on the Alerts page: recent patient activity and how alerts reach you. */
export function AlertsSidebar() {
  const { data: patients = [] } = useMyPatients()
  const byActivity = [...patients].sort((a, b) => b.messagesLast7Days - a.messagesLast7Days)

  return (
    <aside className={styles.sidebar}>
      <Card>
        <h2 className={styles.sideTitle}>Patient activity, last 7 days</h2>
        <ul className={styles.activity}>
          {byActivity.map((patient) => (
            <li key={patient.id}>
              {patient.conversationId ? (
                <Link to={`/therapist/conversations/${patient.conversationId}`}>{patient.name}</Link>
              ) : (
                <span>{patient.name}</span>
              )}
              <span className={styles.muted}>
                {patient.messagesLast7Days > 0 ? pluralize(patient.messagesLast7Days, 'message') : 'None'}
              </span>
            </li>
          ))}
        </ul>
      </Card>

      <Card>
        <h2 className={styles.sideTitle}>How alerts reach you</h2>
        <p className={styles.settingsText}>
          New alerts appear on this page and in the bell count at the top. Email notifications are not set up yet.
        </p>
        <p className={styles.muted}>Rules are configured by your administrator</p>
      </Card>
    </aside>
  )
}
