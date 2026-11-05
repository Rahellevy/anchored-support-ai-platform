import { useState } from 'react'
import { Badge } from '../../components/Badge'
import { Button } from '../../components/Button'
import { SeverityBadge } from '../../components/SeverityBadge'
import type { Alert } from '../../types/flags'
import { formatTime, pluralize } from '../../utils/format'
import { useAcknowledgeAlert } from '../alerts/useAlerts'
import { useMarkConversationReviewed } from './useConversation'
import styles from './conversations.module.css'

/**
 * Sidebar card: details of the flag on this conversation, plus the two review actions.
 * `alert` is null when the conversation has no flag; the review button still shows.
 */
interface FlagDetailsCardProps {
  alert: Alert | null
  conversationId: string
  reviewed: boolean
}

export function FlagDetailsCard({ alert, conversationId, reviewed }: FlagDetailsCardProps) {
  const acknowledge = useAcknowledgeAlert()
  const markReviewed = useMarkConversationReviewed(conversationId)
  const [statusMessage, setStatusMessage] = useState('')

  const isOpen = alert?.status === 'Open'

  return (
    <section
      className={alert ? `${styles.sideCard} ${styles.flagCard}` : styles.sideCard}
      aria-labelledby="flag-heading"
    >
      <div className={styles.sideHead}>
        <h2 id="flag-heading">{alert ? 'Flag details' : 'Review'}</h2>
        {alert && <Badge tone={isOpen ? 'pending' : 'success'}>{alert.status}</Badge>}
      </div>

      {alert && (
        <dl className={styles.details}>
          <dt>Severity</dt>
          <dd>
            <SeverityBadge severity={alert.severity} />
          </dd>

          <dt>Category</dt>
          <dd>
            {alert.category.name} ({alert.category.code})
          </dd>

          <dt>Detected by</dt>
          <dd>{alert.detectedBy}</dd>

          <dt>Message</dt>
          <dd>
            {formatTime(alert.raisedAt)}
            {alert.relatedMessages > 0 && `, plus ${pluralize(alert.relatedMessages, 'related message')}`}
          </dd>

          <dt>Notified</dt>
          <dd>
            You, {alert.notifiedVia.toLowerCase()}, {formatTime(alert.raisedAt)}
          </dd>
        </dl>
      )}

      {alert && (
        <Button
          fullWidth
          className={styles.actionButton}
          disabled={!isOpen || acknowledge.isPending}
          onClick={() =>
            acknowledge.mutate(alert.id, { onSuccess: () => setStatusMessage('Flag acknowledged.') })
          }
        >
          {isOpen ? 'Acknowledge flag' : 'Flag acknowledged'}
        </Button>
      )}

      <Button
        variant="outline"
        fullWidth
        className={styles.actionButton}
        disabled={reviewed || markReviewed.isPending}
        onClick={() => markReviewed.mutate(undefined, { onSuccess: () => setStatusMessage('Conversation marked as reviewed.') })}
      >
        {reviewed ? 'Conversation reviewed' : 'Mark conversation reviewed'}
      </Button>

      {/* role="status" makes screen readers announce the result of the action */}
      <p className={styles.statusLine} role="status">
        {statusMessage}
      </p>
    </section>
  )
}
