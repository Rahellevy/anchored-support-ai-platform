import { Link, useLocation, useNavigate } from 'react-router-dom'
import logo from '../assets/logo.png'
import { useAuth } from '../hooks/useAuth'
import { ROLE_LABELS } from '../utils/roles'
import { Button } from './Button'
import { BellIcon } from './Icons'
import styles from './AppHeader.module.css'

/**
 * Top bar for a portal: logo + portal name, page links, notifications and the signed-in user.
 * Usually rendered by PortalLayout, not directly by pages.
 */
export interface HeaderLink {
  to: string
  label: string
  /** Extra URL prefixes that should also highlight this link (e.g. conversations under "Patients"). */
  alsoActiveFor?: string[]
}

export interface AppHeaderProps {
  subtitle: string
  links: HeaderLink[]
  /** Where the bell goes. Leave out to hide the bell (admin portal). */
  notificationsTo?: string
  notificationCount?: number
  /** Smaller brand text and links, for portals with many nav links. */
  compact?: boolean
}

export function AppHeader({ subtitle, links, notificationsTo, notificationCount = 0, compact = false }: AppHeaderProps) {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const { pathname } = useLocation()

  const isActive = (link: HeaderLink) =>
    pathname === link.to || (link.alsoActiveFor ?? []).some((prefix) => pathname.startsWith(prefix))

  async function handleLogout() {
    await logout()
    navigate('/login', { replace: true })
  }

  return (
    <header className={compact ? `${styles.header} ${styles.compact}` : styles.header}>
      <div className={styles.brand}>
        <img className={styles.logo} src={logo} alt="Anchored Support Services logo" width={60} height={60} />
        {/* Name and portal name stacked, so the brand stays narrow enough for a centered nav */}
        <div>
          <span className={styles.name}>Anchored Support Services</span>
          <span className={styles.subtitle}>{subtitle}</span>
        </div>
      </div>

      <nav className={styles.nav} aria-label="Main">
        {links.map((link) => {
          const active = isActive(link)
          return (
            <Link
              key={link.to}
              to={link.to}
              className={active ? `${styles.navLink} ${styles.active}` : styles.navLink}
              aria-current={active ? 'page' : undefined}
            >
              {link.label}
            </Link>
          )
        })}
      </nav>

      <div className={styles.userArea}>
        {notificationsTo && (
          <Link to={notificationsTo} className={styles.bell} aria-label={`Alerts, ${notificationCount} open`}>
            <BellIcon size={22} />
            {notificationCount > 0 && <span className={styles.bellCount}>{notificationCount}</span>}
          </Link>
        )}

        {user && (
          <span className={styles.userName}>
            {user.firstName} {user.lastName} · {user.roles.map((role) => ROLE_LABELS[role]).join(', ')}
          </span>
        )}

        <Button variant="outline" onClick={handleLogout}>
          Log out
        </Button>
      </div>
    </header>
  )
}
