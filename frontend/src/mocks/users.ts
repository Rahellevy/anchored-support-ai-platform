import type { ManagedUser } from '../types/managedUser'

/**
 * Admin Users page rows. Patients p1–p5 are Dr. Morgan Hale's (t1), matching the therapist mocks.
 * Disclosure values are the backend's: "Acknowledged", "Pending" or "Not Required".
 */
export const mockUsers: ManagedUser[] = [
  { id: 'p1', name: 'Jordan Avery', role: 'Patient', therapistId: 't1', disclosure: 'Acknowledged', status: 'Active' },
  { id: 'p2', name: 'Sam Rivera', role: 'Patient', therapistId: 't1', disclosure: 'Acknowledged', status: 'Active' },
  { id: 'p3', name: 'Priya Nair', role: 'Patient', therapistId: 't1', disclosure: 'Acknowledged', status: 'Active' },
  { id: 'p4', name: 'Marcus Lee', role: 'Patient', therapistId: 't1', disclosure: 'Acknowledged', status: 'Active' },
  { id: 'p5', name: 'Elena Torres', role: 'Patient', therapistId: 't1', disclosure: 'Acknowledged', status: 'Active' },
  { id: 'p6', name: 'Casey Morgan', role: 'Patient', therapistId: 't2', disclosure: 'Acknowledged', status: 'Active' },
  { id: 'p7', name: 'Taylor Brooks', role: 'Patient', therapistId: null, disclosure: 'Pending', status: 'Active' },
  { id: 't1', name: 'Morgan Hale', role: 'Therapist', therapistId: null, disclosure: 'Not Required', status: 'Active' },
  { id: 't2', name: 'Alex Kim', role: 'Therapist', therapistId: null, disclosure: 'Not Required', status: 'Active' },
  { id: 'a1', name: 'Riley Chen', role: 'Admin', therapistId: null, disclosure: 'Not Required', status: 'Active' },
]
