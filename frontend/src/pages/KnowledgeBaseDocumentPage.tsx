import { Link, useParams } from 'react-router-dom'
import { PageHeader } from '../components/PageHeader'
import { DocumentDetails } from '../features/knowledgeBase/DocumentDetails'
import { AiUseBadge, DocumentStatusBadge } from '../features/knowledgeBase/DocumentsTable'
import { UploadDocumentForm } from '../features/knowledgeBase/UploadDocumentForm'
import { useDocument } from '../features/knowledgeBase/useKnowledgeBase'
import styles from '../features/knowledgeBase/knowledgeBase.module.css'

const backLink = (
  <Link to="/admin/knowledge-base" className={styles.backLink}>
    ← Knowledge base
  </Link>
)

/** /admin/knowledge-base/new (upload) and /admin/knowledge-base/:documentId (details + preview). */
export function KnowledgeBaseDocumentPage() {
  const { documentId } = useParams()

  if (!documentId) {
    return (
      <>
        <title>Upload a document · Anchored Administration</title>
        {backLink}
        <PageHeader
          title="Upload a document"
          description="Text, Markdown, PDF or Word files. The text is extracted after upload and split into passages the AI can use."
        />
        <UploadDocumentForm />
      </>
    )
  }

  return <ExistingDocument id={Number(documentId)} />
}

function ExistingDocument({ id }: { id: number }) {
  const { data: document, isPending, isError } = useDocument(id)

  if (isPending && Number.isFinite(id)) return <p>Loading document…</p>
  if (isError) return <p role="alert">The document couldn't be loaded.</p>
  if (!document) {
    return (
      <>
        {backLink}
        <p>This document doesn't exist.</p>
      </>
    )
  }

  return (
    <>
      <title>{`${document.title} · Anchored Administration`}</title>
      {backLink}
      <PageHeader
        title={document.title}
        actions={
          <span className={styles.badgeRow}>
            <DocumentStatusBadge status={document.status} />
            <AiUseBadge doc={document} />
          </span>
        }
      />
      {/* key: a different document gets a fresh form */}
      <DocumentDetails key={document.id} document={document} />
    </>
  )
}
