import { mockUsers } from '../mocks/users'
import { simulateNetwork } from '../mocks/simulateNetwork'
import type { ManagedUser } from '../types/managedUser'
import { httpClient } from './client'
import { USE_MOCKS } from './mockMode'

/** Admin endpoints: /api/admins/users and /api/admins/patients (Endpoints/Admin/AdminEndpoints.cs). */
const ENDPOINTS = {
  USERS: '/admins/users',
  ASSIGN_THERAPIST: (patientId: string) => `/admins/patients/${patientId}/therapist`,
}

/** All accounts, for the admin Users page. */
export async function getManagedUsers(): Promise<ManagedUser[]> {
  if (USE_MOCKS) {
    await simulateNetwork()
    return structuredClone(mockUsers)
  }
  const { data } = await httpClient.get<ManagedUser[]>(ENDPOINTS.USERS)
  return data
}

/** Assign a patient to a therapist, or unassign with null. */
export async function assignTherapist(patientId: string, therapistId: string | null): Promise<void> {
  if (USE_MOCKS) {
    await simulateNetwork()
    const patient = mockUsers.find((u) => u.id === patientId && u.role === 'Patient')
    if (patient) patient.therapistId = therapistId
    return
  }
  await httpClient.put(ENDPOINTS.ASSIGN_THERAPIST(patientId), { therapistId })
}
