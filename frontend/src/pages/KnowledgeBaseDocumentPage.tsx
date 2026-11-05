import { Link, useParams } from 'react-router-dom'
import { PageHeader } from '../components/PageHeader'
import { DocumentForm } from '../features/knowledgeBase/DocumentForm'
import { DocumentStatusBadge } from '../features/knowledgeBase/DocumentsTable'
import { useDocument } from '../features/knowledgeBase/useKnowledgeBase'
import styles from '../features/knowledgeBase/knowledgeBase.module.css'
import { formatDayTime } from '../utils/format'

/** /admin/knowledge-base/new and /admin/knowledge-base/:documentId */
export function KnowledgeBaseDocumentPage() {
  const { documentId } = useParams()
  const { data: document, isPending } = useDocument(documentId)

  const backLink = (
    <Link to="/admin/knowledge-base" className={styles.backLink}>
      ← Knowledge base
    </Link>
  )

  if (!documentId) {
    return (
      <>
        <title>New document · Anchored Administration</title>
        {backLink}
        <PageHeader title="New document" description="New documents start as drafts. Drafts are never sent to the AI." />
        <DocumentForm />
      </>
    )
  }

  if (isPending) return <p>Loading document…</p>
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
        description={`Last updated ${formatDayTime(document.updatedAt)} by ${document.updatedBy}`}
        actions={<DocumentStatusBadge status={document.status} />}
      />
      {/* key: a different document gets a fresh form */}
      <DocumentForm key={document.id} document={document} />
    </>
  )
}
