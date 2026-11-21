import { Badge } from '../../components/Badge'
import { Button } from '../../components/Button'
import { Card } from '../../components/Card'
import { SeverityBadge } from '../../components/SeverityBadge'
import type { Alert } from '../../types/alerts'
import { formatDayTime, pluralize } from '../../utils/format'
import { detectedByLabel } from './labels'
import { useAcknowledgeAlert } from './useAlerts'
import styles from './alerts.module.css'

/** One alert: who, when, the flagged message, why it was flagged, and actions. */
export function AlertCard({ alert }: { alert: Alert }) {
  const acknowledge = useAcknowledgeAlert()
  const isOpen = alert.status === 'Open'

  const cardClasses = [
    styles.alert,
    alert.severity === 'High' ? styles.high : styles.medium,
    !isOpen && styles.acknowledged,
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <Card as="article" className={cardClasses} aria-label={`${alert.severity} alert for ${alert.patientName}`}>
      <div className={styles.head}>
        <SeverityBadge severity={alert.severity} />
        <span className={styles.patientName}>{alert.patientName}</span>
        <span className={styles.time}>{formatDayTime(alert.raisedAt)}</span>
        <span className={styles.status}>
          <Badge tone={isOpen ? 'pending' : 'success'}>{alert.status}</Badge>
        </span>
      </div>

      <p className={styles.quote}>
        “<mark>{alert.flaggedText}</mark>”
      </p>

      <dl className={styles.meta}>
        <div>
          <dt>Rule</dt>
          <dd>{alert.ruleName}</dd>
        </div>
        <div>
          <dt>Why flagged</dt>
          <dd>
            {detectedByLabel(alert)}
            {alert.reason && `: ${alert.reason}`}
          </dd>
        </div>
        <div>
          <dt>Grouped</dt>
          <dd>
            {alert.relatedMessages > 0
              ? `+${pluralize(alert.relatedMessages, 'related message')} in this conversation`
              : 'No related messages'}
          </dd>
        </div>
      </dl>

      <div className={styles.actions}>
        <Button to={`/therapist/conversations/${alert.conversationId}`}>Open conversation</Button>
        <Button
          variant="outline"
          disabled={!isOpen || acknowledge.isPending}
          onClick={() => acknowledge.mutate(alert.id)}
        >
          {isOpen ? 'Acknowledge' : 'Acknowledged'}
        </Button>
      </div>
    </Card>
  )
}
