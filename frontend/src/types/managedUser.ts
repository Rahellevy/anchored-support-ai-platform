import type { Role } from './auth'

/** A row on the admin Users page. Same shape as the backend's ManagedUserResponse (DTOs/ProfileDtos.cs). */
export interface ManagedUser {
  id: string
  name: string
  role: Role
  /** Patients only: the assigned therapist's user id, or null if unassigned. */
  therapistId: string | null
  /** "Acknowledged" (both disclosures accepted), "Pending" or "Not Required" (staff). */
  disclosure: string
  status: 'Active' | 'Inactive'
}
