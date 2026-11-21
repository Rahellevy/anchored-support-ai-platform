import type { ButtonHTMLAttributes } from 'react'
import { Link } from 'react-router-dom'
import styles from './Button.module.css'

/**
 * The one button style for the whole app.
 *
 *   <Button>Save</Button>                               primary (plum)
 *   <Button variant="secondary" fullWidth>Sign up</Button>
 *   <Button variant="outline">Open</Button>             small outlined (table actions)
 *   <Button to="/register">Sign up</Button>             renders a link that looks like a button
 */
type ButtonVariant = 'primary' | 'secondary' | 'outline'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant
  /** Full-width, taller button (used on the login form). */
  fullWidth?: boolean
  /** If set, renders a react-router <Link> to this path instead of a <button>. */
  to?: string
}

export function Button({
  variant = 'primary',
  fullWidth = false,
  to,
  className,
  type = 'button',
  children,
  ...buttonProps
}: ButtonProps) {
  const classes = [styles.button, styles[variant], fullWidth && styles.fullWidth, className]
    .filter(Boolean)
    .join(' ')

  if (to) {
    return (
      <Link to={to} className={classes}>
        {children}
      </Link>
    )
  }

  return (
    <button type={type} className={classes} {...buttonProps}>
      {children}
    </button>
  )
}
