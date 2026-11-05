import type { Patient } from '../../types/patient'

/**
 * Synthetic data for the therapist dashboard until the backend has a patients endpoint.
 * TODO: replace with an API call (e.g. GET /api/therapists/me/patients) in src/api/.
 */
export const mockPatients: Patient[] = [
  {
    id: 'p1',
    name: 'Jordan Avery',
    lastConversation: 'Today, 9:12 AM',
    conversationsLast7Days: 4,
    highFlags: 1,
    mediumFlags: 0,
    unreviewedConversations: 3,
    lastReviewed: 'Oct 1',
  },
  {
    id: 'p2',
    name: 'Sam Rivera',
    lastConversation: 'Yesterday, 8:40 PM',
    conversationsLast7Days: 2,
    highFlags: 0,
    mediumFlags: 1,
    unreviewedConversations: 2,
    lastReviewed: 'Sep 30',
  },
  {
    id: 'p3',
    name: 'Priya Nair',
    lastConversation: 'Mon, 7:05 PM',
    conversationsLast7Days: 3,
    highFlags: 0,
    mediumFlags: 0,
    unreviewedConversations: 0,
    lastReviewed: 'Today',
  },
  {
    id: 'p4',
    name: 'Marcus Lee',
    lastConversation: '6 days ago',
    conversationsLast7Days: 1,
    highFlags: 0,
    mediumFlags: 0,
    unreviewedConversations: 0,
    lastReviewed: 'Oct 2',
  },
  {
    id: 'p5',
    name: 'Elena Torres',
    lastConversation: 'No AI activity',
    conversationsLast7Days: 0,
    highFlags: 0,
    mediumFlags: 0,
    unreviewedConversations: 0,
    lastReviewed: '—',
  },
]
