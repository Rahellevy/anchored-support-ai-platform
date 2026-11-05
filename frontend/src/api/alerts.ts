import { mockAlerts } from '../mocks/alerts'
import { simulateNetwork } from '../mocks/simulateNetwork'
import type { Alert } from '../types/flags'

/** Alerts for the signed-in therapist's patients. TODO(backend): httpClient.get<Alert[]>('/alerts') */
export async function getAlerts(): Promise<Alert[]> {
  await simulateNetwork()
  return structuredClone(mockAlerts)
}

/** TODO(backend): httpClient.post(`/alerts/${alertId}/acknowledge`) */
export async function acknowledgeAlert(alertId: string): Promise<void> {
  await simulateNetwork()
  const alert = mockAlerts.find((a) => a.id === alertId)
  if (alert) alert.status = 'Acknowledged'
}
