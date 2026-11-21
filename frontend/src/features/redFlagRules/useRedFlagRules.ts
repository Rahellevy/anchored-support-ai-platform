import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { createRedFlagRule, deleteRedFlagRule, getRedFlagRules, updateRedFlagRule } from '../../api/redFlagRules'
import type { CreateRedFlagRuleRequest, UpdateRedFlagRuleRequest } from '../../types/redFlagRules'

export const redFlagKeys = { rules: ['admin', 'red-flag-rules'] as const }

export function useRedFlagRules() {
  return useQuery({ queryKey: redFlagKeys.rules, queryFn: getRedFlagRules })
}

/** Creates a rule when the request has no id, otherwise updates it. Refreshes the list. */
export function useSaveRedFlagRule() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (request: CreateRedFlagRuleRequest | UpdateRedFlagRuleRequest) =>
      'id' in request ? updateRedFlagRule(request) : createRedFlagRule(request),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: redFlagKeys.rules }),
  })
}

export function useDeleteRedFlagRule() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: deleteRedFlagRule,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: redFlagKeys.rules }),
  })
}
