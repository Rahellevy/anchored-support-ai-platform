import type { MatchType, RedFlagRule, Severity } from '../types/redFlagRules'
import { at } from './simulateNetwork'

const rule = (
  id: number,
  name: string,
  severity: Severity,
  matchType: MatchType,
  pattern: string,
  enabled = true,
): RedFlagRule => ({ id, name, severity, matchType, pattern, enabled, createdAt: at(20, 10, id) })

/** Draft rules for the demo. Llm patterns describe the concern; Phrase patterns are words to match. */
export const mockRedFlagRules: RedFlagRule[] = [
  rule(1, 'Suicide risk', 'High', 'Llm', 'Thoughts of death or suicide, wishing not to be alive, a plan, access to means, or saying goodbye.'),
  rule(2, 'Self-harm', 'High', 'Llm', 'Urges to hurt oneself, recent self-injury, or describing methods or tools.'),
  rule(3, 'Risk of harming others', 'High', 'Llm', 'Thoughts of hurting another person, threats, or intent or a plan to cause harm.'),
  rule(4, 'Abuse or neglect', 'High', 'Llm', 'Disclosure of abuse or neglect of the patient or of a child, elder or dependent adult.'),
  rule(5, 'Crisis phrase: end my life', 'High', 'Phrase', 'end my life'),
  rule(6, 'Severe symptoms', 'Medium', 'Llm', 'Marked sleep loss, panic that does not ease, or inability to function day to day.'),
  rule(7, 'Substance or medication misuse', 'Medium', 'Llm', 'Increased substance use, missed or doubled medication, or mixing substances.'),
  rule(8, 'Eating-disorder behaviors', 'Medium', 'Llm', 'Restricting, bingeing, purging or compensating behaviors described by the patient.'),
  rule(9, 'Hopelessness or overwhelm', 'Low', 'Llm', 'General feelings of being overwhelmed or without hope, with no mention of self-harm.', false),
  rule(10, 'Major life event', 'Low', 'Llm', 'Loss, job change, move, breakup, diagnosis or other significant life events.'),
  rule(11, 'Panic attacks', 'Medium', 'Phrase', 'panic attacks'),
]
