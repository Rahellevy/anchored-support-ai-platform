import { Card } from '../../components/Card'
import type { Patient } from '../../types/patient'
import { pluralize } from '../../utils/format'
import { FlagBadges } from './PatientBadges'
import styles from './patients.module.css'

/**
 * The three summary cards above the patient table.
 * Totals are calculated from the full patient list (not the search-filtered one).
 */
export function PatientSummaryCards({ patients }: { patients: Patient[] }) {
  const sum = (pick: (p: Patient) => number) => patients.reduce((total, p) => total + pick(p), 0)

  const highFlags = sum((p) => p.highFlags)
  const mediumFlags = sum((p) => p.medFlags)
  const needingReview = patients.filter((p) => p.needsReview).length
  const activePatients = patients.filter((p) => p.messagesLast7Days > 0).length
  const totalMessages = sum((p) => p.messagesLast7Days)

  return (
    <section className={styles.cards} aria-label="Summary">
      <Card as="article">
        <h2 className={styles.cardTitle}>Open flags</h2>
        <p className={styles.cardNumber}>{highFlags + mediumFlags}</p>
        <FlagBadges high={highFlags} medium={mediumFlags} />
      </Card>

      <Card as="article">
        <h2 className={styles.cardTitle}>Conversations to review</h2>
        <p className={styles.cardNumber}>{needingReview}</p>
        <p className={styles.cardNote}>New messages since your last review</p>
      </Card>

      <Card as="article">
        <h2 className={styles.cardTitle}>Patients with AI activity, last 7 days</h2>
        <p className={styles.cardNumber}>
          {activePatients} <span className={styles.cardOf}>of {patients.length}</span>
        </p>
        <p className={styles.cardNote}>{pluralize(totalMessages, 'message')} from patients</p>
      </Card>
    </section>
  )
}
