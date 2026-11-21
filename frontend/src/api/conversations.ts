import { isAxiosError } from 'axios'
import { mockConversations, mockReviewedAt } from '../mocks/conversations'
import { simulateNetwork } from '../mocks/simulateNetwork'
import type { ConversationDetail } from '../types/conversation'
import { httpClient } from './client'
import { USE_MOCKS } from './mockMode'

/** Therapist endpoints: /api/therapists/conversations (Endpoints/Therapist/TherapistEndpoints.cs). */
const ENDPOINTS = {
  CONVERSATION: (id: string) => `/therapists/conversations/${id}`,
  REVIEW: (id: string) => `/therapists/conversations/${id}/review`,
}

/**
 * One of the therapist's patients' conversations with all its messages, or null if it doesn't exist
 * (the backend also answers 404 for a conversation that belongs to another therapist's patient).
 */
export async function getConversation(conversationId: string): Promise<ConversationDetail | null> {
  if (USE_MOCKS) {
    await simulateNetwork()
    const conversation = mockConversations.find((c) => c.id === conversationId)
    return conversation ? structuredClone(conversation) : null
  }
  try {
    const { data } = await httpClient.get<ConversationDetail>(ENDPOINTS.CONVERSATION(conversationId))
    return data
  } catch (error) {
    if (isAxiosError(error) && error.response?.status === 404) return null
    throw error
  }
}

/** Records that the therapist has reviewed the conversation up to now. */
export async function markConversationReviewed(conversationId: string): Promise<void> {
  if (USE_MOCKS) {
    await simulateNetwork()
    const conversation = mockConversations.find((c) => c.id === conversationId)
    if (conversation) {
      conversation.reviewed = true
      mockReviewedAt[conversationId] = new Date().toISOString()
    }
    return
  }
  await httpClient.post(ENDPOINTS.REVIEW(conversationId))
}
