import { isAxiosError } from 'axios'
import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Button } from '../../components/Button'
import { EyeIcon, LockIcon, UserIcon } from '../../components/Icons'
import { useAuth } from '../../hooks/useAuth'
import type { LoginRequest } from '../../types/auth'
import { homePathFor } from '../../utils/homePath'
import { AuthField } from './AuthField'
import styles from './auth.module.css'

/**
 * Email + password sign-in.
 * On success the user is sent to their role's home page (see utils/homePath.ts).
 */
export const LoginForm = () => {
  const { login, isLoggingIn } = useAuth()
  const navigate = useNavigate()

  // Form state: React owns the input values instead of reading them from the DOM.
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [rememberMe, setRememberMe] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault() // stop the browser's full-page form submit

    if (!email.trim() || !password) {
      setError('Please enter your email and password.')
      return
    }

    setError(null)
    try {
      const loginRequest: LoginRequest = { email: email.trim(), password, rememberMe }

      // Use the user that login() returns. `user` from useAuth() would still be the
      // value from before this click until the component re-renders.
      const signedIn = await login({ loginRequest })

      const home = homePathFor(signedIn)
      if (home) navigate(home, { replace: true })
      else setError("Your account doesn't have access to a portal yet.")
    } catch (err) {
      setError(loginErrorMessage(err))
    }
  }

  return (
    <form className={styles.form} onSubmit={handleSubmit} noValidate>
      <h1 className={styles.title}>Log in</h1>

      <AuthField
        id="email"
        label="Email"
        icon={<UserIcon />}
        type="email"
        placeholder="Email"
        autoComplete="username"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
      />

      <AuthField
        id="password"
        label="Password"
        icon={<LockIcon />}
        type={showPassword ? 'text' : 'password'}
        placeholder="Password"
        autoComplete="current-password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        required
        trailing={
          <button
            type="button"
            className={styles.passwordToggle}
            aria-label={showPassword ? 'Hide password' : 'Show password'}
            aria-pressed={showPassword}
            onClick={() => setShowPassword((shown) => !shown)}
          >
            <EyeIcon crossedOut={showPassword} />
          </button>
        }
      />

      <div className={styles.optionsRow}>
        <label className={styles.checkbox}>
          <input type="checkbox" checked={rememberMe} onChange={(e) => setRememberMe(e.target.checked)} />
          <span>Remember me</span>
        </label>
        {/* TODO: /forgot-password page not built yet */}
        <Link to="/forgot-password" className={styles.link}>
          Forgot password?
        </Link>
      </div>

      {error && (
        <p className={styles.error} role="alert">
          {error}
        </p>
      )}

      <Button type="submit" fullWidth disabled={isLoggingIn}>
        {isLoggingIn ? 'Logging in…' : 'Log in'}
      </Button>

      <p className={styles.divider}>
        <span>Or</span>
      </p>

      {/* TODO: /register page not built yet */}
      <Button to="/register" variant="secondary" fullWidth>
        Sign up
      </Button>

      <p className={styles.note}>This system is not a crisis or emergency service.</p>
    </form>
  )
}

/** Turns a failed login into a message that's safe to show the user. */
const loginErrorMessage = (error: unknown): string => {
  if (isAxiosError(error) && error.response) {
    const { status, data } = error.response
    if (status === 401) return 'Email or password is incorrect.'
    if (status === 400) return 'Please check your email and password.'
    if (status === 403) return data?.detail ?? 'Your account cannot sign in yet.' // server's message, not axios's
  }
  return 'Could not reach the server. Please try again.'
}
