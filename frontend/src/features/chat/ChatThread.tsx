import { useEffect, useRef, useState } from 'react'
import { useAcceptDisclosure, useDisclosureStatus } from '../disclosures/useDisclosure'
import { Composer } from './Composer'
import { FirstChatNotice } from './FirstChatNotice'
import { MessageList } from './MessageList'
import { useChat } from './useChat'
import styles from './chat.module.css'

/**
 * The scrolling message area + message box for the patient's conversation.
 * Split out of PatientChatPage because useChat needs the conversation id, which the page
 * only has after it has loaded (hooks can't be called conditionally).
 */
export function ChatThread({ conversationId, therapistName }: { conversationId: string; therapistName: string | null }) {
  const { messages, isLoading, send, isSending } = useChat(conversationId)
  const { data: firstChat } = useDisclosureStatus('first-chat')
  const acceptFirstChat = useAcceptDisclosure('first-chat')
  const [sendError, setSendError] = useState<string | null>(null)
  const scrollRef = useRef<HTMLElement>(null)

  // Keep the newest message in view.
  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight })
  }, [messages.length, isSending])

  const mustAcceptFirstChat = firstChat !== undefined && !firstChat.accepted

  async function handleSend(text: string) {
    setSendError(null)
    try {
      await send(text)
    } catch {
      setSendError('Your message could not be sent. Please try again.')
    }
  }

  return (
    <>
      <main className={styles.scroll} ref={scrollRef} aria-label="Conversation">
        {/* aria-live: screen readers announce new messages as they arrive */}
        <div className={styles.thread} aria-live="polite">
          {mustAcceptFirstChat && (
            <FirstChatNotice
              therapistName={therapistName}
              isSaving={acceptFirstChat.isPending}
              onAccept={() => acceptFirstChat.mutate()}
            />
          )}
          {isLoading && <p className={styles.statusNote}>Loading conversation…</p>}
          <MessageList messages={messages} isReplying={isSending} />
        </div>
      </main>

      <div className={styles.composerWrap}>
        <Composer
          onSend={handleSend}
          disabled={isLoading || isSending || firstChat === undefined || mustAcceptFirstChat}
          placeholder={mustAcceptFirstChat ? 'Read the note above to start' : 'Type a message'}
        />
        <p className={styles.foot} role={sendError ? 'alert' : undefined}>
          {sendError ?? 'AI replies can be wrong. Your therapist can read this conversation.'}
        </p>
      </div>
    </>
  )
}
