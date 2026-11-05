import { at } from './simulateNetwork'

/**
 * Monitoring numbers that don't come from another mock. Account, alert and "needs attention"
 * counts are calculated from the other mock arrays in api/monitoring.ts, so the pages agree.
 */
export const mockMonitoring = {
  aiRepliesEnabled: true,
  conversations: { activeConversations: 6, messages: 148 },
  messagesPerDay: [12, 18, 25, 9, 21, 38, 25],
  spending: {
    budgetUsd: 50,
    byPurpose: [
      { purpose: 'Chat replies', usd: 6.1 },
      { purpose: 'Red-flag AI checks', usd: 1.17 },
      { purpose: 'Summaries', usd: 0.55 },
    ],
  },
  services: [
    { name: 'AI service (OpenAI)', detail: 'Last reply 2 minutes ago', working: true },
    { name: 'Red-flag checks', detail: 'Last check 2 minutes ago', working: true },
    { name: 'Email (test sandbox)', detail: 'Last email today, 9:14 AM', working: true },
  ],
  recentActivity: [
    { at: at(0, 9, 20), who: 'Dr. Morgan Hale', what: 'Opened a conversation for Jordan Avery' },
    { at: at(0, 9, 14), who: 'System', what: 'High alert sent to Dr. Morgan Hale (in-app and email)' },
    { at: at(1, 16, 2), who: 'Riley Chen', what: 'Submitted "Cancellation and rescheduling policy" for approval' },
    { at: at(1, 15, 40), who: 'Riley Chen', what: 'Invited Taylor Brooks as a patient' },
    { at: at(3, 11, 15), who: 'Unknown', what: '3 failed sign-ins for one email; slowed down for 15 minutes' },
  ],
}
