/** Red-flag rules, matching the backend's RedFlagRuleResponse and request DTOs (DTOs/RedFlags/RedFlagDtos.cs). */

/** Backend enum Models.Severity, serialized as a string. */
export type Severity = 'High' | 'Medium' | 'Low'

/**
 * Backend enum Models.MatchType, serialized as a string.
 *  - Phrase: the pattern is a word or phrase, matched case-insensitively as whole words.
 *  - Llm:    the pattern is a plain-language description; an AI check decides whether a message matches.
 */
export type MatchType = 'Phrase' | 'Llm'

/** GET /api/admins/red-flag-rules (one item). */
export interface RedFlagRule {
  id: number
  name: string
  pattern: string
  matchType: MatchType
  severity: Severity
  enabled: boolean
  /** ISO date-time. */
  createdAt: string
}

/** Body of POST /api/admins/red-flag-rules. New rules start enabled. */
export interface CreateRedFlagRuleRequest {
  name: string
  pattern: string
  matchType: MatchType
  severity: Severity
}

/** Body of PUT /api/admins/red-flag-rules/{id}. */
export interface UpdateRedFlagRuleRequest extends CreateRedFlagRuleRequest {
  id: number
  enabled: boolean
}
