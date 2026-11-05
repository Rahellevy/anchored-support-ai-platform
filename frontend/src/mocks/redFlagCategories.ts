import type { NotifySettings, RedFlagCategory, Severity } from '../types/flags'

/**
 * Draft categories from the design. These are proposals from the development team and
 * only take effect after Anchored Support Services approves them.
 */
const notifyFor = (severity: Severity): NotifySettings => ({
  therapistInApp: severity !== 'Low',
  therapistEmail: severity === 'High',
  admins: false,
  groupRepeats: true,
})

const category = (
  code: string,
  name: string,
  severity: Severity,
  detection: RedFlagCategory['detection'],
  patterns: string,
): RedFlagCategory => ({ code, name, severity, detection, patterns, notify: notifyFor(severity), approval: 'Draft' })

export const mockRedFlagCategories: RedFlagCategory[] = [
  category('H1', 'Suicide risk', 'High', 'both', 'Thoughts of death or suicide, wishing not to be alive, a plan, access to means, saying goodbye. Example: "I don\'t want to wake up anymore."'),
  category('H2', 'Self-harm', 'High', 'both', 'Urges to hurt oneself, recent self-injury, describing methods or tools.'),
  category('H3', 'Risk of harming others', 'High', 'both', 'Thoughts of hurting another person, threats, intent or a plan to cause harm.'),
  category('H4', 'Abuse or neglect', 'High', 'both', 'Disclosure of abuse or neglect of the patient or of a child, elder or dependent adult.'),
  category('H5', 'Being harmed or unsafe', 'High', 'both', 'Patient says they are being hurt, threatened or are unsafe where they live.'),
  category('M1', 'Severe symptoms', 'Medium', 'both', 'Marked sleep loss, panic that does not ease, inability to function day to day.'),
  category('M2', 'Substance or medication misuse', 'Medium', 'both', 'Increased substance use, missed or doubled medication, mixing substances.'),
  category('M3', 'Eating-disorder behaviors', 'Medium', 'both', 'Restricting, bingeing, purging or compensating behaviors described by the patient.'),
  category('L1', 'Hopelessness or overwhelm', 'Low', 'llm', 'General feelings of being overwhelmed or without hope, with no mention of self-harm.'),
  category('L2', 'Major life event', 'Low', 'llm', 'Loss, job change, move, breakup, diagnosis or other significant life events.'),
]
