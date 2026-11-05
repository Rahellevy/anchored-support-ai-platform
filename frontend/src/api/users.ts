import { mockUsers } from '../mocks/users'
import { simulateNetwork } from '../mocks/simulateNetwork'
import type { ManagedUser } from '../types/managedUser'

/** All accounts, for the admin Users page. TODO(backend): httpClient.get<ManagedUser[]>('/admin/users') */
export async function getManagedUsers(): Promise<ManagedUser[]> {
  await simulateNetwork()
  return structuredClone(mockUsers)
}

/** Assign a patient to a therapist (null = unassign). TODO(backend): httpClient.put(`/admin/patients/${patientId}/therapist`, { therapistId }) */
export async function assignTherapist(patientId: string, therapistId: string | null): Promise<void> {
  await simulateNetwork()
  const patient = mockUsers.find((u) => u.id === patientId && u.role === 'Patient')
  if (patient) patient.therapistId = therapistId
}
