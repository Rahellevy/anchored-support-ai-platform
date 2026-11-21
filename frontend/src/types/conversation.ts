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

/** A conversation as a therapist reviews it (the backend's ConversationDetailDto). */
export interface ConversationDetail {
  id: string
  patientId: string
  patientName: string
  messages: ChatMessage[]
  /** True when the therapist has reviewed it since the latest message. */
  reviewed: boolean
  /** AI-generated summary. Empty until summaries are built. */
  summary: string
}
