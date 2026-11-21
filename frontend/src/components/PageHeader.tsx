import type { ReactNode } from 'react'
import styles from './PageHeader.module.css'

/**
 * Title block at the top of a page, with optional controls on the right.
 *   <PageHeader title="Alerts to review" description="..." actions={<Button>...</Button>} />
 */
interface PageHeaderProps {
  title: string
  eyebrow?: string
  description?: ReactNode
  actions?: ReactNode
}

export function PageHeader({ title, eyebrow, description, actions }: PageHeaderProps) {
  return (
    <div className={styles.header}>
      <div>
        {eyebrow && <p className={styles.eyebrow}>{eyebrow}</p>}
        <h1 className={styles.title}>{title}</h1>
        {description && <p className={styles.description}>{description}</p>}
      </div>
      {actions && <div className={styles.actions}>{actions}</div>}
    </div>
  )
}
