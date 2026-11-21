import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Button } from '../components/Button'
import { PatientHeader } from '../components/PatientHeader'
import { ChatThread } from '../features/chat/ChatThread'
import { useMyConversation, useMyTherapist } from '../features/chat/useMyConversation'
import { WhoCanSeeDialog } from '../features/chat/WhoCanSeeDialog'
import { useAuth } from '../hooks/useAuth'
import styles from '../features/chat/chat.module.css'

/**
 * /patient/chat: the patient's one ongoing conversation with the AI assistant.
 * Reached from the patient home page. The conversation is created automatically the first time.
 */
export function PatientChatPage() {
  const { user } = useAuth()
  const { data: conversation, isError } = useMyConversation(user?.firstName ?? '')
  const { data: therapist } = useMyTherapist()
  const [whoOpen, setWhoOpen] = useState(false)

  const therapistName = therapist?.name ?? null

  return (
    <div className={styles.screen}>
      <title>Chat · Anchored</title>

      <PatientHeader
        title="Anchored Assistant"
        subtitle="AI · not a person · not your therapist"
        actions={
          <>
            <Link to="/patient" className={styles.homeLink}>
              Home
            </Link>
            <Button variant="outline" onClick={() => setWhoOpen(true)}>
              Who can see this?
            </Button>
          </>
        }
      />

      {conversation ? (
        <ChatThread conversationId={conversation.id} therapistName={therapistName} />
      ) : (
        <main className={styles.scroll}>
          <p className={`${styles.thread} ${styles.statusNote}`} role={isError ? 'alert' : undefined}>
            {isError ? 'Could not open your conversation. Please refresh the page.' : 'Loading…'}
          </p>
        </main>
      )}

      <WhoCanSeeDialog open={whoOpen} onClose={() => setWhoOpen(false)} therapistName={therapistName} />
    </div>
  )
}
