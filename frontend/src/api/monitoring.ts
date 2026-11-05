import { mockAlerts } from '../mocks/alerts'
import { mockDocuments } from '../mocks/knowledgeBase'
import { mockMonitoring } from '../mocks/monitoring'
import { mockRedFlagCategories } from '../mocks/redFlagCategories'
import { at, simulateNetwork } from '../mocks/simulateNetwork'
import { mockUsers } from '../mocks/users'
import type { MonitoringSummary } from '../types/monitoring'

/**
 * Everything on the Monitoring page in one call. Counts only, never conversation content.
 * TODO(backend): httpClient.get<MonitoringSummary>('/admin/monitoring')
 */
export async function getMonitoringSummary(): Promise<MonitoringSummary> {
  await simulateNetwork()
  const users = (role: string) => mockUsers.filter((u) => u.role === role)
  const openAlerts = mockAlerts.filter((a) => a.status === 'Open')
  const usedUsd = mockMonitoring.spending.byPurpose.reduce((sum, p) => sum + p.usd, 0)

  return structuredClone({
    accounts: {
      patients: users('Patient').length,
      therapists: users('Therapist').length,
      admins: users('Admin').length,
    },
    conversations: mockMonitoring.conversations,
    openAlerts: {
      high: openAlerts.filter((a) => a.severity === 'High').length,
      medium: openAlerts.filter((a) => a.severity === 'Medium').length,
    },
    spending: { ...mockMonitoring.spending, usedUsd },
    messagesPerDay: mockMonitoring.messagesPerDay.map((count, i, all) => ({
      date: at(all.length - 1 - i, 12, 0),
      count,
    })),
    services: mockMonitoring.services,
    aiRepliesEnabled: mockMonitoring.aiRepliesEnabled,
    needsAttention: [
      {
        label: 'Patients without a therapist',
        count: users('Patient').filter((p) => !p.therapistId).length,
        to: '/admin/users',
      },
      {
        label: 'Disclosures not yet accepted',
        count: users('Patient').filter((p) => p.disclosure === 'Pending').length,
        to: '/admin/users',
      },
      {
        label: 'Documents awaiting approval',
        count: mockDocuments.filter((d) => d.status === 'Awaiting approval').length,
        to: '/admin/knowledge-base',
      },
      {
        label: 'Red-flag categories not yet approved',
        count: mockRedFlagCategories.filter((c) => c.approval !== 'Approved').length,
        to: '/admin/rules',
      },
    ],
    recentActivity: mockMonitoring.recentActivity,
  })
}

/**
 * Turn AI replies on or off for every patient (e.g. if spending or behavior looks wrong).
 * TODO(backend): httpClient.put('/admin/settings/ai-replies', { enabled })
 */
export async function setAiRepliesEnabled(enabled: boolean): Promise<void> {
  await simulateNetwork()
  mockMonitoring.aiRepliesEnabled = enabled
}
