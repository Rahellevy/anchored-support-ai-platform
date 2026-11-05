import { PageHeader } from '../components/PageHeader'
import {
  MessagesPerDayCard,
  NeedsAttentionCard,
  SpendingCard,
  SummaryCards,
  SystemStatusCard,
} from '../features/monitoring/MonitoringCards'
import { useMonitoringSummary } from '../features/monitoring/useMonitoring'
import styles from '../features/monitoring/monitoring.module.css'

/** /admin/monitoring: system health, activity and AI spending. Counts only, never conversation content. */
export function MonitoringPage() {
  const { data: summary, isPending, isError } = useMonitoringSummary()

  return (
    <>
      <title>Monitoring · Anchored Administration</title>
      <PageHeader
        title="Monitoring"
        description="System health, activity and AI spending. Counts only: this page never shows conversation content."
      />

      {isPending && <p>Loading…</p>}
      {isError && <p>Monitoring data couldn't be loaded.</p>}

      {summary && (
        <>
          <SummaryCards summary={summary} />
          <div className={styles.grid}>
            <MessagesPerDayCard days={summary.messagesPerDay} />
            <SystemStatusCard summary={summary} />
            <SpendingCard spending={summary.spending} />
            <NeedsAttentionCard items={summary.needsAttention} />
          </div>
        </>
      )}
    </>
  )
}
