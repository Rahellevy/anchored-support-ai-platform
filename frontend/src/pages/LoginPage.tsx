import { Navigate } from 'react-router-dom'
import logo from '../assets/logo.png'
import { LoginForm } from '../features/auth/LoginForm'
import { homePathFor } from '../utils/homePath'
import styles from './LoginPage.module.css'
import {useAuth} from "../hooks/useAuth.ts";

/**
 * /login: frosted card with the logo and login form, over a logo watermark.
 * Already signed in? Skip straight to the user's home page.
 */
export const LoginPage = ()=> {
  const { user, isLoggingIn } = useAuth();

  if (isLoggingIn) return null
  const home = user && homePathFor(user)
  if (home) return <Navigate to={home} replace />

  return (
    <main className={styles.page}>
      {/* React 19 moves <title> into the document <head> automatically */}
      <title>Log in · Anchored Support Services</title>

      <section className={styles.card}>
        <img className={styles.logo} src={logo} alt="Anchored Support Services logo" width={160} height={160} />
        <LoginForm />
      </section>
    </main>
  )
}
