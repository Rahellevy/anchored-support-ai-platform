import type { ReactNode } from 'react'
import styles from './Badge.module.css'

/**
 * Small colored pill for statuses. Pick the tone by meaning, not by color:
 *   danger  – high-severity flag        warning – medium flag
 *   pending – needs review              success – reviewed
 *   neutral – nothing / none
 * Colors come from the --badge-* tokens in index.css.
 */
export type BadgeTone = 'danger' | 'warning' | 'pending' | 'success' | 'neutral'

export const Badge = ({ tone, children }: { tone: BadgeTone; children: ReactNode }) => {
  return <span className={`${styles.badge} ${styles[tone]}`}>{children}</span>
}
