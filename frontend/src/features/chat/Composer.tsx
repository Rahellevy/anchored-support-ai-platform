import { useState, type FormEvent } from 'react'
import styles from './chat.module.css'

/** Message box + send button. Calls onSend with the trimmed text and clears itself. */
interface ComposerProps {
  onSend: (text: string) => void
  disabled: boolean
  placeholder?: string
}

/** Matches the backend's limit in ChatHub.SendMessage and the Messages.Content column. */
const MAX_LENGTH = 4000

export function Composer({ onSend, disabled, placeholder = 'Type a message' }: ComposerProps) {
  const [text, setText] = useState('')
  const trimmed = text.trim()

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!trimmed || disabled) return
    onSend(trimmed)
    setText('')
  }

  return (
    <form className={styles.composer} onSubmit={handleSubmit} autoComplete="off">
      <label className="visually-hidden" htmlFor="message">
        Type a message
      </label>
      <input
        id="message"
        className={styles.input}
        type="text"
        placeholder={placeholder}
        maxLength={MAX_LENGTH}
        value={text}
        onChange={(e) => setText(e.target.value)}
        disabled={disabled}
      />
      <button className={styles.send} type="submit" aria-label="Send message" disabled={disabled || !trimmed}>
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M5 12h14M13 6l6 6-6 6" />
        </svg>
      </button>
    </form>
  )
}
