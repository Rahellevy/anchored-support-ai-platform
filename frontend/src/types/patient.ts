/**
 * One row of the therapist dashboard.
 *
 * `lastConversation` and `lastReviewed` are display strings for now because the data is mocked.
 * When the real API exists, switch them to ISO dates and format them with utils/format.ts.
 */
export interface Patient {
  id: string
  name: string
  lastMessageAt: string | null
  messagesLast7Days: number
  highFlags: number
  mediumFlags: number
  needsReview: boolean
  lastReviewedAt: string | null
  /** Where the dashboard's "Open" button goes; null if the patient has never chatted. */
  conversationId: string | null
}
