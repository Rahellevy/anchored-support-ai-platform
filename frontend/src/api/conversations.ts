import { mockConversations } from '../mocks/conversations'
import { simulateNetwork } from '../mocks/simulateNetwork'
import type { ConversationDetail } from '../types/conversation'

/** One conversation with all its messages, or null if not found. TODO(backend): httpClient.get(`/conversations/${id}`) */
export async function getConversation(conversationId: string): Promise<ConversationDetail | null> {
  await simulateNetwork()
  const conversation = mockConversations.find((c) => c.id === conversationId)
  return conversation ? structuredClone(conversation) : null
}

/** TODO(backend): httpClient.post(`/conversations/${id}/review`) */
export async function markConversationReviewed(conversationId: string): Promise<void> {
  await simulateNetwork()
  const conversation = mockConversations.find((c) => c.id === conversationId)
  if (conversation) conversation.reviewed = true
}
