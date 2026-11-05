import { useNavigate } from 'react-router-dom'
import { Button } from '../components/Button'
import styles from './PlaceholderPage.module.css'
import {useAuth} from "../hooks/useAuth.ts";

/**
 * Stand-in for pages that aren't built yet (patient chat, admin, alerts),
 * so every role has a page to land on after login. Replace as real pages are built.
 */
export const PlaceholderPage = ({ title }: { title: string })=> {
  const { logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = async ()=> {
    await logout()
    navigate('/login', { replace: true })
  }

  return (
    <main className={styles.page}>
      <title>{`${title} · Anchored Support Services`}</title>

      <section className={styles.card}>
        <h1 className={styles.title}>{title}</h1>
        <p className={styles.text}>This page hasn't been built yet.</p>
        <div className={styles.actions}>
          <Button variant="secondary" onClick={() => navigate(-1)}>
            Go back
          </Button>
          <Button onClick={handleLogout}>Log out</Button>
        </div>
      </section>
    </main>
  )
}
