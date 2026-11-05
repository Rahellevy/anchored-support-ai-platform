/**
 * One row of the therapist dashboard.
 *
 * Dates are display strings for now because the data is mocked.
 * When the real API exists, switch them to ISO date strings and format them in the UI.
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
}
