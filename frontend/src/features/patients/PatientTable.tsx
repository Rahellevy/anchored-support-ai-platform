import { Button } from '../../components/Button'
import type { Patient } from '../../types/patient'
import { initials, pluralize } from '../../utils/format'
import { FlagBadges, ReviewStatusBadge } from './PatientBadges'
import styles from './patients.module.css'

/**
 * Table of the therapist's patients. Rendered from the `patients` array,
 * so filtering/sorting happens in the page, not here.
 */
const COLUMN_COUNT = 7

export function PatientTable({ patients }: { patients: Patient[] }) {
  return (
    <section className={styles.tableWrap}>
      <table className={styles.table}>
        <thead>
          <tr>
            <th scope="col">Patient</th>
            <th scope="col">Last AI conversation</th>
            <th scope="col">Last 7 days</th>
            <th scope="col">Flags</th>
            <th scope="col">Review status</th>
            <th scope="col">Last reviewed</th>
            <th scope="col">
              <span className="visually-hidden">Actions</span>
            </th>
          </tr>
        </thead>

        <tbody>
          {patients.length === 0 ? (
            <tr>
              <td className={styles.empty} colSpan={COLUMN_COUNT}>
                No patients match your search.
              </td>
            </tr>
          ) : (
            patients.map((patient) => (
              <tr key={patient.id}>
                <td>
                  <div className={styles.patient}>
                    <span className={styles.avatar} aria-hidden="true">
                      {initials(patient.name)}
                    </span>
                    <div>
                      <strong className={styles.patientName}>{patient.name}</strong>
                      <span className={styles.patientSub}>Synthetic patient</span>
                    </div>
                  </div>
                </td>
                <td>{patient.lastConversation}</td>
                <td>{pluralize(patient.conversationsLast7Days, 'conversation')}</td>
                <td>
                  <FlagBadges high={patient.highFlags} medium={patient.mediumFlags} />
                </td>
                <td>
                  <ReviewStatusBadge patient={patient} />
                </td>
                <td>{patient.lastReviewed}</td>
                <td>
                  {/* Opens the latest conversation. TODO: a per-patient timeline page could go here instead. */}
                  {patient.latestConversationId ? (
                    <Button variant="outline" to={`/therapist/conversations/${patient.latestConversationId}`}>
                      Open
                    </Button>
                  ) : (
                    <Button variant="outline" disabled title="No conversations yet">
                      Open
                    </Button>
                  )}
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </section>
  )
}
