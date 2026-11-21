import { useState, type FormEvent } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { Button } from '../../components/Button'
import { Card } from '../../components/Card'
import { KB_CATEGORIES, KB_CATEGORY_LABELS, type KbCategory, type KnowledgeDocument } from '../../types/knowledgeBase'
import { apiErrorMessage } from '../../utils/apiError'
import { formatDayTime, pluralize } from '../../utils/format'
import { DownloadLink, FilePreview } from './FilePreview'
import { useDeleteDocument, useDocumentFile, useReprocessDocument, useUpdateDocument } from './useKnowledgeBase'
import styles from './knowledgeBase.module.css'

/**
 * One document: its details (title, category, on/off) on the left and the stored file on the right.
 * The page renders it with key={document id}, so another document starts a fresh form.
 */
export function DocumentDetails({ document }: { document: KnowledgeDocument }) {
  const navigate = useNavigate()
  const location = useLocation()
  const update = useUpdateDocument(document.id)
  const reprocess = useReprocessDocument()
  const remove = useDeleteDocument()
  const file = useDocumentFile(document.id)

  const [title, setTitle] = useState(document.title)
  const [category, setCategory] = useState<KbCategory>(document.category)
  const [enabled, setEnabled] = useState(document.enabled)
  const [confirmingDelete, setConfirmingDelete] = useState(false)
  const [error, setError] = useState('')
  // After an upload the message comes along in the navigation state
  const [statusMessage, setStatusMessage] = useState<string>(location.state?.message ?? '')

  const unchanged = title.trim() === document.title && category === document.category && enabled === document.enabled

  function handleSave(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError('')
    if (!title.trim()) return setError('Give the document a title.')
    update.mutate(
      { title: title.trim(), category, enabled },
      {
        onSuccess: () => setStatusMessage('Changes saved.'),
        onError: (err) => setError(apiErrorMessage(err, 'The changes could not be saved.')),
      },
    )
  }

  function handleReprocess() {
    setError('')
    reprocess.mutate(document.id, {
      onSuccess: () => setStatusMessage('Queued. The text is being extracted again.'),
      onError: (err) => setError(apiErrorMessage(err, 'The document could not be queued.')),
    })
  }

  function handleDelete() {
    if (!confirmingDelete) return setConfirmingDelete(true)
    remove.mutate(document, {
      onSuccess: () => navigate('/admin/knowledge-base', { replace: true }),
      onError: (err) => setError(apiErrorMessage(err, 'The document could not be deleted.')),
    })
  }

  return (
    <div className={styles.detailLayout}>
      <Card className={styles.editor}>
        <dl className={styles.facts}>
          <dt>File</dt>
          <dd>{document.fileName}</dd>
          <dt>Uploaded</dt>
          <dd>{formatDayTime(document.uploadedAt)}</dd>
          <dt>Passages</dt>
          <dd>{document.status === 'Ready' ? pluralize(document.chunkCount, 'passage') : '—'}</dd>
        </dl>

        {document.status === 'Failed' && (
          <p className={styles.notice}>
            No text could be read from this file. Scanned documents are images, not text; upload a version with
            selectable text, or try processing it again.
          </p>
        )}

        <form onSubmit={handleSave} noValidate>
          <div className={styles.field}>
            <label htmlFor="doc-title">Title</label>
            <input
              id="doc-title"
              className={styles.input}
              maxLength={200}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          <div className={styles.field}>
            <label htmlFor="doc-category">Category</label>
            <select
              id="doc-category"
              className={styles.input}
              value={category}
              onChange={(e) => setCategory(e.target.value as KbCategory)}
            >
              {KB_CATEGORIES.map((value) => (
                <option key={value} value={value}>
                  {KB_CATEGORY_LABELS[value]}
                </option>
              ))}
            </select>
          </div>

          <label className={styles.checkbox}>
            <input type="checkbox" checked={enabled} onChange={(e) => setEnabled(e.target.checked)} />
            <span>
              The AI may use this document
              <small>Turn off to stop using it without deleting it.</small>
            </span>
          </label>

          <div className={styles.actions}>
            <Button type="submit" disabled={update.isPending || unchanged}>
              {update.isPending ? 'Saving…' : 'Save changes'}
            </Button>
            <Button
              variant="secondary"
              onClick={handleReprocess}
              disabled={reprocess.isPending || document.status === 'Pending'}
            >
              Process again
            </Button>
            <Button variant="secondary" onClick={handleDelete} disabled={remove.isPending}>
              {confirmingDelete ? 'Confirm delete' : 'Delete'}
            </Button>
          </div>

          {error && (
            <p className={styles.error} role="alert">
              {error}
            </p>
          )}
          <p className={styles.statusNote} role="status">
            {confirmingDelete && !error ? 'Deleting removes the file and its passages for good.' : statusMessage}
          </p>
        </form>
      </Card>

      <Card as="section" aria-label="Preview">
        <div className={styles.previewHead}>
          <h2 className={styles.sideTitle}>Preview</h2>
          {file.data && <DownloadLink file={file.data} fileName={document.fileName} />}
        </div>
        {file.isPending && <p className={styles.previewNote}>Loading the file…</p>}
        {file.isError && <p className={styles.previewNote}>The stored file couldn't be loaded.</p>}
        {file.data && <FilePreview file={file.data} fileName={document.fileName} />}
      </Card>
    </div>
  )
}
