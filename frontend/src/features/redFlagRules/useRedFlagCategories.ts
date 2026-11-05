import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { getRedFlagCategories, submitCategoryForApproval } from '../../api/redFlagCategories'

export const redFlagKeys = { categories: ['admin', 'red-flag-categories'] as const }

export function useRedFlagCategories() {
  return useQuery({ queryKey: redFlagKeys.categories, queryFn: getRedFlagCategories })
}

export function useSubmitCategory() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: submitCategoryForApproval,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: redFlagKeys.categories }),
  })
}
