import type { ApprovalStatus, DetectionMethod, NotifySettings } from '../../types/flags'
import type { BadgeTone } from '../../components/Badge'

/** Display text for the Rules table and editor. */

export const DETECTION_LABELS: Record<DetectionMethod, string> = {
  rules: 'Phrases',
  llm: 'AI check',
  both: 'Phrases + AI check',
}

export const APPROVAL_TONES: Record<ApprovalStatus, BadgeTone> = {
  Draft: 'warning',
  'Pending review': 'pending',
  Approved: 'success',
}

/** "Therapist: in-app and email, Admins" / "Timeline only" */
export function notifyLabel(notify: NotifySettings): string {
  const channels = [notify.therapistInApp && 'in-app', notify.therapistEmail && 'email'].filter(Boolean)
  const parts: string[] = []
  if (channels.length > 0) parts.push(`Therapist: ${channels.join(' and ')}`)
  if (notify.admins) parts.push('Admins')
  return parts.length > 0 ? parts.join(', ') : 'Timeline only'
}
