import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { getConversation, markConversationReviewed } from '../../api/conversations'
import { patientKeys } from '../patients/usePatients'

/** Cache keys for conversations, shared by the therapist review page and the patient chat (useChat). */
export const conversationKeys = {
  /** Therapist review: the whole conversation + summary. */
  detail: (conversationId: string) => ['conversations', conversationId] as const,
  /** Patient chat: just the messages, updated live. */
  messages: (conversationId: string) => ['conversations', conversationId, 'messages'] as const,
}

/** One conversation with its full transcript (null if it doesn't exist). */
export function useConversation(conversationId: string) {
  return useQuery({
    queryKey: conversationKeys.detail(conversationId),
    queryFn: () => getConversation(conversationId),
  })
}

/** Marks the conversation reviewed; the dashboard's review status updates too. */
export function useMarkConversationReviewed(conversationId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: () => markConversationReviewed(conversationId),
    onSuccess: () =>
      Promise.all([
        queryClient.invalidateQueries({ queryKey: conversationKeys.detail(conversationId) }),
        queryClient.invalidateQueries({ queryKey: patientKeys.mine }),
      ]),
  })
}
