import { useState } from 'react'
import { AppHeader } from '../components/AppHeader'
import { SafetyBanner } from '../components/SafetyBanner'
import { mockPatients } from '../features/patients/mockPatients'
import { PatientSummaryCards } from '../features/patients/PatientSummaryCards'
import { PatientTable } from '../features/patients/PatientTable'
import type { Patient } from '../types/patient'
import styles from './TherapistDashboardPage.module.css'

/** Links shown in the clinician portal header. */
const THERAPIST_LINKS = [
  { to: '/therapist', label: 'Patients' },
  { to: '/therapist/alerts', label: 'Alerts' },
]

/**
 * /therapist: the therapist's patient list with summary cards and a name search.
 */
export const TherapistDashboardPage = () => {
  // TODO: load from the backend instead of mock data.
  const patients = mockPatients
  const [search, setSearch] = useState('')

  // Re-filtered on every render; cheap at this size, no memoization needed.
  const term = search.trim().toLowerCase()
  const visiblePatients = patients.filter((p) => p.name.toLowerCase().includes(term))

  const flagsAwaitingReview = patients.reduce((total, p) => total + p.highFlags + p.mediumFlags, 0)

  const openPatient = (patient: Patient) => {
    // TODO: navigate to a patient detail page once it exists, e.g. navigate(`/therapist/patients/${patient.id}`)
    console.info('Open patient', patient.id)
  }

  return (
    <div className={styles.page}>
      <title>Your patients · Anchored Clinician Portal</title>

      <AppHeader subtitle="Clinician portal" links={THERAPIST_LINKS} notificationCount={flagsAwaitingReview} />
      <SafetyBanner />

      <main className={styles.main}>
        <section className={styles.intro}>
          <div>
            <h1 className={styles.title}>Your patients</h1>
            <p className={styles.introText}>
              AI conversation activity for patients assigned to you, sorted by what needs review.
            </p>
          </div>

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
        </section>

        <PatientSummaryCards patients={patients} />
        <PatientTable patients={visiblePatients} onOpen={openPatient} />

        <footer className={styles.disclaimer}>
          <p>
            Flags come from rules configured by Anchored Support Services. They can include false positives and can
            miss concerns, so they are not a clinical safety guarantee.
          </p>
        </footer>
      </main>
    </div>
  )
}
