/**
 * Knowledge base: practice information the AI may quote in its replies.
 * Only Published documents are ever sent to the AI.
 */
export type DocumentStatus = 'Pending' | 'Ready' | 'Published'

export const DOCUMENT_CATEGORIES = [
  'PracticeInformation',
  'Educational',
  'SupportResources',
  'Policies',
  'FAQ',
] as const
export type DocumentCategory = (typeof DOCUMENT_CATEGORIES)[number]

export interface KnowledgeDocument {
  id: string
  title: string
  filename: string
  category: DocumentCategory
  status: DocumentStatus
  // /** Plain text. Blank lines separate the passages the AI can receive. */
  // content: string
  /** How many patient messages this document helped answer in the last 7 days. */
  // usedLast7Days: number
  updatedAt: string
  // updatedBy: string
  enabled: boolean
  chunkCount: number
}

/** What the editor sends: the fields an admin can change. */
// export interface DocumentInput {
//   id?: string // missing = new document
//   title: string
//   category: DocumentCategory
//   content: string
// }

export interface UploadDocumentRequest {
  file?: File
  title: string,
  category: DocumentCategory
}

export interface UpdateKbDocumentRequest {
  title?: string
  category?: DocumentCategory
  enabled?: boolean
}

export type MatchStrength = 'Strong' | 'Good' | 'Weak'

/** One passage the AI would receive for a sample question. */
export interface MatchedPassage {
  documentId: string
  documentTitle: string
  category: DocumentCategory
  text: string
  match: MatchStrength
}

export interface QuestionTestResult {
  /** Up to 3, best first. Published documents only. */
  passages: MatchedPassage[]
  /** Titles of unpublished documents that also matched (never sent to the AI). */
  unpublishedMatches: string[]
}
