import { httpClient } from "./client.ts";
import { mockRedFlagRules } from '../mocks/redFlagRules.ts'
import { USE_MOCKS } from "./mockMode.ts";
import { simulateNetwork } from '../mocks/simulateNetwork'
import type {RedFlagRule, updateRedFlagRuleRequest} from "../types/redFlagRules.ts";

/** TODO(backend): httpClient.get<RedFlagCategory[]>('/admins/red-flag-rules') */
export const getRedFlagRules = async (): Promise<RedFlagRule[]> => {
  if (USE_MOCKS){
    await simulateNetwork()
    return structuredClone(mockRedFlagRules)
  }
  
  const { data } = await httpClient.get<RedFlagRule[]>("/admins/red-flag-rules");
  return data;
}

/**
 * TODO(backend): httpClient.put(`/admins/red-flag-rules/${ruleId}`, rule)
 */
export const updateRedFlagRule = async (rule: updateRedFlagRuleRequest): Promise<void> => {
  if (USE_MOCKS) {
    await simulateNetwork()
    // const index = mockRedFlagRules.findIndex((r) => r.id === rule.id)
    // if (index >= 0) mockRedFlagRules[index] = { ...rule }
  }
  
  const { data } = await httpClient.put<void>(`/admins/red-flag-rules/${rule.id}`, rule);
  return data;
}

// createRedFlagRule

// deleteRedFlagRule
