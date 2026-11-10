import { useState } from 'react'
import { Button } from '../components/Button'
import { Card } from '../components/Card'
import { FilterTabs } from '../components/FilterTabs'
import { PageHeader } from '../components/PageHeader'
import { DocumentsTable } from '../features/knowledgeBase/DocumentsTable'
import { useDocuments } from '../features/knowledgeBase/useKnowledgeBase'
import styles from '../features/knowledgeBase/knowledgeBase.module.css'
import type { DocumentStatus } from '../types/knowledgeBase'

type StatusFilter = 'all' | DocumentStatus

/** /admin/knowledge-base: practice information the AI may use, with status and usage. */
export function KnowledgeBasePage() {
  const { data: documents = [], isPending } = useDocuments()
  const [filter, setFilter] = useState<StatusFilter>('all')
  const [search, setSearch] = useState('')

  const countOf = (status: DocumentStatus) => documents.filter((d) => d.status === status).length
  const term = search.trim().toLowerCase()
  const shown = documents
    .filter((d) => filter === 'all' || d.status === filter)
    .filter((d) => !term || `${d.title} ${d.content}`.toLowerCase().includes(term))

  return (
    <>
      <title>Knowledge base · Anchored Administration</title>

      <PageHeader
        title="Knowledge base"
        description="Practice information the AI may use in its replies. Only published documents are ever sent to the AI."
        actions={<Button to="/admin/knowledge-base/new">New document</Button>}
      />

      <div className={styles.layout}>
        <section>
          <div className={styles.toolbar}>
            <FilterTabs
              label="Filter by status"
              value={filter}
              onChange={setFilter}
              tabs={[
                { value: 'all', label: 'All', count: documents.length },
                { value: 'Published', label: 'Published', count: countOf('Published') },
                { value: 'Awaiting approval', label: 'Awaiting approval', count: countOf('Awaiting approval') },
                { value: 'Draft', label: 'Drafts', count: countOf('Draft') },
              ]}
            />
            <input
              type="search"
              className={`${styles.input} ${styles.search}`}
              placeholder="Search title or text"
              aria-label="Search documents"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          {isPending ? <p>Loading documents…</p> : <DocumentsTable documents={shown} />}
        </section>

        <aside className={styles.sidebar}>
          <Card>
            <h2 className={styles.sideTitle}>Writing guidelines</h2>
            <ul className={styles.list}>
              <li>Write for patients: plain language, short sections.</li>
              <li>Never include patient information.</li>
              <li>No diagnosis or medication advice.</li>
              <li>Everything is reviewed by Anchored before it is published.</li>
            </ul>
          </Card>

          <Card>
            <h2 className={styles.sideTitle}>How the AI uses this</h2>
            <p className={styles.sideText}>
              Each published document is split into short passages. For every patient message, the AI receives up to
              three of the most relevant passages.
            </p>
          </Card>
        </aside>
      </div>
    </>
  )
}
