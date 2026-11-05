import type { Role } from './auth'

/** A row on the admin Users page (not the signed-in User from types/auth.ts). */
export interface ManagedUser {
  id: string
  name: string
  role: Role
  /** Patients only: the assigned therapist's id, or null if unassigned. */
  therapistId: string | null
  /** e.g. "Acknowledged Sep 14", "Pending", "Not required". */
  disclosure: string
  accountStatus: 'Active' | 'Invited'
}
