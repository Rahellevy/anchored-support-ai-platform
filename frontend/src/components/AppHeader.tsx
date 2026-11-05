import { NavLink, useNavigate } from 'react-router-dom'
import logo from '../assets/logo.png'
import { Button } from './Button'
import { BellIcon } from './Icons'
import styles from './AppHeader.module.css'
import {useAuth} from "../hooks/useAuth.ts";

/**
 * Top bar for a portal: logo + portal name, page links, notifications and the signed-in user.
 *
 *   <AppHeader
 *     subtitle="Clinician portal"
 *     links={[{ to: '/therapist', label: 'Patients' }]}
 *     notificationCount={2}
 *   />
 */
interface HeaderLink {
  to: string
  label: string
}

interface AppHeaderProps {
  subtitle: string
  links: HeaderLink[]
  notificationCount?: number
}

export const AppHeader = ({ subtitle, links, notificationCount = 0 }: AppHeaderProps) => {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
    const handleLogout = async () => {
    await logout()
    navigate('/login', { replace: true })
  }

  return (
    <header className={styles.header}>
      <div className={styles.brand}>
        <img className={styles.logo} src={logo} alt="Anchored Support Services logo" width={60} height={60} />
        <span className={styles.name}>Anchored</span>
        <span className={styles.subtitle}>{subtitle}</span>
      </div>

      <nav className={styles.nav} aria-label="Main">
        {links.map((link) => (
          // `end` = only highlight on an exact URL match
          <NavLink
            key={link.to}
            to={link.to}
            end
            className={({ isActive }) => (isActive ? `${styles.navLink} ${styles.active}` : styles.navLink)}
          >
            {link.label}
          </NavLink>
        ))}
      </nav>

      <div className={styles.userArea}>
        <button className={styles.bell} aria-label={`Notifications, ${notificationCount} unread`}>
          <BellIcon size={22} />
          {notificationCount > 0 && <span className={styles.bellCount}>{notificationCount}</span>}
        </button>

        {user && (
          <span className={styles.userName}>
            {user.firstName ?? user.email} · {user.roles.join(', ')}
          </span>
        )}

        <Button variant="outline" onClick={handleLogout}>
          Log out
        </Button>
      </div>
    </header>
  )
}
