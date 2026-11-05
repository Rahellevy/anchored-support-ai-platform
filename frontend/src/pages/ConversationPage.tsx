import { Link, useParams } from 'react-router-dom'
import { Badge } from '../components/Badge'
import { Card } from '../components/Card'
import { PageHeader } from '../components/PageHeader'
import { useAlerts } from '../features/alerts/useAlerts'
import { FlagDetailsCard } from '../features/conversations/FlagDetailsCard'
import { Transcript } from '../features/conversations/Transcript'
import { useConversation } from '../features/conversations/useConversation'
import styles from '../features/conversations/conversations.module.css'
import { formatTimeRange, pluralize } from '../utils/format'

/**
 * /therapist/conversations/:conversationId: the original, unedited conversation for review,
 * with the flag details and review actions in the sidebar.
 */
export function ConversationPage() {
  const { conversationId = '' } = useParams()
  const { data: conversation, isPending } = useConversation(conversationId)
  const { data: allAlerts = [] } = useAlerts()

  const backLink = (
    <Link to="/therapist" className={styles.backLink}>
      ← Your patients
    </Link>
  )

  if (isPending) return <p>Loading conversation…</p>
  if (!conversation) {
    return (
      <>
        {backLink}
        <Card>That conversation could not be found.</Card>
      </>
    )
  }

  const alerts = allAlerts.filter((alert) => alert.conversationId === conversation.id)
  // The sidebar shows the open alert if there is one, otherwise the most recent one.
  const mainAlert = alerts.find((alert) => alert.status === 'Open') ?? alerts[0] ?? null

  const { messages } = conversation
  const timeRange = messages.length > 0 ? formatTimeRange(messages[0].sentAt, messages[messages.length - 1].sentAt) : ''

  return (
    <>
      <title>{`Conversation – ${conversation.patientName} · Anchored Clinician Portal`}</title>

      {backLink}
      <PageHeader
        eyebrow="Original conversation · Unedited"
        title={timeRange}
        description={`${conversation.patientName} (synthetic) · ${pluralize(messages.length, 'message')} · Stored exactly as exchanged`}
      />

      <div className={styles.layout}>
        <Transcript messages={messages} alerts={alerts} />

        <aside className={styles.side}>
          <FlagDetailsCard alert={mainAlert} conversationId={conversation.id} reviewed={conversation.reviewed} />

          <section className={styles.sideCard} aria-labelledby="summary-heading">
            <h2 className="visually-hidden" id="summary-heading">
              AI-generated summary
            </h2>
            <Badge tone="pending">AI-generated summary</Badge>
            <p className={styles.summaryText}>{conversation.summary}</p>
          </section>

          <p className={styles.auditNote}>Your viewing of this conversation is recorded in the audit log.</p>
        </aside>
      </div>
    </>
  )
}
