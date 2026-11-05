import { useState } from 'react'
import { Card } from '../components/Card'
import { FilterTabs } from '../components/FilterTabs'
import { FlagDisclaimer } from '../components/FlagDisclaimer'
import { PageHeader } from '../components/PageHeader'
import { AlertCard } from '../features/alerts/AlertCard'
import { AlertsSidebar } from '../features/alerts/AlertsSidebar'
import { useAlerts } from '../features/alerts/useAlerts'
import styles from '../features/alerts/alerts.module.css'
import type { Alert } from '../types/flags'

type AlertFilter = 'open' | 'high' | 'medium' | 'acknowledged'

const SEVERITY_ORDER = { High: 0, Medium: 1, Low: 2 } as const

/** Highest severity first, then newest first. */
const bySeverityThenNewest = (a: Alert, b: Alert) =>
  SEVERITY_ORDER[a.severity] - SEVERITY_ORDER[b.severity] || b.raisedAt.localeCompare(a.raisedAt)

/** /therapist/alerts: triage list of raised flags. */
export function AlertsPage() {
  const { data: alerts = [], isPending } = useAlerts()
  const [filter, setFilter] = useState<AlertFilter>('open')

  const open = alerts.filter((a) => a.status === 'Open')
  const lists: Record<AlertFilter, Alert[]> = {
    open,
    high: open.filter((a) => a.severity === 'High'),
    medium: open.filter((a) => a.severity === 'Medium'),
    acknowledged: alerts.filter((a) => a.status === 'Acknowledged'),
  }
  const shown = [...lists[filter]].sort(bySeverityThenNewest)

  return (
    <>
      <title>Alerts to review · Anchored Clinician Portal</title>

      <PageHeader
        title="Alerts to review"
        description="Highest severity first. Repeated matches in one conversation are grouped into a single alert."
      />

      <FilterTabs
        label="Filter alerts"
        value={filter}
        onChange={setFilter}
        tabs={[
          { value: 'open', label: 'Open', count: lists.open.length },
          { value: 'high', label: 'High', count: lists.high.length },
          { value: 'medium', label: 'Medium', count: lists.medium.length },
          { value: 'acknowledged', label: 'Acknowledged', count: lists.acknowledged.length },
        ]}
      />

      <div className={styles.layout}>
        <section>
          <div className={styles.list}>
            {isPending && <Card className={styles.empty}>Loading alerts…</Card>}
            {!isPending && shown.length === 0 && <Card className={styles.empty}>Nothing to show in this view.</Card>}
            {shown.map((alert) => (
              <AlertCard key={alert.id} alert={alert} />
            ))}
          </div>
          <FlagDisclaimer />
        </section>

        <AlertsSidebar />
      </div>
    </>
  )
}
