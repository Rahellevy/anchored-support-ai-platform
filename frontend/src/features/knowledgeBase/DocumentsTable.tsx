import { Link } from 'react-router-dom'
import { Badge, type BadgeTone } from '../../components/Badge'
import { Button } from '../../components/Button'
import type { DocumentStatus, KnowledgeDocument } from '../../types/knowledgeBase'
import { formatDay, pluralize } from '../../utils/format'
import styles from './knowledgeBase.module.css'

const STATUS_TONE: Record<DocumentStatus, BadgeTone> = {
  Published: 'success',
  'Awaiting approval': 'pending',
  Draft: 'warning',
}

export function DocumentStatusBadge({ status }: { status: DocumentStatus }) {
  return <Badge tone={STATUS_TONE[status]}>{status}</Badge>
}

/** Knowledge base list. Title and "Edit" both open the editor. */
export function DocumentsTable({ documents }: { documents: KnowledgeDocument[] }) {
  return (
    <div className={styles.tableWrap}>
      <table className={styles.table}>
        <thead>
          <tr>
            <th scope="col">Document</th>
            <th scope="col">Status</th>
            <th scope="col">AI uses (7 days)</th>
            <th scope="col">Last updated</th>
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
                <span className={styles.muted}>{doc.category}</span>
              </td>
              <td>
                <DocumentStatusBadge status={doc.status} />
              </td>
              <td>{doc.usedLast7Days > 0 ? pluralize(doc.usedLast7Days, 'time') : 'Not used'}</td>
              <td>
                {formatDay(doc.updatedAt)}
                <span className={styles.muted}>{doc.updatedBy}</span>
              </td>
              <td>
                <Button variant="outline" to={`/admin/knowledge-base/${doc.id}`}>
                  Edit<span className="visually-hidden"> {doc.title}</span>
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
