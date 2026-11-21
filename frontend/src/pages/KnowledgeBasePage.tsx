import { useState } from 'react'
import { Button } from '../components/Button'
import { Card } from '../components/Card'
import { FilterTabs } from '../components/FilterTabs'
import { PageHeader } from '../components/PageHeader'
import { DocumentsTable } from '../features/knowledgeBase/DocumentsTable'
import { useDocuments } from '../features/knowledgeBase/useKnowledgeBase'
import styles from '../features/knowledgeBase/knowledgeBase.module.css'
import {
  KB_CATEGORIES,
  KB_CATEGORY_LABELS,
  KB_SUPPORTED_EXTENSIONS,
  type KbCategory,
  type KbStatus,
} from '../types/knowledgeBase'

type StatusFilter = 'all' | KbStatus

/** /admin/knowledge-base: documents the AI may use, with their processing status. */
export function KnowledgeBasePage() {
  const { data: documents = [], isPending, isError } = useDocuments()
  const [status, setStatus] = useState<StatusFilter>('all')
  const [category, setCategory] = useState<'all' | KbCategory>('all')
  const [search, setSearch] = useState('')

  const countOf = (value: KbStatus) => documents.filter((d) => d.status === value).length
  const term = search.trim().toLowerCase()
  const shown = documents
    .filter((d) => status === 'all' || d.status === status)
    .filter((d) => category === 'all' || d.category === category)
    .filter((d) => !term || `${d.title} ${d.fileName}`.toLowerCase().includes(term))

  return (
    <>
      <title>Knowledge base · Anchored Administration</title>

      <PageHeader
        title="Knowledge base"
        description="Practice information the AI may use in its replies. Only processed documents that are turned on are used."
        actions={<Button to="/admin/knowledge-base/new">Upload document</Button>}
      />

      <div className={styles.layout}>
        <section>
          <div className={styles.toolbar}>
            <FilterTabs
              label="Filter by processing status"
              value={status}
              onChange={setStatus}
              tabs={[
                { value: 'all', label: 'All', count: documents.length },
                { value: 'Ready', label: 'Ready', count: countOf('Ready') },
                { value: 'Pending', label: 'Processing', count: countOf('Pending') },
                { value: 'Failed', label: 'Failed', count: countOf('Failed') },
              ]}
            />
            <div className={styles.toolbarFields}>
              <select
                className={styles.input}
                aria-label="Filter by category"
                value={category}
                onChange={(e) => setCategory(e.target.value as 'all' | KbCategory)}
              >
                <option value="all">All categories</option>
                {KB_CATEGORIES.map((value) => (
                  <option key={value} value={value}>
                    {KB_CATEGORY_LABELS[value]}
                  </option>
                ))}
              </select>
              <input
                type="search"
                className={`${styles.input} ${styles.search}`}
                placeholder="Search title or file name"
                aria-label="Search documents"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>

          {isPending && <p>Loading documents…</p>}
          {isError && <p role="alert">The documents couldn't be loaded.</p>}
          {!isPending && !isError && <DocumentsTable documents={shown} />}
        </section>

        <aside className={styles.sidebar}>
          <Card>
            <h2 className={styles.sideTitle}>Writing guidelines</h2>
            <ul className={styles.list}>
              <li>Write for patients: plain language, short sections.</li>
              <li>Never include patient information.</li>
              <li>No diagnosis or medication advice.</li>
              <li>Leave a blank line between topics; each block becomes a passage.</li>
            </ul>
          </Card>

          <Card>
            <h2 className={styles.sideTitle}>How the AI uses this</h2>
            <p className={styles.sideText}>
              After upload, the text is extracted and split into short passages. For each patient message, the AI can
              receive the passages most related to it.
            </p>
            <p className={styles.sideText}>
              Allowed files: {KB_SUPPORTED_EXTENSIONS.join(', ')}. Scanned PDFs contain no text and will fail.
            </p>
          </Card>
        </aside>
      </div>
    </>
  )
}
