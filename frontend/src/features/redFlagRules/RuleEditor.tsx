import { useState, type FormEvent } from 'react'
import { Button } from '../../components/Button'
import { Card } from '../../components/Card'
import type { DetectionMethod, NotifySettings, RedFlagCategory, Severity } from '../../types/flags'
import { useSubmitCategory } from './useRedFlagCategories'
import styles from './rules.module.css'

const SEVERITIES: Severity[] = ['High', 'Medium', 'Low']

const DETECTION_OPTIONS: { value: DetectionMethod; label: string }[] = [
  { value: 'rules', label: 'Keyword or pattern rules' },
  { value: 'llm', label: 'LLM classifier' },
  { value: 'both', label: 'Both (flag if either matches)' },
]

const NOTIFY_OPTIONS: { key: keyof NotifySettings; label: string }[] = [
  { key: 'therapistInApp', label: 'Assigned therapist, in-app' },
  { key: 'therapistEmail', label: 'Assigned therapist, email (no conversation content)' },
  { key: 'admins', label: 'Administrators' },
]

/**
 * Edit form for one category. It keeps its own draft copy, so nothing changes until
 * "Submit for sponsor approval". The page renders it with key={category.code}, which makes
 * React start a fresh form (fresh draft) whenever a different category is selected.
 */
export function RuleEditor({ category }: { category: RedFlagCategory }) {
  const [draft, setDraft] = useState<RedFlagCategory>(category)
  const [statusMessage, setStatusMessage] = useState('')
  const submit = useSubmitCategory()

  const update = <K extends keyof RedFlagCategory>(field: K, value: RedFlagCategory[K]) =>
    setDraft((current) => ({ ...current, [field]: value }))

  const toggleNotify = (key: keyof NotifySettings) =>
    setDraft((current) => ({ ...current, notify: { ...current.notify, [key]: !current.notify[key] } }))

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    submit.mutate(draft, {
      onSuccess: () => setStatusMessage('Submitted for sponsor approval. Nothing changes until it is approved.'),
    })
  }

  return (
    <Card className={styles.editor}>
      <form onSubmit={handleSubmit} aria-labelledby="editor-title">
        <h2 id="editor-title" className={styles.editorTitle}>
          Edit: {category.name} ({category.code})
        </h2>

        <div className={styles.field}>
          <label htmlFor="severity">Severity</label>
          <select id="severity" value={draft.severity} onChange={(e) => update('severity', e.target.value as Severity)}>
            {SEVERITIES.map((severity) => (
              <option key={severity}>{severity}</option>
            ))}
          </select>
        </div>

        <fieldset className={styles.fieldset}>
          <legend>Detection method</legend>
          {DETECTION_OPTIONS.map((option) => (
            <label key={option.value} className={styles.choice}>
              <input
                type="radio"
                name="detection"
                value={option.value}
                checked={draft.detection === option.value}
                onChange={() => update('detection', option.value)}
              />
              {option.label}
            </label>
          ))}
        </fieldset>

        <fieldset className={styles.fieldset}>
          <legend>Notify</legend>
          {NOTIFY_OPTIONS.map((option) => (
            <label key={option.key} className={styles.choice}>
              <input type="checkbox" checked={draft.notify[option.key]} onChange={() => toggleNotify(option.key)} />
              {option.label}
            </label>
          ))}
        </fieldset>

        <Button type="submit" fullWidth className={styles.editorButton} disabled={submit.isPending}>
          Submit for sponsor approval
        </Button>

        <p className={styles.statusNote} role="status">
          {statusMessage}
        </p>
        <p className={styles.small}>Changes take effect only after sponsor approval and are recorded in the audit log.</p>
      </form>
    </Card>
  )
}
