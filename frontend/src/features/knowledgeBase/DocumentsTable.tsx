import { Link } from 'react-router-dom'
import { Badge, type BadgeTone } from '../../components/Badge'
import { Button } from '../../components/Button'
import { KB_CATEGORY_LABELS, type KbStatus, type KnowledgeDocument } from '../../types/knowledgeBase'
import { formatDay, pluralize } from '../../utils/format'
import styles from './knowledgeBase.module.css'

const STATUS_TONE: Record<KbStatus, BadgeTone> = {
  Ready: 'success',
  Pending: 'pending',
  Failed: 'danger',
}

const STATUS_LABEL: Record<KbStatus, string> = {
  Ready: 'Ready',
  Pending: 'Processing…',
  Failed: 'Failed',
}

export function DocumentStatusBadge({ status }: { status: KbStatus }) {
  return <Badge tone={STATUS_TONE[status]}>{STATUS_LABEL[status]}</Badge>
}

/** "In use" only when the AI can actually use it: processed and enabled. */
export function AiUseBadge({ doc }: { doc: KnowledgeDocument }) {
  if (!doc.enabled) return <Badge tone="neutral">Turned off</Badge>
  if (doc.status === 'Failed') return <Badge tone="neutral">Not used</Badge>
  if (doc.status !== 'Ready') return <Badge tone="neutral">Not yet</Badge>
  return <Badge tone="success">In use</Badge>
}

/** Knowledge base list. The title and "Open" both go to the document page. */
export function DocumentsTable({ documents }: { documents: KnowledgeDocument[] }) {
  return (
    <div className={styles.tableWrap}>
      <table className={styles.table}>
        <thead>
          <tr>
            <th scope="col">Document</th>
            <th scope="col">Processing</th>
            <th scope="col">Passages</th>
            <th scope="col">AI use</th>
            <th scope="col">Uploaded</th>
            <th scope="col">
              <span className="visually-hidden">Actions</span>
            </th>
          </tr>
        </thead>
        <tbody>
          {documents.map((doc) => (
            <tr key={doc.id}>
              <td>
                <Link to={`/admin/knowledge-base/${doc.id}`} className={styles.docLink}>
                  {doc.title}
                </Link>
                <span className={styles.muted}>
                  {KB_CATEGORY_LABELS[doc.category]} · {doc.fileName}
                </span>
              </td>
              <td>
                <DocumentStatusBadge status={doc.status} />
              </td>
              <td className={styles.nowrap}>{doc.status === 'Ready' ? pluralize(doc.chunkCount, 'passage') : '—'}</td>
              <td>
                <AiUseBadge doc={doc} />
              </td>
              <td className={styles.nowrap}>{formatDay(doc.uploadedAt)}</td>
              <td>
                <Button variant="outline" to={`/admin/knowledge-base/${doc.id}`}>
                  Open<span className="visually-hidden"> {doc.title}</span>
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {documents.length === 0 && <p className={styles.empty}>No documents match.</p>}
    </div>
  )
}
