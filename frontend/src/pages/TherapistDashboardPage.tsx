import { useState } from 'react'
import { FlagDisclaimer } from '../components/FlagDisclaimer'
import { PageHeader } from '../components/PageHeader'
import { PatientSummaryCards } from '../features/patients/PatientSummaryCards'
import { PatientTable } from '../features/patients/PatientTable'
import { useMyPatients } from '../features/patients/usePatients'
import styles from './TherapistDashboardPage.module.css'

/**
 * /therapist: the therapist's patient list with summary cards and a name search.
 * Header and banner come from TherapistLayout.
 */
export function TherapistDashboardPage() {
  const { data: patients = [], isPending } = useMyPatients()
  const [search, setSearch] = useState('')

  // Re-filtered on every render; cheap at this size, no memoization needed.
  const term = search.trim().toLowerCase()
  const visiblePatients = patients.filter((p) => p.name.toLowerCase().includes(term))

  return (
    <>
      <title>Your patients · Anchored Clinician Portal</title>

      <PageHeader
        title="Your patients"
        description="AI conversation activity for patients assigned to you, sorted by what needs review."
        actions={
          <div className={styles.search}>
            <label htmlFor="patient-search" className={styles.searchLabel}>
              Search patients
            </label>
            <input
              id="patient-search"
              className={styles.searchInput}
              type="search"
              placeholder="Name"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        }
      />

      {isPending ? (
        <p className={styles.loading}>Loading patients…</p>
      ) : (
        <>
          <PatientSummaryCards patients={patients} />
          <PatientTable patients={visiblePatients} />
        </>
      )}

      <FlagDisclaimer />
    </>
  )
}
