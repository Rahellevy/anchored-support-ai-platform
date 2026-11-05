import { isAxiosError } from 'axios'
import { mockGetMessages, mockGetMyConversation, mockStartMyConversation } from '../mocks/patientChat'
import { simulateNetwork } from '../mocks/simulateNetwork'
import type { ChatMessage } from '../types/conversation'
import { httpClient } from './client'
import { USE_MOCKS } from './mockMode'

/**
 * The signed-in patient's conversation. Each patient has exactly ONE ongoing conversation.
 * Sending messages is NOT here: that goes through the SignalR hub (features/chat/chatTransport.ts).
 */

/** GET /api/conversations/mine → { id }, or null (404) if the patient has never chatted. */
export async function getMyConversation(): Promise<{ id: string } | null> {
  if (USE_MOCKS) {
    await simulateNetwork()
    return mockGetMyConversation()
  }
  try {
    const { data } = await httpClient.get<{ id: string }>('/conversations/mine')
    return data
  } catch (error) {
    if (isAxiosError(error) && error.response?.status === 404) return null
    throw error
  }
}

/**
 * POST /api/conversations → { id }. Creates the patient's conversation.
 * The backend should make this safe to repeat: if one already exists, return it instead of
 * creating a second (a unique index on Conversations.PatientId guarantees it).
 * `firstName` is only used by the mock greeting.
 */
export async function startMyConversation(firstName: string): Promise<{ id: string }> {
  if (USE_MOCKS) {
    await simulateNetwork()
    return mockStartMyConversation(firstName)
  }
  const { data } = await httpClient.post<{ id: string }>('/conversations')
  return data
}

/** Messages in the conversation, oldest first. */
export async function getMessages(conversationId: string): Promise<ChatMessage[]> {
  if (USE_MOCKS) {
    await simulateNetwork()
    const messages = mockGetMessages(conversationId)
    if (!messages) throw new Error('Conversation not found.')
    return messages
  }
  // TODO: page this (?limit=50&before=...) — a single ongoing conversation keeps growing
  const { data } = await httpClient.get<ChatMessage[]>(`/conversations/${conversationId}/messages`)
  return data
}

/** The patient's assigned therapist, for "your therapist, Dr. ..., can read this". */
export async function getMyTherapist(): Promise<{ name: string } | null> {
  if (USE_MOCKS) {
    await simulateNetwork()
    return { name: 'Dr. Morgan Hale' }
  }
  const { data } = await httpClient.get<{ name: string } | null>('/patients/me/therapist')
  return data
}
