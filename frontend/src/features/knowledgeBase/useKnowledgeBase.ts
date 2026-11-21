import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  deleteDocument,
  getDocument,
  getDocumentFile,
  getDocuments,
  reprocessDocument,
  updateDocument,
  uploadDocument,
} from '../../api/knowledgeBase'
import type { KnowledgeDocument, UpdateKbDocumentRequest } from '../../types/knowledgeBase'

export const knowledgeBaseKeys = {
  all: ['admin', 'knowledge-base'] as const,
  list: () => [...knowledgeBaseKeys.all, 'list'] as const,
  detail: (id: number) => [...knowledgeBaseKeys.all, 'detail', id] as const,
  file: (id: number) => [...knowledgeBaseKeys.all, 'file', id] as const,
}

/** While a document is being processed, check every few seconds so its status updates on its own. */
const POLL_WHILE_PENDING_MS = 3000

export function useDocuments() {
  return useQuery({
    queryKey: knowledgeBaseKeys.list(),
    queryFn: () => getDocuments(),
    refetchInterval: (query) =>
      query.state.data?.some((d) => d.status === 'Pending') ? POLL_WHILE_PENDING_MS : false,
  })
}

export function useDocument(id: number) {
  return useQuery({
    queryKey: knowledgeBaseKeys.detail(id),
    queryFn: () => getDocument(id),
    enabled: Number.isFinite(id),
    refetchInterval: (query) => (query.state.data?.status === 'Pending' ? POLL_WHILE_PENDING_MS : false),
  })
}

/** The stored file, for the preview. It never changes, so it's fetched once. */
export function useDocumentFile(id: number) {
  return useQuery({
    queryKey: knowledgeBaseKeys.file(id),
    queryFn: () => getDocumentFile(id),
    staleTime: Infinity,
    enabled: Number.isFinite(id),
  })
}

/** All mutations refresh every knowledge-base query (prefix match on knowledgeBaseKeys.all). */
function useKbMutation<TVariables, TResult>(mutationFn: (variables: TVariables) => Promise<TResult>) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: knowledgeBaseKeys.all }),
  })
}

export const useUploadDocument = () => useKbMutation(uploadDocument)

export const useUpdateDocument = (id: number) =>
  useKbMutation((request: UpdateKbDocumentRequest) => updateDocument(id, request))

export const useReprocessDocument = () => useKbMutation((id: number) => reprocessDocument(id))

export function useDeleteDocument() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (doc: KnowledgeDocument) => deleteDocument(doc.id),
    onSuccess: (_result, doc) => {
      // Drop the deleted document's own queries so nothing refetches a 404
      queryClient.removeQueries({ queryKey: knowledgeBaseKeys.detail(doc.id) })
      queryClient.removeQueries({ queryKey: knowledgeBaseKeys.file(doc.id) })
      return queryClient.invalidateQueries({ queryKey: knowledgeBaseKeys.list() })
    },
  })
}
