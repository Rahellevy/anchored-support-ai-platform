/**
 * Admin Monitoring page: GET /api/admins/monitoring. Same shape as the backend's MonitoringSummary
 * (Models/Monitoring.cs). Counts and spending only: nothing here may contain conversation content.
 */
export interface MonitoringSummary {
  accounts: { patients: number; therapists: number; admins: number }
  /** Last 7 days. */
  conversations: { activeConversations: number; messages: number }
  openAlerts: { high: number; medium: number }
  spending: {
    usedUsd: number
    budgetUsd: number
    /** `detail` is the purpose, e.g. "Chat replies". */
    byPurpose: { detail: string; usd: number }[]
  }
  /** Oldest first, last 7 days. `date` is an ISO timestamp for that day. */
  messagesPerDay: { date: string; count: number }[]
  services: { name: string; detail: string; working: boolean }[]
  /** When false, patients see a notice instead of AI replies. */
  aiRepliesEnabled: boolean
  /** `to` is a frontend route, e.g. "/admin/users". */
  needsAttention: { label: string; count: number; to: string }[]
}
