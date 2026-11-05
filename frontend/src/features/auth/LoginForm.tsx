import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Button } from '../../components/Button'
import { EyeIcon, LockIcon, UserIcon } from '../../components/Icons'
import { useAuth } from "../../hooks/useAuth.ts";
import { homePathFor } from '../../utils/homePath'
import { AuthField } from './AuthField'
import styles from './auth.module.css'
import type {LoginRequest} from "../../types/auth.ts";
import {AxiosError} from "axios";

/**
 * Email + password sign-in.
 * On success the user is sent to their role's home page (see utils/homePath.ts).
 */
export const LoginForm = () => {
  const { user, login } = useAuth()
  const navigate = useNavigate()

  // Form state: React owns the input values instead of reading them from the DOM.
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [rememberMe, setRememberMe] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
    
    const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault() // stop the browser's full-page form submit

    if (!email.trim() || !password) {
      setError('Please enter your email and password.')
      return
    }

    setError(null)
    setIsSubmitting(true)
    try {
        const loginRequest: LoginRequest = {
            email: email.trim(),
            password: password
        }
      await login({ loginRequest })
        
        if (user === null){
            setError(`Email and/or password was invalid`);
            return;
        } 
      const home = homePathFor(user)
        
      if (home) {
          navigate(home, {replace: true})
      }
      else {
          setError("Your account doesn't have access to a portal yet.")
      }
    } catch (err) {
      setError(loginErrorMessage(err))
    } finally {
      setIsSubmitting(false)
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

      <Button type="submit" fullWidth disabled={isSubmitting}>
        {isSubmitting ? 'Logging in…' : 'Log in'}
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
  if (error instanceof AxiosError) {
    if (error.status === 401) return 'Email or password is incorrect.'
    if (error.status === 403) return error.message // e.g. "Your account is awaiting approval."
  }
  return 'Could not reach the server. Please try again.'
}
