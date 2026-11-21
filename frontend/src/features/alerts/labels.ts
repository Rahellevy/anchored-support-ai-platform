import type { Alert } from '../../types/alerts'
import { MATCH_TYPE_LABELS } from '../redFlagRules/labels'

/** "AI check" / "Phrase rule", for alert cards and the conversation sidebar. */
export const detectedByLabel = (alert: Alert) => MATCH_TYPE_LABELS[alert.matchType]
