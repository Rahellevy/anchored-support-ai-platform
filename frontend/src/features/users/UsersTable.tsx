import { Badge, type BadgeTone } from '../../components/Badge'
import { Button } from '../../components/Button'
import type { ManagedUser } from '../../types/managedUser'
import { pluralize } from '../../utils/format'
import { ROLE_LABELS } from '../../utils/roles'
import styles from './users.module.css'

/**
 * Accounts table. Patients get a therapist dropdown; therapists show how many patients they have.
 * `allUsers` is the full list (for therapist options and counts); `users` is what's shown after filtering.
 */
interface UsersTableProps {
  users: ManagedUser[]
  allUsers: ManagedUser[]
  onAssign: (patient: ManagedUser, therapistId: string | null) => void
  onEdit: (user: ManagedUser) => void
}

const disclosureTone = (disclosure: string): BadgeTone =>
  disclosure === 'Pending' ? 'warning' : disclosure === 'Not required' ? 'neutral' : 'success'

export function UsersTable({ users, allUsers, onAssign, onEdit }: UsersTableProps) {
  const therapists = allUsers.filter((u) => u.role === 'Therapist')
  const patientCount = (therapistId: string) =>
    allUsers.filter((u) => u.role === 'Patient' && u.therapistId === therapistId).length

  return (
    <div className={styles.tableWrap}>
      <table className={styles.table}>
        <thead>
          <tr>
            <th scope="col">Name</th>
            <th scope="col">Role</th>
            <th scope="col">Assignment</th>
            <th scope="col">Disclosure</th>
            <th scope="col">Account</th>
            <th scope="col">
              <span className="visually-hidden">Actions</span>
            </th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => (
            <tr key={user.id}>
              <td>{user.name}</td>
              <td>{ROLE_LABELS[user.role]}</td>
              <td>
                {user.role === 'Patient' && (
                  <select
                    className={styles.assignSelect}
                    aria-label={`Therapist for ${user.name}`}
                    value={user.therapistId ?? ''}
                    onChange={(e) => onAssign(user, e.target.value || null)}
                  >
                    <option value="">Unassigned</option>
                    {therapists.map((therapist) => (
                      <option key={therapist.id} value={therapist.id}>
                        {therapist.name}
                      </option>
                    ))}
                  </select>
                )}
                {user.role === 'Therapist' && pluralize(patientCount(user.id), 'patient')}
                {user.role === 'Admin' && 'System-wide'}
              </td>
              <td>
                <Badge tone={disclosureTone(user.disclosure)}>{user.disclosure}</Badge>
              </td>
              <td>
                <Badge tone={user.accountStatus === 'Invited' ? 'pending' : 'success'}>{user.accountStatus}</Badge>
              </td>
              <td>
                <Button variant="outline" onClick={() => onEdit(user)} aria-label={`Edit ${user.name}`}>
                  Edit
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
