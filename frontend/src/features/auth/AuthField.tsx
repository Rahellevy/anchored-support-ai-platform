import type { InputHTMLAttributes, ReactNode } from 'react'
import styles from './auth.module.css'

/**
 * Rounded input with an icon on the left, used on the login form.
 * The label is visually hidden (the placeholder shows instead) but still read by screen readers.
 *
 * `trailing` is an optional element on the right, e.g. the show/hide password button.
 * Any normal <input> prop (type, value, onChange, autoComplete...) is passed straight through.
 */
interface AuthFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  id: string
  label: string
  icon: ReactNode
  trailing?: ReactNode
}

export function AuthField({ id, label, icon, trailing, ...inputProps }: AuthFieldProps) {
  return (
    <div className={styles.field}>
      <label htmlFor={id} className="visually-hidden">
        {label}
      </label>
      <span className={styles.fieldIcon} aria-hidden="true">
        {icon}
      </span>
      <input id={id} className={styles.fieldInput} {...inputProps} />
      {trailing}
    </div>
  )
}
