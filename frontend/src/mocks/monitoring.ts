/**
 * Monitoring numbers that don't come from another mock. Account, alert and "needs attention"
 * counts are calculated from the other mock arrays in api/monitoring.ts, so the pages agree.
 */
export const mockMonitoring = {
  aiRepliesEnabled: true,
  conversations: { activeConversations: 4, messages: 148 },
  messagesPerDay: [12, 18, 25, 9, 21, 38, 25],
  spending: {
    budgetUsd: 50,
    byPurpose: [
      { detail: 'Chat replies', usd: 6.1 },
      { detail: 'Red-flag checks', usd: 1.17 },
      { detail: 'Knowledge base indexing', usd: 0.02 },
    ],
  },
}
