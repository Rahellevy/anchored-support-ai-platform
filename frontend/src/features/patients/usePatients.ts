import { useQuery } from '@tanstack/react-query'
import { getMyPatients } from '../../api/patients'

export const patientKeys = { mine: ['patients', 'mine'] as const }

/** The signed-in therapist's patients (cached; shared by the dashboard and the alerts sidebar). */
export function useMyPatients() {
  return useQuery({ queryKey: patientKeys.mine, queryFn: getMyPatients })
}
