import { useState } from 'react'
import { Button } from '../components/Button'
import { FilterTabs } from '../components/FilterTabs'
import { PageHeader } from '../components/PageHeader'
import { UsersSidebar } from '../features/users/UsersSidebar'
import { UsersTable } from '../features/users/UsersTable'
import { useAssignTherapist, useManagedUsers } from '../features/users/useUsers'
import styles from '../features/users/users.module.css'
import type { Role } from '../types/auth'
import type { ManagedUser } from '../types/managedUser'

type RoleFilter = 'all' | Role

/** /admin/users: accounts and patient–therapist assignments. */
export function UsersPage() {
  const { data: users = [], isPending } = useManagedUsers()
  const assign = useAssignTherapist()
  const [filter, setFilter] = useState<RoleFilter>('all')
  const [statusMessage, setStatusMessage] = useState('')

  const countOf = (role: Role) => users.filter((u) => u.role === role).length
  const shown = filter === 'all' ? users : users.filter((u) => u.role === filter)
  const nameOf = (id: string | null) => users.find((u) => u.id === id)?.name

  function handleAssign(patient: ManagedUser, therapistId: string | null) {
    assign.mutate(
      { patientId: patient.id, therapistId },
      {
        onSuccess: () =>
          setStatusMessage(
            therapistId
              ? `${patient.name} is now assigned to ${nameOf(therapistId)}. The change is recorded in the audit log.`
              : `${patient.name} is now unassigned. The change is recorded in the audit log.`,
          ),
      },
    )
  }

  return (
    <>
      <title>Users · Anchored Administration</title>

      <PageHeader
        title="Users and assignments"
        description="Create accounts and link each patient to one therapist. Therapists only ever see their assigned patients."
        // TODO: add-user form once the backend has an endpoint for it
        actions={<Button onClick={() => setStatusMessage('Adding users is not connected yet.')}>Add user</Button>}
      />

      <div className={styles.layout}>
        <section>
          <FilterTabs
            label="Filter users"
            value={filter}
            onChange={setFilter}
            tabs={[
              { value: 'all', label: 'All', count: users.length },
              { value: 'Patient', label: 'Patients', count: countOf('Patient') },
              { value: 'Therapist', label: 'Therapists', count: countOf('Therapist') },
              { value: 'Admin', label: 'Administrators', count: countOf('Admin') },
            ]}
          />

          {isPending ? (
            <p>Loading users…</p>
          ) : (
            <UsersTable
              users={shown}
              allUsers={users}
              onAssign={handleAssign}
              // TODO: edit-user form
              onEdit={(user) => setStatusMessage(`Editing ${user.name} is not connected yet.`)}
            />
          )}

          <p className={styles.statusNote} role="status">
            {statusMessage}
          </p>
        </section>

        <UsersSidebar users={users} />
      </div>
    </>
  )
}
