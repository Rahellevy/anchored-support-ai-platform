import type { Patient } from '../../types/patient'
import { pluralize } from '../../utils/format'
import { FlagBadges } from './PatientBadges'
import styles from './patients.module.css'

/**
 * The three summary cards above the patient table.
 * Totals are calculated from the full patient list (not the search-filtered one).
 */
export const PatientSummaryCards = ({ patients }: { patients: Patient[] }) => {
  const sum = (pick: (p: Patient) => number) => patients.reduce((total, p) => total + pick(p), 0)

  const highFlags = sum((p) => p.highFlags)
  const mediumFlags = sum((p) => p.mediumFlags)
  const unreviewed = sum((p) => p.unreviewedConversations)
  const patientsWithUnreviewed = patients.filter((p) => p.unreviewedConversations > 0).length
  const activePatients = patients.filter((p) => p.conversationsLast7Days > 0).length
  const totalConversations = sum((p) => p.conversationsLast7Days)

  return (
    <section className={styles.cards} aria-label="Summary">
      <article className={styles.card}>
        <h2 className={styles.cardTitle}>Flags awaiting review</h2>
        <p className={styles.cardNumber}>{highFlags + mediumFlags}</p>
        <FlagBadges high={highFlags} medium={mediumFlags} />
      </article>

      <article className={styles.card}>
        <h2 className={styles.cardTitle}>Unreviewed conversations</h2>
        <p className={styles.cardNumber}>{unreviewed}</p>
        <p className={styles.cardNote}>Across {pluralize(patientsWithUnreviewed, 'patient')}</p>
      </article>

      <article className={styles.card}>
        <h2 className={styles.cardTitle}>Patients with AI activity, last 7 days</h2>
        <p className={styles.cardNumber}>
          {activePatients} <span className={styles.cardOf}>of {patients.length}</span>
        </p>
        <p className={styles.cardNote}>{pluralize(totalConversations, 'conversation')} total</p>
      </article>
    </section>
  )
}
