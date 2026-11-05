import { Badge } from '../../components/Badge'
import type { Patient } from '../../types/patient'
import styles from './patients.module.css'

/** "1 High" / "1 Medium" badges, or "None" if the patient has no flags. */
export function FlagBadges({ high, medium }: { high: number; medium: number }) {
  if (high === 0 && medium === 0) return <Badge tone="neutral">None</Badge>

  return (
    <span className={styles.badgeGroup}>
      {high > 0 && <Badge tone="danger">{high} High</Badge>}
      {medium > 0 && <Badge tone="warning">{medium} Medium</Badge>}
    </span>
  )
}

/** Review state for a patient's conversations. */
export function ReviewStatusBadge({ patient }: { patient: Patient }) {
  if (patient.unreviewedConversations > 0) {
    return <Badge tone="pending">{patient.unreviewedConversations} unreviewed</Badge>
  }
  if (patient.conversationsLast7Days === 0) {
    return <Badge tone="neutral">Nothing to review</Badge>
  }
  return <Badge tone="success">Reviewed</Badge>
}
