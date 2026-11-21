import { mockRedFlagRules } from '../mocks/redFlagRules'
import { simulateNetwork } from '../mocks/simulateNetwork'
import type { CreateRedFlagRuleRequest, RedFlagRule, UpdateRedFlagRuleRequest } from '../types/redFlagRules'
import { httpClient } from './client'
import { USE_MOCKS } from './mockMode'

/** Admin endpoints: /api/admins/red-flag-rules (Endpoints/Admin/AdminEndpoints.cs). */
const ENDPOINTS = {
  RULES: '/admins/red-flag-rules',
  RULE: (id: number) => `/admins/red-flag-rules/${id}`,
}

/** Every rule, oldest first. */
export async function getRedFlagRules(): Promise<RedFlagRule[]> {
  if (USE_MOCKS) {
    await simulateNetwork()
    return structuredClone(mockRedFlagRules)
  }
  const { data } = await httpClient.get<RedFlagRule[]>(ENDPOINTS.RULES)
  return data
}

/** Creates a rule (enabled). The backend answers 400 if a Phrase pattern is invalid. */
export async function createRedFlagRule(request: CreateRedFlagRuleRequest): Promise<RedFlagRule> {
  if (USE_MOCKS) {
    await simulateNetwork()
    const rule: RedFlagRule = {
      ...request,
      id: Math.max(0, ...mockRedFlagRules.map((r) => r.id)) + 1,
      enabled: true,
      createdAt: new Date().toISOString(),
    }
    mockRedFlagRules.push(rule)
    return structuredClone(rule)
  }
  const { data } = await httpClient.post<RedFlagRule>(ENDPOINTS.RULES, request)
  return data
}

export async function updateRedFlagRule(request: UpdateRedFlagRuleRequest): Promise<RedFlagRule> {
  if (USE_MOCKS) {
    await simulateNetwork()
    const rule = mockRedFlagRules.find((r) => r.id === request.id)
    if (!rule) throw new Error('Rule not found.')
    Object.assign(rule, request)
    return structuredClone(rule)
  }
  const { data } = await httpClient.put<RedFlagRule>(ENDPOINTS.RULE(request.id), request)
  return data
}

/** Deletes a rule. Alerts it already raised are kept (they store the rule's name). */
export async function deleteRedFlagRule(id: number): Promise<void> {
  if (USE_MOCKS) {
    await simulateNetwork()
    const index = mockRedFlagRules.findIndex((r) => r.id === id)
    if (index >= 0) mockRedFlagRules.splice(index, 1)
    return
  }
  await httpClient.delete(ENDPOINTS.RULE(id))
}
