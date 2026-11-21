import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { acknowledgeAlert, getAlerts } from '../../api/alerts'
import { patientKeys } from '../patients/usePatients'

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

/**
 * Acknowledge an alert, then refetch so every screen updates: the list, the bell,
 * the conversation sidebar, and the dashboard's flag counts (which only count open alerts).
 */
export function useAcknowledgeAlert() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: acknowledgeAlert,
    onSuccess: () =>
      Promise.all([
        queryClient.invalidateQueries({ queryKey: alertKeys.all }),
        queryClient.invalidateQueries({ queryKey: patientKeys.mine }),
      ]),
  })
}
