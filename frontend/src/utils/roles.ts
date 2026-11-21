import type { Role } from '../types/auth'

/** How each role is written in the UI. */
export const ROLE_LABELS: Record<Role, string> = {
  Admin: 'Administrator',
  Therapist: 'Therapist',
  Patient: 'Patient',
}
