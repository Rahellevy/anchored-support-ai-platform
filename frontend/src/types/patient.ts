/**
 * One row of the therapist dashboard. Same shape as the backend's PatientSummaryDto (DTOs/ProfileDtos.cs).
 * Each patient has one ongoing conversation.
 */
export interface Patient {
  id: string
  name: string
  /** ISO date-time of the latest message, or null if the patient has never chatted. */
  lastMessageAt: string | null
  /** Messages the patient sent in the last 7 days. */
  messagesLast7Days: number
  /** Open (unacknowledged) alerts by severity. */
  highFlags: number
  medFlags: number
  /** True when there are messages newer than the last review. */
  needsReview: boolean
  lastReviewedAt: string | null
  /** Where the dashboard's "Open" button goes; null if the patient has never chatted. */
  conversationId: string | null
}
