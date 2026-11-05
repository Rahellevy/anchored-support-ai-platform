import type { ReactNode } from 'react'
import logo from '../assets/logo.png'
import styles from './PatientHeader.module.css'

/**
 * Simple top bar for patient screens: logo, title, optional subtitle, and controls on the right.
 * (The clinician/admin portals use AppHeader instead, which has navigation.)
 */
interface PatientHeaderProps {
  title: string
  subtitle?: string
  actions?: ReactNode
}

export function PatientHeader({ title, subtitle, actions }: PatientHeaderProps) {
  return (
    <header className={styles.header}>
      <div className={styles.brand}>
        <img className={styles.logo} src={logo} alt="Anchored Support Services logo" width={56} height={56} />
        <div>
          <div className={styles.title}>{title}</div>
          {subtitle && <div className={styles.subtitle}>{subtitle}</div>}
        </div>
      </div>
      {actions && <div className={styles.actions}>{actions}</div>}
    </header>
  )
}
