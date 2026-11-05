import type { ReactNode } from 'react'

/**
 * Small line icons used across the app (24×24 grid, colored by the parent's CSS `color`).
 * Decorative: hidden from screen readers. Give the surrounding button an aria-label instead.
 */
interface IconProps {
  size?: number
}

const IconBase = ({ size = 18, children }: IconProps & { children: ReactNode }) => {
  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {children}
    </svg>
  )
}

export const UserIcon = (props: IconProps) => {
  return (
    <IconBase {...props}>
      <circle cx="12" cy="8" r="4" />
      <path d="M4 21c0-4 4-6 8-6s8 2 8 6" />
    </IconBase>
  )
}

export const LockIcon = (props: IconProps) => {
  return (
    <IconBase {...props}>
      <rect x="5" y="11" width="14" height="10" rx="2" />
      <path d="M8 11V8a4 4 0 0 1 8 0v3" />
    </IconBase>
  )
}

/** Eye icon; `crossedOut` adds a slash (used while the password is visible). */
export const EyeIcon = ({ crossedOut = false, ...props }: IconProps & { crossedOut?: boolean }) => {
  return (
    <IconBase {...props}>
      <path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12z" />
      <circle cx="12" cy="12" r="3" />
      {crossedOut && <path d="M3 3l18 18" />}
    </IconBase>
  )
}

export const BellIcon = (props: IconProps) => {
  return (
    <IconBase {...props}>
      <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
      <path d="M10.3 21a1.9 1.9 0 0 0 3.4 0" />
    </IconBase>
  )
}
