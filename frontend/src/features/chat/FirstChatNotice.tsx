import { Button } from '../../components/Button'
import { CrisisHelp } from '../../components/CrisisHelp'
import styles from './chat.module.css'

/**
 * The first-chat disclosure, shown at the top of the chat until the patient presses "Got it".
 * Accepting is recorded on the server (POST /api/disclosures/first-chat/accept); until then
 * the message box is disabled and the server refuses messages.
 */
interface FirstChatNoticeProps {
  therapistName: string | null
  onAccept: () => void
  isSaving: boolean
}

export function FirstChatNotice({ therapistName, onAccept, isSaving }: FirstChatNoticeProps) {
  return (
    <section className={styles.notice} aria-labelledby="notice-title">
      <p className={styles.eyebrow} id="notice-title">
        Your first conversation
      </p>
      <ul className={styles.list}>
        <li>
          You're talking with an <strong>AI</strong>, not a person.
        </li>
        <li>
          This conversation is <strong>not private from your therapist</strong>
          {therapistName ? `, ${therapistName}` : ''}.
        </li>
        <li>Authorized Anchored staff may also have access.</li>
        <li>Messages are checked for warning signs set by Anchored.</li>
      </ul>
      <CrisisHelp />
      <Button variant="outline" onClick={onAccept} disabled={isSaving}>
        {isSaving ? 'Saving…' : 'Got it'}
      </Button>
    </section>
  )
}
