import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { getDocument, getDocuments, saveDocument } from '../../api/knowledgeBase'

export const knowledgeBaseKeys = {
  all: ['admin', 'knowledge-base'] as const,
  detail: (id: string) => ['admin', 'knowledge-base', id] as const,
}

export function useDocuments() {
  return useQuery({ queryKey: knowledgeBaseKeys.all, queryFn: getDocuments })
}

/** Pass undefined for a new document (nothing is fetched). */
export function useDocument(id: string | undefined) {
  return useQuery({
    queryKey: knowledgeBaseKeys.detail(id ?? 'new'),
    queryFn: () => getDocument(id!),
    enabled: !!id,
  })
}

/** Save (and optionally submit for approval). Refreshes the list and the document. */
export function useSaveDocument() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: saveDocument,
    // Prefix match: invalidating ['admin', 'knowledge-base'] also refreshes every detail query.
    onSuccess: () => queryClient.invalidateQueries({ queryKey: knowledgeBaseKeys.all }),
  })
}
