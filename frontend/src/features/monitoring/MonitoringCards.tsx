import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Badge } from '../../components/Badge'
import { Button } from '../../components/Button'
import { Card } from '../../components/Card'
import type { MonitoringSummary } from '../../types/monitoring'
import { formatDay, pluralize } from '../../utils/format'
import { useSetAiReplies } from './useMonitoring'
import styles from './monitoring.module.css'

/** Cards on the Monitoring page. Each takes the part of the summary it shows. */

const usd = (amount: number) => `$${amount.toFixed(2)}`

/** Top row: accounts, conversations, open alerts, budget. */
export function SummaryCards({ summary }: { summary: MonitoringSummary }) {
  const { accounts, conversations, openAlerts, spending } = summary
  const totalAccounts = accounts.patients + accounts.therapists + accounts.admins
  const percentUsed = Math.min(100, (spending.usedUsd / spending.budgetUsd) * 100)
  const meterTone = percentUsed >= 90 ? styles.meterDanger : percentUsed >= 75 ? styles.meterWarning : ''

  return (
    <div className={styles.stats}>
      <Card>
        <p className={styles.label}>Accounts</p>
        <p className={styles.big}>{totalAccounts}</p>
        <p className={styles.label}>
          {pluralize(accounts.patients, 'patient')} · {pluralize(accounts.therapists, 'therapist')} ·{' '}
          {pluralize(accounts.admins, 'admin')}
        </p>
      </Card>
      <Card>
        <p className={styles.label}>Patients chatting, 7 days</p>
        <p className={styles.big}>{conversations.activeConversations}</p>
        <p className={styles.label}>{conversations.messages} messages</p>
      </Card>
      <Card>
        <p className={styles.label}>Open alerts</p>
        <p className={styles.big}>{openAlerts.high + openAlerts.medium}</p>
        <div className={styles.badges}>
          <Badge tone="danger">{openAlerts.high} High</Badge>
          <Badge tone="warning">{openAlerts.medium} Medium</Badge>
        </div>
      </Card>
      <Card>
        <p className={styles.label}>AI spending, whole project</p>
        <p className={styles.big}>
          {usd(spending.usedUsd)} <span className={styles.of}>of {usd(spending.budgetUsd)}</span>
        </p>
        <div
          className={styles.meter}
          role="meter"
          aria-label="Budget used"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={Math.round(percentUsed)}
        >
          <div className={`${styles.meterFill} ${meterTone}`} style={{ width: `${percentUsed}%` }} />
        </div>
        <p className={styles.label}>Alerts at 50%, 75% and 90%; hard stop at {usd(spending.budgetUsd)}</p>
      </Card>
    </div>
  )
}

/** Simple bar chart: patient messages per day for the last 7 days. */
export function MessagesPerDayCard({ days }: { days: MonitoringSummary['messagesPerDay'] }) {
  const max = Math.max(1, ...days.map((d) => d.count))
  const total = days.reduce((sum, d) => sum + d.count, 0)

  return (
    <Card as="section">
      <div className={styles.cardHead}>
        <h2 className={styles.title}>Patient messages per day</h2>
        <span className={styles.label}>{total} in total</span>
      </div>
      <div className={styles.chart} role="img" aria-label={`Messages per day: ${days.map((d) => d.count).join(', ')}`}>
        {days.map((day) => (
          <div key={day.date} className={styles.barColumn}>
            <span className={styles.barValue}>{day.count}</span>
            <span className={styles.bar} style={{ height: `${(day.count / max) * 100}%` }} />
            <span className={styles.barLabel}>{formatDay(day.date)}</span>
          </div>
        ))}
      </div>
    </Card>
  )
}

/** Services and the switch that turns AI replies off for every patient. */
export function SystemStatusCard({ summary }: { summary: MonitoringSummary }) {
  const setAiReplies = useSetAiReplies()
  const [statusMessage, setStatusMessage] = useState('')
  const enabled = summary.aiRepliesEnabled

  function toggle() {
    setAiReplies.mutate(!enabled, {
      onSuccess: () =>
        setStatusMessage(
          enabled
            ? 'AI replies are off. Patients see a notice to contact the office instead.'
            : 'AI replies are back on.',
        ),
    })
  }

  return (
    <Card as="section">
      <h2 className={styles.title}>System status</h2>
      <ul className={styles.rows}>
        {summary.services.map((service) => (
          <li key={service.name}>
            <span>
              {service.name}
              <span className={styles.label}>{service.detail}</span>
            </span>
            <Badge tone={service.working ? 'success' : 'danger'}>{service.working ? 'Working' : 'Down'}</Badge>
          </li>
        ))}
        <li>
          <span>
            AI replies for patients
            <span className={styles.label}>{enabled ? 'On' : 'Off: patients see a notice instead'}</span>
          </span>
          <Button variant="outline" onClick={toggle} disabled={setAiReplies.isPending}>
            {enabled ? 'Turn off' : 'Turn on'}
          </Button>
        </li>
      </ul>
      <p className={styles.statusNote} role="status">
        {statusMessage}
      </p>
    </Card>
  )
}

/** Where the money went. One bar per purpose, as a share of total spending. */
export function SpendingCard({ spending }: { spending: MonitoringSummary['spending'] }) {
  return (
    <Card as="section">
      <div className={styles.cardHead}>
        <h2 className={styles.title}>AI spending by purpose</h2>
        <span className={styles.label}>{usd(spending.usedUsd)} total</span>
      </div>
      <ul className={styles.rows}>
        {spending.byPurpose.map((item) => {
          const share = spending.usedUsd > 0 ? Math.round((item.usd / spending.usedUsd) * 100) : 0
          return (
            <li key={item.purpose} className={styles.spendRow}>
              <span className={styles.spendText}>
                <span>{item.purpose}</span>
                <span>
                  {usd(item.usd)} · {share}%
                </span>
              </span>
              <span className={styles.meter}>
                <span className={styles.meterFill} style={{ width: `${share}%` }} />
              </span>
            </li>
          )
        })}
      </ul>
    </Card>
  )
}

export function NeedsAttentionCard({ items }: { items: MonitoringSummary['needsAttention'] }) {
  return (
    <Card as="section">
      <h2 className={styles.title}>Needs attention</h2>
      <ul className={styles.rows}>
        {items.map((item) => (
          <li key={item.label}>
            <Link to={item.to} className={styles.link}>
              {item.label}
            </Link>
            <Badge tone={item.count > 0 ? 'warning' : 'success'}>{item.count}</Badge>
          </li>
        ))}
      </ul>
    </Card>
  )
}
