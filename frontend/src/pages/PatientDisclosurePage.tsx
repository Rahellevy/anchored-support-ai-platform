import { useState } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import { Button } from '../components/Button'
import { PatientHeader } from '../components/PatientHeader'
import { useMyTherapist } from '../features/chat/useMyConversation'
import { useAcceptDisclosure, useDisclosureStatus } from '../features/disclosures/useDisclosure'
import styles from './PatientDisclosurePage.module.css'

/**
 * /patient/welcome: the first-use disclosure. Patients can't reach any other patient page until
 * they've agreed (see RequireDisclosure). Wording is a placeholder until Anchored provides it.
 */
export function PatientDisclosurePage() {
  const navigate = useNavigate()
  const { data: status, isPending } = useDisclosureStatus('first-use')
  const accept = useAcceptDisclosure('first-use')
  const { data: therapist } = useMyTherapist()

  const [agreed, setAgreed] = useState(false)
  const [showFull, setShowFull] = useState(false)

  if (isPending) return null
  if (status?.accepted) return <Navigate to="/patient" replace />

  const points = [
    { title: "You'll be talking with an AI", detail: 'Not a person, and not your therapist.' },
    { title: 'This is not a crisis service', detail: 'In an emergency, call 911 or call or text 988.' },
    { title: 'Your conversations are saved', detail: "They're stored securely by Anchored." },
    {
      title: 'Your therapist can read them',
      detail: `${therapist?.name ?? 'Your therapist'} can review what you write here.`,
    },
    { title: 'Some staff may have access', detail: 'Authorized Anchored staff, as allowed by practice policy.' },
    {
      title: 'Certain topics are flagged',
      detail: 'If a message matches warning signs set by Anchored, your therapist may be notified.',
    },
  ]

  return (
    <div className={styles.screen}>
      <title>Before you start · Anchored</title>
      <PatientHeader title="Anchored" />

      <div className={styles.cardWrap}>
        <div className={styles.card}>
          <main className={styles.content}>
            <h1 className={styles.title}>Before you start</h1>
            <p className={styles.lead}>Please read how this works. It takes about a minute.</p>

            <ol className={styles.points}>
              {points.map((point, index) => (
                <li key={point.title}>
                  <span className={styles.number} aria-hidden="true">
                    {index + 1}
                  </span>
                  <div>
                    <strong>{point.title}</strong>
                    <span>{point.detail}</span>
                  </div>
                </li>
              ))}
            </ol>

            <button
              type="button"
              className={styles.fullLink}
              aria-expanded={showFull}
              aria-controls="full-disclosure"
              onClick={() => setShowFull((shown) => !shown)}
            >
              {showFull ? 'Hide the full disclosure' : 'Read the full disclosure'}
            </button>
            {showFull && (
              <div id="full-disclosure" className={styles.fullBox}>
                The full disclosure text will be provided by Anchored Support Services.
              </div>
            )}
          </main>

          <footer className={styles.footer}>
            <label className={styles.agree}>
              <input type="checkbox" checked={agreed} onChange={(e) => setAgreed(e.target.checked)} />
              <span>I have read this and understand who can see my conversations.</span>
            </label>
            <Button
              disabled={!agreed || accept.isPending}
              onClick={() => accept.mutate(undefined, { onSuccess: () => navigate('/patient', { replace: true }) })}
            >
              {accept.isPending ? 'Saving…' : 'Agree and continue'}
            </Button>
            {accept.isError && (
              <p className={styles.error} role="alert">
                Could not save your agreement. Please try again.
              </p>
            )}
            <p className={styles.fine}>Final wording to be provided by Anchored Support Services</p>
          </footer>
        </div>
      </div>
    </div>
  )
}
