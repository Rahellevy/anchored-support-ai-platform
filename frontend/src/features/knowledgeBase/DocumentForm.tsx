import { useState, type FormEvent } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { Button } from '../../components/Button'
import { Card } from '../../components/Card'
import { DOCUMENT_CATEGORIES, type DocumentInput, type KnowledgeDocument } from '../../types/knowledgeBase'
import { useSaveDocument } from './useKnowledgeBase'
import styles from './knowledgeBase.module.css'

const EMPTY: DocumentInput = { title: '', category: 'Practice information', content: '' }

/**
 * Create or edit one document. Keeps its own draft; nothing is saved until a button is pressed.
 * The page renders it with key={document id}, so switching documents starts a fresh form.
 */
export function DocumentForm({ document }: { document?: KnowledgeDocument }) {
  const navigate = useNavigate()
  const location = useLocation()
  const save = useSaveDocument()
  const [draft, setDraft] = useState<DocumentInput>(document ?? EMPTY)
  // After creating a document we move to its URL; the message comes along in the navigation state.
  const [statusMessage, setStatusMessage] = useState<string>(location.state?.message ?? '')

  const update = <K extends keyof DocumentInput>(field: K, value: DocumentInput[K]) =>
    setDraft((current) => ({ ...current, [field]: value }))

  // Which button submitted the form: "Save draft" or "Submit for approval".
  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const submitter = (event.nativeEvent as SubmitEvent).submitter as HTMLButtonElement | null
    const submit = submitter?.value === 'submit'

    save.mutate(
      { input: draft, submit },
      {
        onSuccess: (saved) => {
          const message = submit
            ? 'Submitted to Anchored for approval. The AI will use it once it is published.'
            : 'Draft saved. Drafts are never sent to the AI.'
          setStatusMessage(message)
          // A new document now has an id: move to its own URL so later saves update it.
          if (!document) navigate(`/admin/knowledge-base/${saved.id}`, { replace: true, state: { message } })
        },
      },
    )
  }

  return (
    <Card className={styles.editor}>
      <form onSubmit={handleSubmit}>
        {document?.status === 'Published' && (
          <p className={styles.notice}>
            This document is live. Saving changes takes it out of use until Anchored approves the new version.
          </p>
        )}

        <div className={styles.field}>
          <label htmlFor="doc-title">Title</label>
          <input
            id="doc-title"
            className={styles.input}
            required
            value={draft.title}
            onChange={(e) => update('title', e.target.value)}
          />
        </div>

        <div className={styles.field}>
          <label htmlFor="doc-category">Category</label>
          <select
            id="doc-category"
            value={draft.category}
            onChange={(e) => update('category', e.target.value as DocumentInput['category'])}
          >
            {DOCUMENT_CATEGORIES.map((category) => (
              <option key={category}>{category}</option>
            ))}
          </select>
        </div>

        <div className={styles.field}>
          <label htmlFor="doc-content">Content</label>
          <textarea
            id="doc-content"
            className={styles.content}
            required
            value={draft.content}
            onChange={(e) => update('content', e.target.value)}
          />
          <p className={styles.hint}>
            Leave a blank line between topics. Each block becomes a passage the AI can receive.
          </p>
        </div>

        <div className={styles.actions}>
          <Button type="submit" value="submit" disabled={save.isPending}>
            Submit for approval
          </Button>
          <Button type="submit" value="draft" variant="secondary" disabled={save.isPending}>
            Save draft
          </Button>
        </div>

        <p className={styles.statusNote} role="status">
          {statusMessage}
        </p>
      </form>
    </Card>
  )
}
