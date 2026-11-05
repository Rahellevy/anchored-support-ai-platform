import type { ChatMessage, MessageSender } from '../types/conversation'
import { at } from './simulateNetwork'

/**
 * The signed-in patient's single conversation, in mock mode.
 * Kept in sessionStorage so a page refresh keeps the messages you just sent.
 */
const STORAGE_KEY = 'mockPatientConversation'

interface MockConversation {
  id: string
  messages: ChatMessage[]
}

/** A returning patient: a few messages from a couple of days ago. */
function seed(): MockConversation {
  const id = 'c-mine'
  const message = (n: number, sender: MessageSender, sentAt: string, content: string): ChatMessage => ({
    id: `${id}-m${n}`,
    conversationId: id,
    sender,
    sentAt,
    content,
  })
  return {
    id,
    messages: [
      message(1, 'Assistant', at(2, 19, 2), "Hi Jordan. What's on your mind today?"),
      message(2, 'Patient', at(2, 19, 4), "I've been stressed about work and wanted to talk it through."),
      message(3, 'Assistant', at(2, 19, 4), "I'm happy to listen. What part of work has been weighing on you most?"),
    ],
  }
}

function load(): MockConversation | null {
  try {
    const saved = sessionStorage.getItem(STORAGE_KEY)
    if (saved) return JSON.parse(saved) as MockConversation
  } catch {
    // storage unavailable or corrupt: fall back to the seed data
  }
  return seed()
}

function save(conversation: MockConversation) {
  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(conversation))
  } catch {
    // ignore: mock data just won't survive a refresh
  }
}

/** The patient's conversation id, or null if they don't have one yet. */
export function mockGetMyConversation(): { id: string } | null {
  const conversation = load()
  return conversation ? { id: conversation.id } : null
}

/** Creates the patient's conversation (with the AI greeting) if it doesn't exist; returns its id. */
export function mockStartMyConversation(firstName: string): { id: string } {
  const existing = load()
  if (existing) return { id: existing.id }

  const id = 'c-mine'
  // The real backend should add this greeting when it creates the conversation.
  save({
    id,
    messages: [{ id: `${id}-m1`, conversationId: id, sender: 'Assistant', sentAt: new Date().toISOString(), content: `Hi ${firstName}. What's on your mind today?` }],
  })
  return { id }
}

export function mockGetMessages(conversationId: string): ChatMessage[] | null {
  const conversation = load()
  return conversation?.id === conversationId ? conversation.messages : null
}

export function mockAddMessage(conversationId: string, sender: MessageSender, content: string): ChatMessage {
  const conversation = load()
  if (!conversation || conversation.id !== conversationId) throw new Error('Conversation not found.')

  const message: ChatMessage = {
    id: `${conversationId}-m${conversation.messages.length + 1}`,
    conversationId,
    sender,
    sentAt: new Date().toISOString(),
    content,
  }
  conversation.messages.push(message)
  save(conversation)
  return message
}
