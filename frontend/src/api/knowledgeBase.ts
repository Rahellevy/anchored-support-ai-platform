import { mockDocuments } from '../mocks/knowledgeBase'
import { simulateNetwork } from '../mocks/simulateNetwork'
import type {
  DocumentInput,
  KnowledgeDocument,
} from '../types/knowledgeBase'

/** TODO(backend): httpClient.get<KnowledgeDocument[]>('/admin/knowledge-base') */
export async function getDocuments(): Promise<KnowledgeDocument[]> {
  await simulateNetwork()
  return structuredClone(mockDocuments)
}

/** TODO(backend): httpClient.get<KnowledgeDocument>(`/admin/knowledge-base/${id}`) */
export async function getDocument(id: string): Promise<KnowledgeDocument | null> {
  await simulateNetwork()
  const doc = mockDocuments.find((d) => d.id === id)
  return doc ? structuredClone(doc) : null
}

/**
 * Create or update a document. Saving always makes it a Draft (or Awaiting approval when submitted),
 * so the AI stops using it until Anchored approves the new text.
 * TODO(backend): POST /admin/knowledge-base (new) or PUT /admin/knowledge-base/{id}, body { ...input, submit }
 */
export async function saveDocument({
  input,
  submit,
}: {
  input: DocumentInput
  submit: boolean
}): Promise<KnowledgeDocument> {
  await simulateNetwork()
  const existing = mockDocuments.find((d) => d.id === input.id)
  const saved: KnowledgeDocument = {
    id: existing?.id ?? `kb${Date.now()}`,
    usedLast7Days: existing?.usedLast7Days ?? 0,
    title: input.title,
    category: input.category,
    content: input.content,
    status: submit ? 'Awaiting approval' : 'Draft',
    updatedAt: new Date().toISOString(),
    updatedBy: 'Riley Chen', // the backend takes this from the signed-in user
  }
  if (existing) Object.assign(existing, saved)
  else mockDocuments.push(saved)
  return structuredClone(saved)
}

// /** POTENTIALLY REMOVE
//  * Which passages would the AI receive for this patient message? Makes no AI call.
//  * The mock scores passages by shared words; the real backend would use the same
//  * vector search (pgvector) that runs before every AI reply.
//  * TODO(backend): httpClient.post<QuestionTestResult>('/admin/knowledge-base/test', { question })
//  */
// export async function testQuestion(question: string): Promise<QuestionTestResult> {
//   await simulateNetwork()
//   const questionWords = new Set(wordsOf(question))
//
//   const scored = mockDocuments.flatMap((doc) =>
//     doc.content.split(/\n\s*\n/).map((text) => ({
//       doc,
//       text,
//       score: wordsOf(text).filter((w) => questionWords.has(w)).length,
//     })),
//   )
//   const matches = scored.filter((p) => p.score > 0).sort((a, b) => b.score - a.score)
//
//   const passages: MatchedPassage[] = matches
//     .filter((p) => p.doc.status === 'Published')
//     .slice(0, 3)
//     .map((p) => ({
//       documentId: p.doc.id,
//       documentTitle: p.doc.title,
//       category: p.doc.category,
//       text: p.text,
//       match: strengthOf(p.score),
//     }))
//
//   const unpublishedMatches = [
//     ...new Set(matches.filter((p) => p.doc.status !== 'Published').map((p) => p.doc.title)),
//   ]
//
//   return { passages, unpublishedMatches }
// }

// ----- mock search helpers -----

// const IGNORED = new Set(['what', 'your', 'have', 'with', 'that', 'this', 'about', 'from', 'when', 'there', 'would'])

/** Lower-case words of 4+ letters, cut to 5 letters so "sleeping" matches "sleep". */
// function wordsOf(text: string): string[] {
//   return (text.toLowerCase().match(/[a-z]{4,}/g) ?? []).filter((w) => !IGNORED.has(w)).map((w) => w.slice(0, 5))
// }
//
// function strengthOf(score: number): MatchStrength {
//   if (score >= 3) return 'Strong'
//   if (score === 2) return 'Good'
//   return 'Weak'
// }
