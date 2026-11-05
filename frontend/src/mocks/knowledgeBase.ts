import type { KnowledgeDocument } from '../types/knowledgeBase'
import { at } from './simulateNetwork'

/** Synthetic practice information. Blank lines separate passages. */
export const mockDocuments: KnowledgeDocument[] = [
  {
    id: 'kb1',
    title: 'Office hours and how to reach your therapist',
    category: 'Practice information',
    status: 'Published',
    content:
      'Our office is open Monday to Friday, 9 AM to 5 PM. Messages sent after hours are read the next business day.\n\n' +
      'To reach your therapist, call the front desk or send a message through the patient portal. This chat is not monitored live by your therapist.',
    usedLast7Days: 22,
    updatedAt: at(9, 10, 0),
    updatedBy: 'Riley Chen',
  },
  {
    id: 'kb2',
    title: 'Grounding exercises: 5-4-3-2-1 and box breathing',
    category: 'Educational',
    status: 'Published',
    content:
      '5-4-3-2-1: name five things you can see, four you can touch, three you can hear, two you can smell and one you can taste.\n\n' +
      'Box breathing: breathe in for four counts, hold for four, out for four, and hold for four. Repeat a few times to calm racing thoughts.',
    usedLast7Days: 17,
    updatedAt: at(12, 14, 0),
    updatedBy: 'Riley Chen',
  },
  {
    id: 'kb3',
    title: 'Sleep habits that help',
    category: 'Educational',
    status: 'Published',
    content:
      'Keep the same wake-up time every day, even after a bad night of sleep.\n\n' +
      'If you are still awake after about 20 minutes, get up and do something quiet in low light until you feel sleepy. Avoid screens before bed.',
    usedLast7Days: 11,
    updatedAt: at(8, 9, 30),
    updatedBy: 'Riley Chen',
  },
  {
    id: 'kb4',
    title: 'Crisis and after-hours resources',
    category: 'Support resources',
    status: 'Published',
    content:
      'If you are in danger or thinking about harming yourself, call or text 988 (Suicide and Crisis Lifeline) or call 911.\n\n' +
      'After hours, the on-call line is for urgent needs only. For anything else, message your therapist and they will reply the next business day.',
    usedLast7Days: 9,
    updatedAt: at(8, 11, 0),
    updatedBy: 'Riley Chen',
  },
  {
    id: 'kb5',
    title: 'What to expect in therapy',
    category: 'FAQ',
    status: 'Published',
    content:
      'Sessions are usually 50 minutes. Your therapist will ask what brings you in and what you would like to change.\n\n' +
      'It can help to bring what is on your mind, like stress or sleep, to your next session.',
    usedLast7Days: 6,
    updatedAt: at(15, 13, 0),
    updatedBy: 'Riley Chen',
  },
  {
    id: 'kb6',
    title: 'Cancellation and rescheduling policy',
    category: 'Policies',
    status: 'Awaiting approval',
    content:
      'Please cancel or reschedule an appointment at least 24 hours ahead by calling the front desk.\n\n' +
      'Late cancellations may be charged a fee. Talk to the front desk if something unexpected came up.',
    usedLast7Days: 0,
    updatedAt: at(1, 16, 2),
    updatedBy: 'Riley Chen',
  },
  {
    id: 'kb7',
    title: 'Managing stress at work',
    category: 'Educational',
    status: 'Draft',
    content:
      'Big deadlines can make it hard to switch off. Short breaks during the day help more than one long break.\n\n' +
      'Write tomorrow’s to-do list before you finish work, so it is not on your mind at night when you try to sleep.',
    usedLast7Days: 0,
    updatedAt: at(0, 8, 45),
    updatedBy: 'Riley Chen',
  },
]
