import type { MatchType } from '../../types/redFlagRules'

/** Display text for the backend's MatchType values. */
export const MATCH_TYPE_LABELS: Record<MatchType, string> = {
  Phrase: 'Phrase rule',
  Llm: 'AI check',
}

/** Longer descriptions for the editor's radio buttons. */
export const MATCH_TYPE_DESCRIPTIONS: Record<MatchType, string> = {
  Phrase: 'Matches the exact words, ignoring case. Fast and predictable.',
  Llm: 'An AI reads each message and decides whether it fits your description. Ignores figures of speech.',
}
