/** Matches the backend's MessageSender enum. */
export type MessageSender = 'Patient' | 'Assistant'

/** One chat message (same shape as the backend's MessageDto). */
export interface ChatMessage {
  id: string
  conversationId: string
  sender: MessageSender
  content: string
  /** ISO date-time. */
  sentAt: string
}

/** One item in a patient's own list of conversations (GET /api/conversations). */
export interface ConversationSummary {
  id: string
  /** ISO date-times. */
  startedAt: string
  lastMessageAt: string
  /** Short excerpt of the latest message, for the list. */
  preview: string
}

/** A conversation as a therapist reviews it. */
export interface ConversationDetail {
  id: string
  patientId: string
  patientName: string
  messages: ChatMessage[]
  reviewed: boolean
  /** AI-generated summary shown in the sidebar. */
  summary: string
}
