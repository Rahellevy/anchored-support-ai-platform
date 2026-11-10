import {simulateNetwork} from '../mocks/simulateNetwork'
import {httpClient} from './client'
import {USE_MOCKS} from './mockMode'

/**
 * Disclosures a patient must accept:
 *  - first-use:  once, before using the app at all (the "Before you start" page)
 *  - first-chat: once, before their first conversation (the note at the top of the chat)
 * The backend stores which version was accepted and when, so a new version asks again.
 */
export type DisclosureType = 'first-use' | 'first-chat'
export type DisclosureTypeDto = "FirstUse" | "FirstChat";

export interface DisclosureStatus {
  type: DisclosureType
  accepted: boolean
  acceptedAt?: string
}

export interface DisclosureStatusDto {
  type: DisclosureTypeDto
  accepted: boolean
  acceptedAt?: string
}

const mockKey = (type: DisclosureType) => `mockDisclosureAccepted:${type}`

const API_ENDPOINT = {
  ACCEPT_DISCLOSURE: "/patients/disclosures/{type}/accept",
  GET_DISCLOSURE: "/patients/disclosures/{type}"
} as const;

/** TODO(backend): GET /api/disclosures/{type} */
export const getDisclosureStatus = async (type: DisclosureType): Promise<DisclosureStatus> => {
  if (USE_MOCKS) {
    await simulateNetwork(100)
    return { type, accepted: sessionStorage.getItem(mockKey(type)) === '1' }
  }
  const { data } = await httpClient.get<DisclosureStatusDto>(API_ENDPOINT.GET_DISCLOSURE.replace("{type}", type))

  return {
    type: data.type === "FirstUse" ? "first-use" : "first-chat",
    accepted: data.accepted,
    acceptedAt: data.acceptedAt
  }
}

/** TODO(backend): POST /api/disclosures/{type}/accept (records the current version) */
export const acceptDisclosure = async (type: DisclosureType): Promise<void> => {
  if (USE_MOCKS) {
    await simulateNetwork()
    sessionStorage.setItem(mockKey(type), '1')
    return
  }
  await httpClient.post(API_ENDPOINT.ACCEPT_DISCLOSURE.replace("{type}", type))
}
