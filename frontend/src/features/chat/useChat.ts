import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useEffect } from 'react'
import { getMessages } from '../../api/patientChat'
import type { ChatMessage } from '../../types/conversation'
import { conversationKeys } from '../conversations/useConversation'
import { chatTransport } from './chatTransport'

/**
 * Everything the patient chat page needs for one conversation:
 *  1. history loads over REST (useQuery)
 *  2. the tab joins the conversation on the hub
 *  3. new messages pushed by the server are added to the same cached list
 *  4. send(text) goes through the hub; the message comes back via step 3
 */
export function useChat(conversationId: string) {
  const queryClient = useQueryClient()

  const { data: messages = [], isPending, isError } = useQuery({
    queryKey: conversationKeys.messages(conversationId),
    queryFn: () => getMessages(conversationId),
  })

  useEffect(() => {
    const key = conversationKeys.messages(conversationId)

    const stopMessages = chatTransport.onMessage((message) => {
      if (message.conversationId !== conversationId) return
      queryClient.setQueryData<ChatMessage[]>(key, (old = []) =>
        old.some((m) => m.id === message.id) ? old : [...old, message], // skip duplicates
      )
    })

    // SignalR forgets which conversations a connection joined when it reconnects.
    const stopReconnect = chatTransport.onReconnected(() => {
      void chatTransport.join(conversationId)
      void queryClient.invalidateQueries({ queryKey: key }) // fetch anything missed while offline
    })

    chatTransport.join(conversationId).catch((error) => console.error('Could not join conversation', error))

    return () => {
      stopMessages()
      stopReconnect()
    }
  }, [conversationId, queryClient])

  const sendMutation = useMutation({
    mutationFn: (content: string) => chatTransport.send(conversationId, content),
  })

  return {
    messages,
    isLoading: isPending,
    notFound: isError,
    send: sendMutation.mutateAsync,
    /** True from send until the AI reply has been saved. */
    isSending: sendMutation.isPending,
  }
}
