import { useState } from 'react'
import { Button } from '../../components/Button'
import { SeverityBadge } from '../../components/SeverityBadge'
import type { ChatMessage } from '../../types/conversation'
import type { Alert } from '../../types/flags'
import { formatTime, pluralize } from '../../utils/format'
import styles from './conversations.module.css'

/** How many of the most recent messages show before "Show earlier messages". */
const RECENT_COUNT = 8

const SENDER_LABEL = { Patient: 'Patient', Assistant: 'AI assistant' } as const

/**
 * The original, unedited conversation. Flagged messages get an outline plus a text tag
 * (never color alone) saying why they were flagged.
 */
export function Transcript({ messages, alerts }: { messages: ChatMessage[]; alerts: Alert[] }) {
  const [showEarlier, setShowEarlier] = useState(false)

  const hiddenCount = showEarlier ? 0 : Math.max(0, messages.length - RECENT_COUNT)
  const visible = messages.slice(hiddenCount)
  const alertFor = (messageId: string) => alerts.find((alert) => alert.flaggedMessageId === messageId)

  return (
    <section className={styles.chat} aria-label="Original conversation">
      {hiddenCount > 0 && (
        <div className={styles.earlier}>
          <Button variant="outline" onClick={() => setShowEarlier(true)}>
            Show {pluralize(hiddenCount, 'earlier message')}
          </Button>
        </div>
      )}

      <ol className={styles.messages}>
        {visible.map((message) => {
          const alert = alertFor(message.id)
          const classes = [
            styles.message,
            message.sender === 'Patient' ? styles.fromPatient : styles.fromAssistant,
            alert && styles.flagged,
          ]
            .filter(Boolean)
            .join(' ')

          return (
            <li key={message.id} className={classes}>
              <p className={styles.meta}>
                <strong>{SENDER_LABEL[message.sender]}</strong> · {formatTime(message.sentAt)}
              </p>
              <p className={styles.bubble}>{message.content}</p>
              {alert && (
                <span className={styles.flagTag}>
                  <SeverityBadge severity={alert.severity}>
                    Flagged · {alert.category.name} · {alert.severity}
                  </SeverityBadge>
                </span>
              )}
            </li>
          )
        })}
      </ol>
    </section>
  )
}
