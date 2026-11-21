import { useEffect, useState } from 'react'
import styles from './knowledgeBase.module.css'

/** Longer text files are cut off in the preview (the whole file is still stored and processed). */
const MAX_PREVIEW_CHARS = 200_000

type Preview = { kind: 'text'; text: string } | { kind: 'pdf'; url: string } | { kind: 'none' }

const extensionOf = (fileName: string) => fileName.slice(fileName.lastIndexOf('.')).toLowerCase()

/**
 * Shows a file inside a scrollable box: text and Markdown as plain text, PDFs in an iframe using the
 * browser's own viewer. Word files can't be shown by browsers, so those get a note instead.
 * Works for a file the admin just picked (a File) and for a stored one fetched from the server (a Blob).
 */
export function FilePreview({ file, fileName }: { file: Blob; fileName: string }) {
  const [preview, setPreview] = useState<Preview | null>(null)
  const extension = extensionOf(fileName)

  useEffect(() => {
    let cancelled = false
    let url: string | null = null

    if (extension === '.txt' || extension === '.md') {
      file.text().then((text) => {
        if (!cancelled) setPreview({ kind: 'text', text: text.slice(0, MAX_PREVIEW_CHARS) })
      })
    } else if (extension === '.pdf') {
      // Re-type it: a PDF stored without a content type would download instead of displaying
      url = URL.createObjectURL(new Blob([file], { type: 'application/pdf' }))
      setPreview({ kind: 'pdf', url })
    } else {
      setPreview({ kind: 'none' })
    }

    return () => {
      cancelled = true
      if (url) URL.revokeObjectURL(url) // free the memory when the file changes or the page closes
    }
  }, [file, extension])

  if (!preview) return <p className={styles.previewNote}>Loading preview…</p>

  if (preview.kind === 'text') {
    return (
      <pre className={styles.previewBox} tabIndex={0} aria-label={`Contents of ${fileName}`}>
        {preview.text || '(This file is empty.)'}
      </pre>
    )
  }

  if (preview.kind === 'pdf') {
    return <iframe className={styles.previewBox} src={preview.url} title={`Preview of ${fileName}`} />
  }

  return (
    <p className={styles.previewNote}>
      Browsers can't preview {extension || 'this kind of'} files. Download it to open it in its own app; the text is
      extracted on the server after upload.
    </p>
  )
}

/** "Download" link for a Blob, with the original file name. */
export function DownloadLink({ file, fileName }: { file: Blob; fileName: string }) {
  const [url, setUrl] = useState<string | null>(null)

  useEffect(() => {
    const objectUrl = URL.createObjectURL(file)
    setUrl(objectUrl)
    return () => URL.revokeObjectURL(objectUrl)
  }, [file])

  if (!url) return null
  return (
    <a className={styles.textLink} href={url} download={fileName}>
      Download {fileName}
    </a>
  )
}
