import type { ReactNode } from 'react'
import type { Severity } from '../types/flags'
import { Badge, type BadgeTone } from './Badge'

const TONE: Record<Severity, BadgeTone> = { High: 'danger', Medium: 'warning', Low: 'low' }

/** Severity pill. Shows the severity name unless you pass custom text as children. */
export function SeverityBadge({ severity, children }: { severity: Severity; children?: ReactNode }) {
  return <Badge tone={TONE[severity]}>{children ?? severity}</Badge>
}
