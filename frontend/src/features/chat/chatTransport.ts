import { HubConnectionBuilder, HubConnectionState } from '@microsoft/signalr'
import { USE_MOCKS } from '../../api/mockMode'
import { mockAddMessage } from '../../mocks/patientChat'
import { simulateNetwork } from '../../mocks/simulateNetwork'
import type { ChatMessage } from '../../types/conversation'

/**
 * Live chat over SignalR (the backend's ChatHub at /hubs/chat).
 *
 * useChat talks to this small interface instead of SignalR directly, so mock mode can swap in a
 * fake that works without a backend. Both send messages the same way the real hub does:
 * every saved message (yours and the AI's) arrives through onMessage.
 */
export interface ChatTransport {
  /** Connect if needed, then subscribe this tab to one conversation's messages. */
  join(conversationId: string): Promise<void>
  /** Resolves once the server has saved the message and the AI reply. */
  send(conversationId: string, content: string): Promise<void>
  /** Called for every new message in a joined conversation. Returns an unsubscribe function. */
  onMessage(listener: (message: ChatMessage) => void): () => void
  /** Called after an automatic reconnect (rejoin + refetch there). Returns an unsubscribe function. */
  onReconnected(listener: () => void): () => void
}

// ---------- Real: SignalR ----------

const connection = new HubConnectionBuilder()
  .withUrl('/hubs/chat') // same origin, so the auth cookie is sent automatically
  .withAutomaticReconnect()
  .build()

const messageListeners = new Set<(message: ChatMessage) => void>()
const reconnectListeners = new Set<() => void>()
connection.on('ReceiveMessage', (message: ChatMessage) => messageListeners.forEach((listener) => listener(message)))
connection.onreconnected(() => reconnectListeners.forEach((listener) => listener()))

let starting: Promise<void> | null = null

/** Safe to call repeatedly (React StrictMode runs effects twice in development). */
function ensureConnected(): Promise<void> {
  if (connection.state === HubConnectionState.Connected) return Promise.resolve()
  starting ??= connection.start().finally(() => (starting = null))
  return starting
}

const signalRTransport: ChatTransport = {
  async join(conversationId) {
    await ensureConnected()
    await connection.invoke('JoinConversation', conversationId)
  },
  async send(conversationId, content) {
    await ensureConnected()
    await connection.invoke('SendMessage', conversationId, content)
  },
  onMessage(listener) {
    messageListeners.add(listener)
    return () => messageListeners.delete(listener)
  },
  onReconnected(listener) {
    reconnectListeners.add(listener)
    return () => reconnectListeners.delete(listener)
  },
}

// ---------- Mock: no backend ----------

const mockListeners = new Set<(message: ChatMessage) => void>()
const emit = (message: ChatMessage) => mockListeners.forEach((listener) => listener(message))

const mockTransport: ChatTransport = {
  async join() {},
  async send(conversationId, content) {
    await simulateNetwork(150)
    emit(mockAddMessage(conversationId, 'Patient', content))
    await simulateNetwork(700)
    emit(mockAddMessage(conversationId, 'Assistant', 'Proof of concept: replies are not connected to the AI yet.'))
  },
  onMessage(listener) {
    mockListeners.add(listener)
    return () => mockListeners.delete(listener)
  },
  onReconnected: () => () => {},
}

export const chatTransport: ChatTransport = USE_MOCKS ? mockTransport : signalRTransport
