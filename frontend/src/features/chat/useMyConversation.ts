import { useQuery } from '@tanstack/react-query'
import { getMyConversation, getMyTherapist, startMyConversation } from '../../api/patientChat'

export const myConversationKeys = { mine: ['conversations', 'mine'] as const }

/**
 * The patient's one conversation, created the first time they open the chat.
 * Doing "get, or create if missing" inside the query means TanStack runs it once even if
 * several components (or React StrictMode) ask at the same time, so it can't create two.
 */
export function useMyConversation(firstName: string) {
  return useQuery({
    queryKey: myConversationKeys.mine,
    queryFn: async () => (await getMyConversation()) ?? (await startMyConversation(firstName)),
    staleTime: Infinity, // the id never changes
  })
}

/**
 * Does the patient have a conversation yet? Only looks, never creates; the home page uses it
 * to choose "Start a conversation" vs "Continue your conversation".
 */
export function useHasConversation() {
  return useQuery({
    queryKey: [...myConversationKeys.mine, 'lookup'],
    queryFn: async () => (await getMyConversation()) !== null,
  })
}

/** The patient's assigned therapist (name only), or null if unassigned. */
export function useMyTherapist() {
  return useQuery({ queryKey: ['patients', 'me', 'therapist'], queryFn: getMyTherapist, staleTime: 10 * 60_000 })
}
