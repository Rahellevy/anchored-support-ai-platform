import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { getMonitoringSummary, setAiRepliesEnabled } from '../../api/monitoring'

export const monitoringKeys = { summary: ['admin', 'monitoring'] as const }

/** Refreshes every minute while the page is open. */
export function useMonitoringSummary() {
  return useQuery({ queryKey: monitoringKeys.summary, queryFn: getMonitoringSummary, refetchInterval: 60_000 })
}

export function useSetAiReplies() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: setAiRepliesEnabled,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: monitoringKeys.summary }),
  })
}
