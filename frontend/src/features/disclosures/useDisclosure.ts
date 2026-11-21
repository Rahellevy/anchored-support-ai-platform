import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { acceptDisclosure, getDisclosureStatus, type DisclosureType } from '../../api/disclosures'

export const disclosureKeys = { status: (type: DisclosureType) => ['disclosures', type] as const }

/** Has the signed-in patient accepted the current version of this disclosure? */


export function useDisclosureStatus(type: DisclosureType) {
  return useQuery({ queryKey: disclosureKeys.status(type), queryFn: () => getDisclosureStatus(type) })
}

export const useAcceptDisclosure = (type: DisclosureType) => {
  const queryClient = useQueryClient()
  
  
  return useMutation({
    mutationFn: () => acceptDisclosure(type),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: disclosureKeys.status(type) }),
  })
}
