import type {MatchType, Severity} from "./redFlagRules.ts";

/** Red-flag types shared by alerts, conversations and the admin rules page. */

/** One raised flag, shown on the Alerts page and in a conversation's sidebar. */
export interface Alert {
  id: string
  patientId: string
  patientName: string
  conversationId: string
  /** The message that triggered the flag (highlighted in the transcript). */
  flaggedMessageId: string
  severity: Severity
  ruleId: number | null,
  ruleName: string,
  /** Human-readable, e.g. "Phrase rule H1-03 and AI check (both matched)". */
  matchType: MatchType
  reason?: string
  /** ISO date-time. */
  raisedAt: string
  status: 'Open' | 'Acknowledged'
  /** The quote shown on the alert card; `flagged` is highlighted. */
  flaggedText: string
  /** Other matches in the same conversation that were grouped into this alert. */
  relatedMessages: number
  acknowledgeAt?: string
}
