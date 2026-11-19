import type {MatchType, RedFlagRule, Severity} from "../types/redFlagRules.ts";



const rule = (
  id: number,
  name: string,
  severity: Severity,
  matchType: MatchType,
  pattern: string,
  enabled: boolean,
): RedFlagRule => ({ id, name, severity, matchType, pattern, enabled, createdAt: '2026-11-14T21:19:00' })

export const mockRedFlagRules: RedFlagRule[] = [
  rule(1, 'Suicide risk', 'High', 'llm', 'Thoughts of death or suicide, wishing not to be alive, a plan, access to means, saying goodbye. Example: "I don\'t want to wake up anymore."', true),
  rule(2, 'Self-harm', 'High', 'llm', 'Urges to hurt oneself, recent self-injury, describing methods or tools.', true),
  rule(3, 'Risk of harming others', 'High', 'llm', 'Thoughts of hurting another person, threats, intent or a plan to cause harm.', true),
  rule(4, 'Abuse or neglect', 'High', 'llm', 'Disclosure of abuse or neglect of the patient or of a child, elder or dependent adult.', true),
  rule(5, 'Being harmed or unsafe', 'High', 'llm', 'Patient says they are being hurt, threatened or are unsafe where they live.', true),
  rule(6, 'Severe symptoms', 'Medium', 'llm', 'Marked sleep loss, panic that does not ease, inability to function day to day.', true),
  rule(7, 'Substance or medication misuse', 'Medium', 'llm', 'Increased substance use, missed or doubled medication, mixing substances.', true),
  rule(8, 'Eating-disorder behaviors', 'Medium', 'llm', 'Restricting, bingeing, purging or compensating behaviors described by the patient.', true),
  rule(9, 'Hopelessness or overwhelm', 'Low', 'llm', 'General feelings of being overwhelmed or without hope, with no mention of self-harm.', false),
  rule(10, 'Major life event', 'Low', 'llm', 'Loss, job change, move, breakup, diagnosis or other significant life events.', true),
]
