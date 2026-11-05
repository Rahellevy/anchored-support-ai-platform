import { Card } from '../../components/Card'
import type { ManagedUser } from '../../types/managedUser'
import styles from './users.module.css'

/** Right-hand column on the Users page: things that need an admin's attention, and policy notes. */
export function UsersSidebar({ users }: { users: ManagedUser[] }) {
  const patients = users.filter((u) => u.role === 'Patient')
  const unassigned = patients.filter((p) => !p.therapistId).length
  const pendingDisclosures = patients.filter((p) => p.disclosure === 'Pending').length

  return (
    <aside className={styles.sidebar}>
      <Card>
        <h2 className={styles.sideTitle}>Needs attention</h2>
        <ul className={styles.attention}>
          <li>
            Patients without a therapist <CountPill count={unassigned} />
          </li>
          <li>
            Disclosures pending <CountPill count={pendingDisclosures} />
          </li>
        </ul>
      </Card>

      <p className={styles.audit}>Every assignment change is recorded in the audit log.</p>
    </aside>
  )
}

/** Yellow when something needs doing, green at zero. */
function CountPill({ count }: { count: number }) {
  return <span className={count === 0 ? `${styles.countPill} ${styles.zero}` : styles.countPill}>{count}</span>
}
