import { isAxiosError } from 'axios'

/**
 * A message that's safe to show the user for a failed API call.
 * Uses the backend's ValidationProblem details when there are any
 * (e.g. { errors: { pattern: ["Invalid regex: ..."] } }), otherwise the fallback.
 */
export function apiErrorMessage(error: unknown, fallback: string): string {
  if (isAxiosError(error) && error.response) {
    const data = error.response.data as { errors?: Record<string, string[]>; detail?: string } | string | undefined
    if (typeof data === 'string' && data.trim() && !data.trimStart().startsWith('<')) return data
    if (data && typeof data === 'object') {
      const messages = Object.values(data.errors ?? {}).flat()
      if (messages.length > 0) return messages.join(' ')
      if (data.detail) return data.detail
    }
    if (error.response.status === 409) return 'That action is already in progress.'
  }
  return fallback
}
