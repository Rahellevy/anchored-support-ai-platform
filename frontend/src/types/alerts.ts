import type { MatchType, Severity } from './redFlagRules'

/** Backend enum Models.AlertStatus. */
export type AlertStatus = 'Open' | 'Acknowledged'

/**
 * One raised flag, shown on the Alerts page and in a conversation's sidebar.
 * Same shape as the backend's AlertDto (Models/Alerts.cs).
 */
export interface Alert {
  id: string
  patientId: string
  patientName: string
  conversationId: string
  /** The message that triggered the flag (highlighted in the transcript). */
  flaggedMessageId: string
  /** Null if the rule has since been deleted; ruleName still says what it was. */
  ruleId: number | null
  ruleName: string
  matchType: MatchType
  severity: Severity
  /** Why the AI check flagged it; null for phrase rules. */
  reason: string | null
  /** The full text of the flagged message. */
  flaggedText: string
  /** Later matches of the same rule in this conversation, grouped into this alert. */
  relatedMessages: number
  status: AlertStatus
  /** ISO date-times. */
  raisedAt: string
  acknowledgedAt: string | null
}
