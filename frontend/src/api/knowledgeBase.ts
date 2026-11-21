import { isAxiosError } from 'axios'
import { mockAddUpload, mockDocuments, mockFiles, mockProcess } from '../mocks/knowledgeBase'
import { simulateNetwork } from '../mocks/simulateNetwork'
import type {
  KbDocumentFilters,
  KnowledgeDocument,
  UpdateKbDocumentRequest,
  UploadKbDocumentRequest,
} from '../types/knowledgeBase'
import { httpClient } from './client'
import { USE_MOCKS } from './mockMode'

/** Admin endpoints: /api/admins/kb (Endpoints/Admin/AdminEndpoints.cs). */
const ENDPOINTS = {
  DOCUMENTS: '/admins/kb',
  DOCUMENT: (id: number) => `/admins/kb/${id}`,
  FILE: (id: number) => `/admins/kb/${id}/file`,
  REPROCESS: (id: number) => `/admins/kb/${id}/reprocess`,
}

/** Uploads can be large; the default 15-second timeout is for ordinary JSON calls. */
const UPLOAD_TIMEOUT_MS = 120_000

/** All documents, newest first, optionally filtered by category and/or status. */
export async function getDocuments(filters: KbDocumentFilters = {}): Promise<KnowledgeDocument[]> {
  if (USE_MOCKS) {
    await simulateNetwork()
    return structuredClone(
      mockDocuments
        .filter((d) => !filters.category || d.category === filters.category)
        .filter((d) => !filters.status || d.status === filters.status)
        .sort((a, b) => b.uploadedAt.localeCompare(a.uploadedAt)),
    )
  }
  // axios leaves undefined values out of the query string
  const { data } = await httpClient.get<KnowledgeDocument[]>(ENDPOINTS.DOCUMENTS, { params: filters })
  return data
}

/** One document, or null if it doesn't exist. */
export async function getDocument(id: number): Promise<KnowledgeDocument | null> {
  if (USE_MOCKS) {
    await simulateNetwork()
    const doc = mockDocuments.find((d) => d.id === id)
    return doc ? structuredClone(doc) : null
  }
  try {
    const { data } = await httpClient.get<KnowledgeDocument>(ENDPOINTS.DOCUMENT(id))
    return data
  } catch (error) {
    if (isAxiosError(error) && error.response?.status === 404) return null
    throw error
  }
}

/**
 * Uploads a file (multipart/form-data). The server saves it and queues it for processing,
 * answering 202 with the new document in the Pending state.
 */
export async function uploadDocument(request: UploadKbDocumentRequest): Promise<KnowledgeDocument> {
  if (USE_MOCKS) {
    await simulateNetwork(600)
    return structuredClone(mockAddUpload(request.title, request.file, request.category))
  }
  const form = new FormData()
  form.append('file', request.file)
  form.append('title', request.title)
  form.append('category', request.category)
  // No Content-Type header: the browser sets multipart/form-data with the boundary itself.
  const { data } = await httpClient.post<KnowledgeDocument>(ENDPOINTS.DOCUMENTS, form, { timeout: UPLOAD_TIMEOUT_MS })
  return data
}

/** Changes the title, category and/or enabled flag. */
export async function updateDocument(id: number, request: UpdateKbDocumentRequest): Promise<void> {
  if (USE_MOCKS) {
    await simulateNetwork()
    const doc = mockDocuments.find((d) => d.id === id)
    if (!doc) throw new Error('Document not found.')
    Object.assign(doc, Object.fromEntries(Object.entries(request).filter(([, value]) => value !== undefined)))
    return
  }
  await httpClient.patch(ENDPOINTS.DOCUMENT(id), request)
}

/** Queues the document to be processed again (e.g. after a failure). 409 if it's already queued. */
export async function reprocessDocument(id: number): Promise<void> {
  if (USE_MOCKS) {
    await simulateNetwork()
    mockProcess(id)
    return
  }
  await httpClient.post(ENDPOINTS.REPROCESS(id))
}

/** Deletes the document, its passages and the stored file. */
export async function deleteDocument(id: number): Promise<void> {
  if (USE_MOCKS) {
    await simulateNetwork()
    const index = mockDocuments.findIndex((d) => d.id === id)
    if (index >= 0) mockDocuments.splice(index, 1)
    mockFiles.delete(id)
    return
  }
  await httpClient.delete(ENDPOINTS.DOCUMENT(id))
}

/**
 * The stored file itself, as a Blob, for the preview and download link.
 * Fetched rather than linked because the endpoint sends it as an attachment, which an
 * iframe would download instead of showing.
 */
export async function getDocumentFile(id: number): Promise<Blob> {
  if (USE_MOCKS) {
    await simulateNetwork()
    const file = mockFiles.get(id)
    if (!file) throw new Error('File not found.')
    return file.blob
  }
  const { data } = await httpClient.get<Blob>(ENDPOINTS.FILE(id), { responseType: 'blob', timeout: UPLOAD_TIMEOUT_MS })
  return data
}
