import { mockAlerts } from '../mocks/alerts'
import { mockDocuments } from '../mocks/knowledgeBase'
import { mockMonitoring } from '../mocks/monitoring'
import { at, simulateNetwork } from '../mocks/simulateNetwork'
import { mockUsers } from '../mocks/users'
import type { MonitoringSummary } from '../types/monitoring'
import { httpClient } from './client'
import { USE_MOCKS } from './mockMode'

/** Admin endpoint: /api/admins/monitoring (Endpoints/Admin/AdminEndpoints.cs). */
const ENDPOINTS = {
  SUMMARY: '/admins/monitoring',
}

/**
 * Everything on the Monitoring page in one call. Counts only, never conversation content.
 * The mock builds the same shape from the other mock arrays, so the admin pages agree.
 */
export async function getMonitoringSummary(): Promise<MonitoringSummary> {
  if (USE_MOCKS) {
    await simulateNetwork()
    return mockSummary()
  }
  const { data } = await httpClient.get<MonitoringSummary>(ENDPOINTS.SUMMARY)
  return data
}

function mockSummary(): MonitoringSummary {
  const users = (role: string) => mockUsers.filter((u) => u.role === role)
  const openAlerts = mockAlerts.filter((a) => a.status === 'Open')
  const usedUsd = mockMonitoring.spending.byPurpose.reduce((sum, p) => sum + p.usd, 0)
  const failedDocs = mockDocuments.filter((d) => d.status === 'Failed').length
  const pendingDocs = mockDocuments.filter((d) => d.status === 'Pending').length

  const needsAttention = [
    {
      label: 'Patients without a therapist',
      count: users('Patient').filter((p) => !p.therapistId).length,
      to: '/admin/users',
    },
    { label: 'Documents that failed processing', count: failedDocs, to: '/admin/knowledge-base' },
  ]
  if (usedUsd >= mockMonitoring.spending.budgetUsd * 0.8) {
    needsAttention.push({ label: 'AI spending above 80% of budget', count: 1, to: '/admin/monitoring' })
  }

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
      date: at(all.length - 1 - i, 0, 0),
      count,
    })),
    services: [
      { name: 'AI', detail: 'Responding', working: true },
      {
        name: 'Document processing',
        detail: failedDocs > 0 ? `${failedDocs} failed` : pendingDocs > 0 ? `${pendingDocs} in queue` : 'Idle',
        working: failedDocs === 0,
      },
    ],
    aiRepliesEnabled: mockMonitoring.aiRepliesEnabled,
    needsAttention,
  })
}
