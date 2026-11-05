import { mockPatients } from '../mocks/patients'
import { simulateNetwork } from '../mocks/simulateNetwork'
import type { Patient } from '../types/patient'

/** The signed-in therapist's patients. TODO(backend): httpClient.get<Patient[]>('/therapists/me/patients') */
export async function getMyPatients(): Promise<Patient[]> {
  await simulateNetwork()
  return structuredClone(mockPatients)
}
