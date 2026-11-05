import { useNavigate } from 'react-router-dom'
import { Button } from '../components/Button'
import { Card } from '../components/Card'
import { CrisisHelp } from '../components/CrisisHelp'
import { PatientHeader } from '../components/PatientHeader'
import { useHasConversation } from '../features/chat/useMyConversation'
import { useAuth } from '../hooks/useAuth'
import styles from './PatientHomePage.module.css'

/**
 * /patient: where a patient lands after logging in.
 * Each patient has one ongoing conversation; the button starts it the first time
 * (the chat page creates it) and continues it after that.
 */
export function PatientHomePage() {
  const navigate = useNavigate()
  const { user, logout } = useAuth()
  const { data: hasConversation } = useHasConversation()

  async function handleLogout() {
    await logout()
    navigate('/login', { replace: true })
  }

  return (
    <div className={styles.screen}>
      <title>Home · Anchored Support Services</title>
      <PatientHeader
        title="Anchored Support Services"
        actions={
          <Button variant="outline" onClick={handleLogout}>
            Log out
          </Button>
        }
      />

      <main className={styles.main}>
        <Card>
          <h1 className={styles.greeting}>Hi{user ? ` ${user.firstName}` : ''}</h1>
          <p className={styles.lead}>Talk things through with the Anchored assistant between sessions.</p>

          <Button to="/patient/chat">
            {hasConversation ? 'Continue your conversation' : 'Start a conversation'}
          </Button>
        </Card>

        <CrisisHelp />
      </main>
    </div>
  )
}
