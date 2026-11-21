import { mockAlerts } from '../mocks/alerts'
import { mockConversations, mockReviewedAt, mockTherapistPatients } from '../mocks/conversations'
import { simulateNetwork } from '../mocks/simulateNetwork'
import type { Patient } from '../types/patient'
import { httpClient } from './client'
import { USE_MOCKS } from './mockMode'

/** Therapist endpoint: /api/therapists/me/patients (Endpoints/Therapist/TherapistEndpoints.cs). */
const ENDPOINTS = {
  MY_PATIENTS: '/therapists/me/patients',
}

/** The signed-in therapist's patients, one row each. */
export async function getMyPatients(): Promise<Patient[]> {
  if (USE_MOCKS) {
    await simulateNetwork()
    return mockPatientRows()
  }
  const { data } = await httpClient.get<Patient[]>(ENDPOINTS.MY_PATIENTS)
  return data
}

/**
 * Builds the rows the same way the backend does, from the mock conversations and alerts,
 * so acknowledging an alert or reviewing a conversation in mock mode updates the dashboard too.
 */
function mockPatientRows(): Patient[] {
  const weekAgo = Date.now() - 7 * 86_400_000
  return mockTherapistPatients.map(({ id, name }) => {
    const conversation = mockConversations.find((c) => c.patientId === id)
    const messages = conversation?.messages ?? []
    const lastMessageAt = messages.at(-1)?.sentAt ?? null
    const openAlerts = mockAlerts.filter((a) => a.patientId === id && a.status === 'Open')
    const lastReviewedAt = conversation ? (mockReviewedAt[conversation.id] ?? null) : null

    return {
      id,
      name,
      lastMessageAt,
      messagesLast7Days: messages.filter((m) => m.sender === 'Patient' && Date.parse(m.sentAt) >= weekAgo).length,
      highFlags: openAlerts.filter((a) => a.severity === 'High').length,
      medFlags: openAlerts.filter((a) => a.severity === 'Medium').length,
      needsReview: !!conversation && !!lastMessageAt && (!lastReviewedAt || lastReviewedAt < lastMessageAt),
      lastReviewedAt,
      conversationId: conversation?.id ?? null,
    }
  })
}
