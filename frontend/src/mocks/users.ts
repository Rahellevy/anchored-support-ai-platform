import type { ManagedUser } from '../types/managedUser'

/** Admin Users page rows. Therapist ids are referenced by patients' therapistId. */
export const mockUsers: ManagedUser[] = [
  { id: 'p1', name: 'Jordan Avery', role: 'Patient', therapistId: 't1', disclosure: 'Acknowledged Sep 14', accountStatus: 'Active' },
  { id: 'p2', name: 'Sam Rivera', role: 'Patient', therapistId: 't1', disclosure: 'Acknowledged Sep 20', accountStatus: 'Active' },
  { id: 'p3', name: 'Priya Nair', role: 'Patient', therapistId: 't1', disclosure: 'Acknowledged Sep 22', accountStatus: 'Active' },
  { id: 'p4', name: 'Marcus Lee', role: 'Patient', therapistId: 't1', disclosure: 'Acknowledged Sep 25', accountStatus: 'Active' },
  { id: 'p5', name: 'Elena Torres', role: 'Patient', therapistId: 't1', disclosure: 'Acknowledged Oct 3', accountStatus: 'Active' },
  { id: 'p6', name: 'Casey Morgan', role: 'Patient', therapistId: 't2', disclosure: 'Acknowledged Oct 5', accountStatus: 'Active' },
  { id: 'p7', name: 'Taylor Brooks', role: 'Patient', therapistId: null, disclosure: 'Pending', accountStatus: 'Invited' },
  { id: 't1', name: 'Dr. Morgan Hale', role: 'Therapist', therapistId: null, disclosure: 'Not required', accountStatus: 'Active' },
  { id: 't2', name: 'Dr. Alex Kim', role: 'Therapist', therapistId: null, disclosure: 'Not required', accountStatus: 'Active' },
  { id: 'a1', name: 'Riley Chen', role: 'Admin', therapistId: null, disclosure: 'Not required', accountStatus: 'Active' },
]
