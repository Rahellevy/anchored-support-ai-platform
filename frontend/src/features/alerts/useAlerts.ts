import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { acknowledgeAlert, getAlerts } from '../../api/alerts'

export const alertKeys = { all: ['alerts'] as const }

/** All alerts for the signed-in therapist's patients. */
export function useAlerts() {
  return useQuery({ queryKey: alertKeys.all, queryFn: getAlerts })
}

/** Number of open alerts (drives the bell in the header). */
export function useOpenAlertCount() {
  const { data: alerts = [] } = useAlerts()
  return alerts.filter((alert) => alert.status === 'Open').length
}

/** Acknowledge an alert, then refetch so every screen (list, bell, conversation sidebar) updates. */
export function useAcknowledgeAlert() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: acknowledgeAlert,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: alertKeys.all }),
  })
}
