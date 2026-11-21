import { Fragment } from 'react'
import type { ChatMessage } from '../../types/conversation'
import { formatDay, formatTime } from '../../utils/format'
import styles from './chat.module.css'

/**
 * The patient's view of their conversation: their messages on the right, the AI's on the left,
 * with a day label ("Tue", "Today") wherever the day changes, since it's one ongoing thread.
 * Unlike the therapist's Transcript, this never shows flags.
 */
export function MessageList({ messages, isReplying }: { messages: ChatMessage[]; isReplying: boolean }) {
  return (
    <>
      {messages.map((message, index) => {
        const day = formatDay(message.sentAt)
        const isNewDay = index === 0 || formatDay(messages[index - 1].sentAt) !== day

        return (
          <Fragment key={message.id}>
            {isNewDay && <p className={styles.daySeparator}>{day}</p>}
            <div className={`${styles.message} ${message.sender === 'Patient' ? styles.mine : styles.assistant}`}>
              <span className="visually-hidden">{message.sender === 'Patient' ? 'You' : 'Assistant'}, </span>
              {message.content}
              <time className={styles.time} dateTime={message.sentAt}>
                {formatTime(message.sentAt)}
              </time>
            </div>
          </Fragment>
        )
      })}
      {isReplying && (
        <div className={`${styles.message} ${styles.assistant} ${styles.typing}`}>Assistant is replying…</div>
      )}
    </>
  )
}
