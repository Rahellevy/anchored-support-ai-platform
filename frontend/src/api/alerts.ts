import { mockAlerts } from '../mocks/alerts'
import { simulateNetwork } from '../mocks/simulateNetwork'
import type { Alert } from '../types/alerts'
import { httpClient } from './client'
import { USE_MOCKS } from './mockMode'

/** Therapist endpoints: /api/therapists/alerts (Endpoints/Therapist/TherapistEndpoints.cs). */
const ENDPOINTS = {
  ALERTS: '/therapists/alerts',
  ACKNOWLEDGE: (alertId: string) => `/therapists/alerts/${alertId}/acknowledge`,
}

/** Alerts for the signed-in therapist's patients, newest first. */
export async function getAlerts(): Promise<Alert[]> {
  if (USE_MOCKS) {
    await simulateNetwork()
    return structuredClone(mockAlerts)
  }
  const { data } = await httpClient.get<Alert[]>(ENDPOINTS.ALERTS)
  return data
}

/** Marks an alert as acknowledged. Safe to repeat. */
export async function acknowledgeAlert(alertId: string): Promise<void> {
  if (USE_MOCKS) {
    await simulateNetwork()
    const alert = mockAlerts.find((a) => a.id === alertId)
    if (alert && alert.status === 'Open') {
      alert.status = 'Acknowledged'
      alert.acknowledgedAt = new Date().toISOString()
    }
    return
  }
  await httpClient.post(ENDPOINTS.ACKNOWLEDGE(alertId))
}
