import { simulateNetwork } from '../mocks/simulateNetwork'
import { httpClient } from './client'
import { USE_MOCKS } from './mockMode'

/**
 * Disclosures a patient must accept:
 *  - first-use:  once, before using the app at all (the "Before you start" page)
 *  - first-chat: once, before their first conversation (the note at the top of the chat)
 * The backend stores which version was accepted and when, so a new version asks again.
 */
export type DisclosureType = 'first-use' | 'first-chat'

export interface DisclosureStatus {
  type: DisclosureType
  version: string
  accepted: boolean
}

const mockKey = (type: DisclosureType) => `mockDisclosureAccepted:${type}`

/** TODO(backend): GET /api/disclosures/{type} */
export async function getDisclosureStatus(type: DisclosureType): Promise<DisclosureStatus> {
  if (USE_MOCKS) {
    await simulateNetwork(100)
    return { type, version: 'draft', accepted: sessionStorage.getItem(mockKey(type)) === '1' }
  }
  const { data } = await httpClient.get<DisclosureStatus>(`/disclosures/${type}`)
  return data
}

/** TODO(backend): POST /api/disclosures/{type}/accept (records the current version) */
export async function acceptDisclosure(type: DisclosureType): Promise<void> {
  if (USE_MOCKS) {
    await simulateNetwork()
    sessionStorage.setItem(mockKey(type), '1')
    return
  }
  await httpClient.post(`/disclosures/${type}/accept`)
}
