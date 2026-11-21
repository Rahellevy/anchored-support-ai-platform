import { useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '../../components/Button'
import { Card } from '../../components/Card'
import {
  KB_CATEGORIES,
  KB_CATEGORY_LABELS,
  KB_SUPPORTED_EXTENSIONS,
  type KbCategory,
} from '../../types/knowledgeBase'
import { apiErrorMessage } from '../../utils/apiError'
import { FilePreview } from './FilePreview'
import { FileUploadRegion } from './FileUploadRegion'
import { useUploadDocument } from './useKnowledgeBase'
import styles from './knowledgeBase.module.css'

/** Matches Kestrel's MaxRequestBodySize in appsettings (50 MB). */
const MAX_FILE_BYTES = 50 * 1024 * 1024

const isSupported = (fileName: string) =>
  KB_SUPPORTED_EXTENSIONS.some((ext) => fileName.toLowerCase().endsWith(ext))

/** "sleep-habits.pdf" → "Sleep habits", as a starting title. */
const titleFromFileName = (fileName: string) => {
  const base = fileName.replace(/\.[^.]+$/, '').replace(/[-_]+/g, ' ').trim()
  return base.charAt(0).toUpperCase() + base.slice(1)
}

const formatSize = (bytes: number) =>
  bytes < 1024 * 1024 ? `${Math.max(1, Math.round(bytes / 1024))} KB` : `${(bytes / 1024 / 1024).toFixed(1)} MB`

/**
 * Upload a new document: pick a file, check it in the preview, give it a title and category.
 * After upload the server processes it in the background; the document page shows the progress.
 */
export function UploadDocumentForm() {
  const navigate = useNavigate()
  const upload = useUploadDocument()
  const [file, setFile] = useState<File | null>(null)
  const [title, setTitle] = useState('')
  const [category, setCategory] = useState<KbCategory>('PracticeInformation')
  const [error, setError] = useState('')

  function handleFileSelected([selected]: File[]) {
    setError('')
    if (!isSupported(selected.name)) {
      setError(`That file type isn't supported. Use ${KB_SUPPORTED_EXTENSIONS.join(', ')}.`)
      return
    }
    if (selected.size > MAX_FILE_BYTES) {
      setError('That file is larger than 50 MB.')
      return
    }
    setFile(selected)
    if (!title.trim()) setTitle(titleFromFileName(selected.name))
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError('')
    if (!file) return setError('Choose a file to upload.')
    if (!title.trim()) return setError('Give the document a title.')

    upload.mutate(
      { file, title: title.trim(), category },
      {
        onSuccess: (doc) =>
          navigate(`/admin/knowledge-base/${doc.id}`, {
            replace: true,
            state: { message: 'Uploaded. The text is being extracted; this page updates when it is done.' },
          }),
        onError: (err) => setError(apiErrorMessage(err, 'The upload failed. Please try again.')),
      },
    )
  }

  return (
    <div className={styles.detailLayout}>
      <Card className={styles.editor}>
        <form onSubmit={handleSubmit} noValidate>
          <div className={styles.field}>
            <span className={styles.fieldLabel}>File</span>
            <FileUploadRegion
              accept={KB_SUPPORTED_EXTENSIONS.join(',')}
              onFileSelected={handleFileSelected}
              disabled={upload.isPending}
            />
            {file && (
              <p className={styles.selectedFile}>
                Selected: <strong>{file.name}</strong> ({formatSize(file.size)})
              </p>
            )}
          </div>

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

          <div className={styles.actions}>
            <Button type="submit" disabled={upload.isPending || !file}>
              {upload.isPending ? 'Uploading…' : 'Upload'}
            </Button>
            <Button variant="secondary" to="/admin/knowledge-base">
              Cancel
            </Button>
          </div>

          {error && (
            <p className={styles.error} role="alert">
              {error}
            </p>
          )}
        </form>
      </Card>

      <Card as="section" aria-label="Preview">
        <div className={styles.previewHead}>
          <h2 className={styles.sideTitle}>Preview</h2>
        </div>
        {file ? (
          <FilePreview file={file} fileName={file.name} />
        ) : (
          <p className={styles.previewNote}>Choose a file to check it before uploading.</p>
        )}
      </Card>
    </div>
  )
}
