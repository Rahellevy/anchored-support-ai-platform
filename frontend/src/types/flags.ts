/** Red-flag types shared by alerts, conversations and the admin rules page. */

export type Severity = 'High' | 'Medium' | 'Low'

/** A red-flag category, e.g. { code: 'H1', name: 'Suicide risk' }. */
export interface FlagCategoryRef {
  code: string
  name: string
}

/** One raised flag, shown on the Alerts page and in a conversation's sidebar. */
export interface Alert {
  id: string
  patientId: string
  patientName: string
  conversationId: string
  /** The message that triggered the flag (highlighted in the transcript). */
  flaggedMessageId: string
  severity: Severity
  category: FlagCategoryRef
  /** Human-readable, e.g. "Phrase rule H1-03 and AI check (both matched)". */
  detectedBy: string
  /** ISO date-time. */
  raisedAt: string
  status: 'Open' | 'Acknowledged'
  /** The quote shown on the alert card; `flagged` is highlighted. */
  excerpt: { before: string; flagged: string; after: string }
  /** Other matches in the same conversation that were grouped into this alert. */
  relatedMessages: number
  /** How the therapist was notified, e.g. "In-app and email". */
  notifiedVia: string
}

export type DetectionMethod = 'rules' | 'llm' | 'both'
export type ApprovalStatus = 'Draft' | 'Pending review' | 'Approved'

export interface NotifySettings {
  therapistInApp: boolean
  therapistEmail: boolean
  admins: boolean
  groupRepeats: boolean
}

/** A configurable red-flag category on the admin Rules page. */
export interface RedFlagCategory extends FlagCategoryRef {
  severity: Severity
  detection: DetectionMethod
  /** Free-text phrases and examples used by the keyword rules and the AI check. */
  patterns: string
  notify: NotifySettings
  approval: ApprovalStatus
}
