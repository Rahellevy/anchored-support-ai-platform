import { useState, type FormEvent } from 'react'
import { Button } from '../../components/Button'
import { Card } from '../../components/Card'
import type { MatchType, RedFlagRule, Severity } from '../../types/redFlagRules'
import { apiErrorMessage } from '../../utils/apiError'
import { MATCH_TYPE_DESCRIPTIONS, MATCH_TYPE_LABELS } from './labels'
import { useDeleteRedFlagRule, useSaveRedFlagRule } from './useRedFlagRules'
import styles from './rules.module.css'

const SEVERITIES: Severity[] = ['High', 'Medium', 'Low']
const MATCH_TYPES: MatchType[] = ['Llm', 'Phrase']

type Draft = Pick<RedFlagRule, 'name' | 'pattern' | 'matchType' | 'severity' | 'enabled'>

const EMPTY: Draft = { name: '', pattern: '', matchType: 'Llm', severity: 'Medium', enabled: true }

interface RuleEditorProps {
  /** The rule to edit, or undefined to create a new one. */
  rule?: RedFlagRule
  /** Called after a new rule is created (to select it) or a rule is deleted. */
  onCreated: (rule: RedFlagRule) => void
  onDeleted: () => void
}

/**
 * Create or edit one rule. Keeps its own draft, so nothing changes until "Save".
 * The page renders it with key={rule id or "new"}, which starts a fresh draft when the selection changes.
 */
export function RuleEditor({ rule, onCreated, onDeleted }: RuleEditorProps) {
  const [draft, setDraft] = useState<Draft>(rule ?? EMPTY)
  const [statusMessage, setStatusMessage] = useState('')
  const [error, setError] = useState('')
  const [confirmingDelete, setConfirmingDelete] = useState(false)
  const save = useSaveRedFlagRule()
  const remove = useDeleteRedFlagRule()

  const update = <K extends keyof Draft>(field: K, value: Draft[K]) => {
    setDraft((current) => ({ ...current, [field]: value }))
    setStatusMessage('')
  }

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError('')
    const fields = {
      name: draft.name.trim(),
      pattern: draft.pattern.trim(),
      matchType: draft.matchType,
      severity: draft.severity,
    }
    if (!fields.name || !fields.pattern) {
      setError('Give the rule a name and say what it should catch.')
      return
    }

    save.mutate(rule ? { ...fields, id: rule.id, enabled: draft.enabled } : fields, {
      onSuccess: (saved) => {
        setStatusMessage(rule ? 'Rule saved.' : 'Rule created.')
        if (!rule) onCreated(saved)
      },
      onError: (err) => setError(apiErrorMessage(err, 'The rule could not be saved. Please try again.')),
    })
  }

  const handleDelete = () => {
    if (!rule) return
    if (!confirmingDelete) {
      setConfirmingDelete(true)
      return
    }
    remove.mutate(rule.id, {
      onSuccess: onDeleted,
      onError: (err) => setError(apiErrorMessage(err, 'The rule could not be deleted.')),
    })
  }

  const isLlm = draft.matchType === 'Llm'

  return (
    <Card className={styles.editor}>
      <form onSubmit={handleSubmit} aria-labelledby="editor-title" noValidate>
        <h2 id="editor-title" className={styles.editorTitle}>
          {rule ? `Edit: ${rule.name}` : 'New rule'}
        </h2>

        <div className={styles.field}>
          <label htmlFor="rule-name">Name</label>
          <input
            id="rule-name"
            className={styles.input}
            maxLength={100}
            value={draft.name}
            onChange={(e) => update('name', e.target.value)}
            placeholder="e.g. Suicide risk"
          />
        </div>

        <fieldset className={styles.fieldset}>
          <legend>Detection method</legend>
          {MATCH_TYPES.map((matchType) => (
            <label key={matchType} className={styles.choice}>
              <input
                type="radio"
                name="matchType"
                value={matchType}
                checked={draft.matchType === matchType}
                onChange={() => update('matchType', matchType)}
              />
              <span className={styles.choiceText}>
                {MATCH_TYPE_LABELS[matchType]}
                <small>{MATCH_TYPE_DESCRIPTIONS[matchType]}</small>
              </span>
            </label>
          ))}
        </fieldset>

        <div className={styles.field}>
          <label htmlFor="rule-pattern">{isLlm ? 'What should it catch?' : 'Phrase to match'}</label>
          {isLlm ? (
            <textarea
              id="rule-pattern"
              className={styles.input}
              maxLength={500}
              value={draft.pattern}
              onChange={(e) => update('pattern', e.target.value)}
              placeholder="Describe the concern, e.g. thoughts of harming themselves or someone else"
            />
          ) : (
            <input
              id="rule-pattern"
              className={styles.input}
              maxLength={500}
              value={draft.pattern}
              onChange={(e) => update('pattern', e.target.value)}
              placeholder="e.g. end my life"
            />
          )}
          <p className={styles.hint}>
            {isLlm
              ? 'Describe the concern in plain language rather than listing keywords.'
              : 'Matched as whole words, ignoring case: "hurt" does not match "hurtle".'}
          </p>
        </div>

        <div className={styles.field}>
          <label htmlFor="severity">Severity</label>
          <select
            id="severity"
            className={styles.input}
            value={draft.severity}
            onChange={(e) => update('severity', e.target.value as Severity)}
          >
            {SEVERITIES.map((severity) => (
              <option key={severity}>{severity}</option>
            ))}
          </select>
        </div>

        {rule && (
          <label className={styles.choice}>
            <input type="checkbox" checked={draft.enabled} onChange={(e) => update('enabled', e.target.checked)} />
            <span className={styles.choiceText}>
              Rule is on
              <small>Turned-off rules are kept but don't flag messages.</small>
            </span>
          </label>
        )}

        <div className={styles.actions}>
          <Button type="submit" disabled={save.isPending}>
            {save.isPending ? 'Saving…' : rule ? 'Save changes' : 'Create rule'}
          </Button>
          {rule && (
            <Button variant="secondary" onClick={handleDelete} disabled={remove.isPending}>
              {confirmingDelete ? 'Confirm delete' : 'Delete'}
            </Button>
          )}
        </div>

        {error && (
          <p className={styles.error} role="alert">
            {error}
          </p>
        )}
        <p className={styles.statusNote} role="status">
          {confirmingDelete && !error
            ? 'Alerts this rule already raised are kept. Turning the rule off is usually enough.'
            : statusMessage}
        </p>
      </form>
    </Card>
  )
}
