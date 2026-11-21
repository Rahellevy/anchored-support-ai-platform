import type { KbCategory, KbStatus, KnowledgeDocument } from '../types/knowledgeBase'
import { at } from './simulateNetwork'

/**
 * Mock knowledge base: the document list plus the stored file for each one, so the preview
 * (iframe for PDFs, text for .txt/.md) works without a backend. Lives in memory, so it resets on refresh.
 */

interface MockFile {
  blob: Blob
  /** False for files the "server" can't read text from (an image-only PDF), so processing fails. */
  hasText: boolean
}

export const mockDocuments: KnowledgeDocument[] = []
export const mockFiles = new Map<number, MockFile>()
let nextId = 1

function add(
  title: string,
  fileName: string,
  category: KbCategory,
  status: KbStatus,
  uploadedAt: string,
  file: MockFile,
  enabled = true,
) {
  const id = nextId++
  mockFiles.set(id, file)
  mockDocuments.push({
    id,
    title,
    fileName,
    category,
    status,
    enabled,
    uploadedAt,
    chunkCount: status === 'Ready' ? estimateChunks(file) : 0,
  })
}

/** Adds an uploaded file as Pending, then "processes" it like the backend's ingestion worker. */
export function mockAddUpload(title: string, file: File, category: KbCategory): KnowledgeDocument {
  add(title, file.name, category, 'Pending', new Date().toISOString(), { blob: file, hasText: file.size > 0 })
  const doc = mockDocuments[mockDocuments.length - 1]
  mockProcess(doc.id)
  return doc
}

/** Pending → Ready (or Failed if there is no text) after a few seconds, like the background worker. */
export function mockProcess(id: number) {
  const doc = mockDocuments.find((d) => d.id === id)
  const file = mockFiles.get(id)
  if (!doc || !file) return
  doc.status = 'Pending'
  doc.chunkCount = 0
  setTimeout(() => {
    doc.status = file.hasText ? 'Ready' : 'Failed'
    doc.chunkCount = file.hasText ? estimateChunks(file) : 0
  }, 4000)
}

/** Roughly what TextChunker produces: one passage per ~2,500 characters. */
function estimateChunks(file: MockFile): number {
  return Math.max(1, Math.ceil(file.blob.size / 2500))
}

const text = (body: string, type = 'text/plain'): MockFile => ({ blob: new Blob([body], { type }), hasText: true })

// ---------- seed data ----------

add(
  'Office hours and how to reach your therapist',
  'office-hours.pdf',
  'PracticeInformation',
  'Ready',
  at(9, 10, 0),
  {
    hasText: true,
    blob: makePdf('Office hours and how to reach your therapist', [
      'Our office is open Monday to Friday, 9 AM to 5 PM.',
      'Messages sent after hours are read the next business day.',
      '',
      'To reach your therapist, call the front desk or send a message',
      'through the patient portal.',
      '',
      'This chat is not monitored live by your therapist.',
    ]),
  },
)

add(
  'Grounding exercises: 5-4-3-2-1 and box breathing',
  'grounding-exercises.md',
  'Educational',
  'Ready',
  at(12, 14, 0),
  text(
    '# Grounding exercises\n\n' +
      '## 5-4-3-2-1\n\nName five things you can see, four you can touch, three you can hear, two you can smell and one you can taste.\n\n' +
      '## Box breathing\n\nBreathe in for four counts, hold for four, out for four, and hold for four. Repeat a few times to calm racing thoughts.\n',
    'text/markdown',
  ),
)

add(
  'Sleep habits that help',
  'sleep-habits.txt',
  'Educational',
  'Ready',
  at(8, 9, 30),
  text(
    'Keep the same wake-up time every day, even after a bad night of sleep.\n\n' +
      'If you are still awake after about 20 minutes, get up and do something quiet in low light until you feel sleepy.\n\n' +
      'Avoid screens for the hour before bed.\n',
  ),
)

add(
  'Crisis and after-hours resources',
  'crisis-resources.txt',
  'SupportResources',
  'Ready',
  at(8, 11, 0),
  text(
    'If you are in danger or thinking about harming yourself, call or text 988 (Suicide and Crisis Lifeline) or call 911.\n\n' +
      'After hours, the on-call line is for urgent needs only. For anything else, message your therapist and they will reply the next business day.\n',
  ),
)

add(
  'Cancellation and rescheduling policy',
  'cancellation-policy.docx',
  'Policies',
  'Ready',
  at(1, 16, 2),
  // Stand-in bytes: browsers can't preview .docx anyway, so the page shows a download link instead.
  {
    hasText: true,
    blob: new Blob(['Please cancel at least 24 hours ahead.'], {
      type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    }),
  },
)

add(
  'What to expect in therapy',
  'what-to-expect.txt',
  'FAQ',
  'Ready',
  at(15, 13, 0),
  text(
    'Sessions are usually 50 minutes. Your therapist will ask what brings you in and what you would like to change.\n\n' +
      'It can help to bring what is on your mind, like stress or sleep, to your next session.\n',
  ),
  false, // disabled: kept, but not used by the AI
)

add('Scanned intake handout', 'intake-scan.pdf', 'PracticeInformation', 'Failed', at(0, 8, 45), {
  hasText: false,
  blob: makePdf('', []), // a page with no text, like a scanned document
})

// ---------- tiny PDF writer (mock previews only) ----------

/** Builds a valid one-page PDF with a title and lines of Helvetica text. ASCII only. */
function makePdf(title: string, lines: string[]): Blob {
  const escape = (s: string) => s.replace(/[\\()]/g, (c) => `\\${c}`)
  const body = [
    'BT',
    '72 720 Td',
    ...(title ? ['/F1 18 Tf', `(${escape(title)}) Tj`, '0 -32 Td'] : []),
    '/F1 12 Tf',
    '18 TL',
    ...lines.map((line) => `(${escape(line)}) Tj T*`),
    'ET',
  ].join('\n')

  const objects = [
    '<< /Type /Catalog /Pages 2 0 R >>',
    '<< /Type /Pages /Kids [3 0 R] /Count 1 >>',
    '<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Resources << /Font << /F1 4 0 R >> >> /Contents 5 0 R >>',
    '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>',
    `<< /Length ${body.length} >>\nstream\n${body}\nendstream`,
  ]

  let pdf = '%PDF-1.4\n'
  const offsets: number[] = []
  objects.forEach((obj, i) => {
    offsets.push(pdf.length)
    pdf += `${i + 1} 0 obj\n${obj}\nendobj\n`
  })
  const xref = pdf.length
  pdf += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`
  pdf += offsets.map((o) => `${String(o).padStart(10, '0')} 00000 n \n`).join('')
  pdf += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xref}\n%%EOF\n`
  return new Blob([pdf], { type: 'application/pdf' })
}
