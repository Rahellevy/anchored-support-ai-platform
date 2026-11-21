import { Outlet } from 'react-router-dom'
import { AppHeader, type AppHeaderProps } from './AppHeader'
import { SafetyBanner } from './SafetyBanner'
import styles from './PortalLayout.module.css'

/**
 * Shared frame for a portal: header + safety banner + page content.
 * Used as a parent route in App.tsx; the matched child page renders where <Outlet /> is,
 * so pages only contain their own content.
 */
export function PortalLayout({ header, bannerMessage }: { header: AppHeaderProps; bannerMessage?: string }) {
  return (
    <div className={styles.page}>
      <AppHeader {...header} />
      <SafetyBanner message={bannerMessage} />
      <main className={styles.main}>
        <Outlet />
      </main>
    </div>
  )
}
