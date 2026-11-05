/**
 * One row of the therapist dashboard.
 *
 * `lastConversation` and `lastReviewed` are display strings for now because the data is mocked.
 * When the real API exists, switch them to ISO dates and format them with utils/format.ts.
 */
export interface Patient {
  id: string
  name: string
  lastConversation: string
  conversationsLast7Days: number
  highFlags: number
  mediumFlags: number
  unreviewedConversations: number
  lastReviewed: string
  /** Where the dashboard's "Open" button goes; null if the patient has never chatted. */
  latestConversationId: string | null
}
