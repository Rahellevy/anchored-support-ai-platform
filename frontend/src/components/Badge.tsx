import type { ReactNode } from 'react'
import styles from './Badge.module.css'

/**
 * Small colored pill for statuses. Pick the tone by meaning, not by color:
 *   danger  – high severity             warning – medium severity, drafts
 *   low     – low severity              pending – needs review, open, invited
 *   success – reviewed, acknowledged    neutral – nothing / none / not required
 * Colors come from the --badge-* tokens in index.css.
 */
export type BadgeTone = 'danger' | 'warning' | 'low' | 'pending' | 'success' | 'neutral'

export function Badge({ tone, children }: { tone: BadgeTone; children: ReactNode }) {
  return <span className={`${styles.badge} ${styles[tone]}`}>{children}</span>
}
