import {httpClient} from "./client.ts";
import {USE_MOCKS} from "./mockMode.ts";
import { mockUsers } from '../mocks/users'
import { simulateNetwork } from '../mocks/simulateNetwork'
import type { ManagedUser } from '../types/managedUser'

/** All accounts, for the admin Users page. TODO(backend): httpClient.get<ManagedUser[]>('/admin/users') */
export async function getManagedUsers(): Promise<ManagedUser[]> {
  if (USE_MOCKS){
    await simulateNetwork()
    return structuredClone(mockUsers)
  }
  const { data } = await httpClient.get<ManagedUser[]>("/admins/users");
  return data;
}

/** Assign a patient to a therapist (null = unassign). TODO(backend): httpClient.put(`/admin/patients/${patientId}/therapist`, { therapistId }) */
export async function assignTherapist(patientId: string, therapistId: string | null): Promise<void> {
  if (USE_MOCKS){
    await simulateNetwork()
    const patient = mockUsers.find((u) => u.id === patientId && u.role === 'Patient')
    if (patient) patient.therapistId = therapistId
  }
  const { data } =  await httpClient.put<void>(`/admins/patients/${patientId}/therapist`, { therapistId })
  return data;
}
