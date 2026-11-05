import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { assignTherapist, getManagedUsers } from '../../api/users'

export const userKeys = { all: ['admin', 'users'] as const }

export function useManagedUsers() {
  return useQuery({ queryKey: userKeys.all, queryFn: getManagedUsers })
}

/** Assign (or unassign with null) a patient's therapist, then refresh the list. */
export function useAssignTherapist() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ patientId, therapistId }: { patientId: string; therapistId: string | null }) =>
      assignTherapist(patientId, therapistId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: userKeys.all }),
  })
}
