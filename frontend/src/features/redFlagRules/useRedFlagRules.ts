import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { getRedFlagRules, updateRedFlagRule } from '../../api/redFlagRules.ts'
import type {updateRedFlagRuleRequest} from "../../types/redFlagRules.ts";

export const redFlagKeys = { rules: ['admin', 'red-flag-rules'] as const }


export const useRedFlagRules = () => {
  const queryClient = useQueryClient();
  
  const getRedFlagRulesAsync = useQuery({
    queryKey: redFlagKeys.rules,
    queryFn: async () => await getRedFlagRules()
  });
  
  const updateRedFlagRulesAsync = useMutation({
    mutationFn: async (rule: updateRedFlagRuleRequest) => await updateRedFlagRule(rule),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: redFlagKeys.rules })
  });
  
  return {
    redFlagRules: getRedFlagRulesAsync.data,
    isLoadingRedFlags: getRedFlagRulesAsync.isLoading,
    updateRedFlagRule: updateRedFlagRulesAsync.mutateAsync,
    updatingRedFlagRule: updateRedFlagRulesAsync.isPending
  }
}
