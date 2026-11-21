/**
 * Knowledge base: files whose text the AI may use in its replies.
 * Matches the backend's KbDocumentDto and requests (Models/KnowledgeBase.cs).
 *
 * After upload a document is Pending while the server extracts its text and splits it into
 * passages ("chunks"); then Ready, or Failed if no text could be read. The AI only uses
 * documents that are Ready and enabled.
 */
export type KbStatus = 'Pending' | 'Ready' | 'Failed'

/** Backend enum Models.KbCategory, in display order. */
export const KB_CATEGORIES = ['PracticeInformation', 'Educational', 'SupportResources', 'Policies', 'FAQ'] as const
export type KbCategory = (typeof KB_CATEGORIES)[number]

export const KB_CATEGORY_LABELS: Record<KbCategory, string> = {
  PracticeInformation: 'Practice information',
  Educational: 'Educational',
  SupportResources: 'Support resources',
  Policies: 'Policies',
  FAQ: 'FAQ',
}

/** Same list as the backend's TextExtractor.SupportedExtensions. */
export const KB_SUPPORTED_EXTENSIONS = ['.txt', '.md', '.pdf', '.docx'] as const

export interface KnowledgeDocument {
  id: number
  title: string
  fileName: string
  category: KbCategory
  status: KbStatus
  /** Disabled documents stay stored but the AI stops using them. */
  enabled: boolean
  /** ISO date-time. */
  uploadedAt: string
  /** Number of passages the text was split into (0 until processed). */
  chunkCount: number
}

/** Multipart form for POST /api/admins/kb. */
export interface UploadKbDocumentRequest {
  file: File
  title: string
  category: KbCategory
}

/** Body of PATCH /api/admins/kb/{id}. Only the fields that are set change. */
export interface UpdateKbDocumentRequest {
  title?: string
  category?: KbCategory
  enabled?: boolean
}

/** Filters for GET /api/admins/kb (query string). */
export interface KbDocumentFilters {
  category?: KbCategory
  status?: KbStatus
}
