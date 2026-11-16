import { mockUsers } from '../mocks/users'
import { simulateNetwork } from '../mocks/simulateNetwork'
import type { ManagedUser } from '../types/managedUser'
import { httpClient } from './client'
import { USE_MOCKS } from './mockMode'

/** Get user accounts for the administrator's Users page. */
export async function getManagedUsers(): Promise<ManagedUser[]> {
  if (USE_MOCKS) {
    await simulateNetwork()
    return structuredClone(mockUsers)
  }

  const { data } = await httpClient.get<ManagedUser[]>('/admins/users')
  return data
}

/** Assign a patient to a therapist; null removes the assignment. */
export async function assignTherapist(patientId: string, therapistId: string | null): Promise<void> {
  if (USE_MOCKS) {
    await simulateNetwork()
    const patient = mockUsers.find((u) => u.id === patientId && u.role === 'Patient')
    if (patient) patient.therapistId = therapistId
    return
  }

  await httpClient.put(`/admins/patients/${encodeURIComponent(patientId)}/therapist`, { therapistId })
}
