import { useEffect, useRef } from 'react'
import { Button } from '../../components/Button'
import { CrisisHelp } from '../../components/CrisisHelp'
import styles from './chat.module.css'

/**
 * "Who can see this?" explanation, as a native <dialog> (handles focus trapping and Esc for us).
 * Controlled by `open`; `onClose` fires for the Close button, Esc and backdrop clicks.
 */
interface WhoCanSeeDialogProps {
  open: boolean
  onClose: () => void
  therapistName: string | null
}

export function WhoCanSeeDialog({ open, onClose, therapistName }: WhoCanSeeDialogProps) {
  const dialogRef = useRef<HTMLDialogElement>(null)

  // <dialog> must be opened with showModal() to get the backdrop, so sync it with the `open` prop.
  useEffect(() => {
    const dialog = dialogRef.current
    if (!dialog) return
    if (open && !dialog.open) dialog.showModal()
    if (!open && dialog.open) dialog.close()
  }, [open])

  return (
    <dialog
      ref={dialogRef}
      className={styles.dialog}
      aria-labelledby="who-title"
      onClose={onClose}
      onClick={(e) => e.target === dialogRef.current && onClose()} // click on the backdrop
    >
      <h2 id="who-title" className={styles.dialogTitle}>
        Who can see this?
      </h2>
      <ul className={styles.list}>
        <li>
          {therapistName ? `Your therapist, ${therapistName},` : 'Your therapist'} can read what you write here.
        </li>
        <li>Authorized Anchored staff, as allowed by practice policy.</li>
        <li>If a message matches warning signs set by Anchored, your therapist may be notified.</li>
      </ul>
      <CrisisHelp />
      <Button variant="outline" onClick={onClose}>
        Close
      </Button>
    </dialog>
  )
}
