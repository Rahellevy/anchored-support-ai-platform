import { useState } from 'react'
import { Button } from '../components/Button'
import { PageHeader } from '../components/PageHeader'
import { RuleEditor } from '../features/redFlagRules/RuleEditor'
import { RulesTable } from '../features/redFlagRules/RulesTable'
import { useRedFlagRules } from '../features/redFlagRules/useRedFlagRules'
import styles from '../features/redFlagRules/rules.module.css'

/** What the editor shows: a rule by id, a new rule, or (null) the first rule by default. */
type Selection = number | 'new' | null

/** /admin/rules: red-flag rules, and an editor for the selected (or a new) rule. */
export function RedFlagRulesPage() {
  const { data: rules = [], isPending, isError } = useRedFlagRules()
  const [selection, setSelection] = useState<Selection>(null)

  const selected = selection === 'new' ? undefined : (rules.find((r) => r.id === selection) ?? rules[0])
  const showNew = selection === 'new' || (!isPending && rules.length === 0)

  return (
    <>
      <title>Red-flag rules · Anchored Administration</title>

      <PageHeader
        title="Red-flag rules"
        description="What gets flagged in patient conversations and how serious it is. Matches raise an alert for the patient's therapist."
        actions={<Button onClick={() => setSelection('new')}>New rule</Button>}
      />

      <p className={styles.sponsorNotice}>
        Rules decide which messages alert a therapist. Agree the wording and severities with Anchored Support Services
        before relying on them with real patients.
      </p>

      {isPending && <p>Loading rules…</p>}
      {isError && <p role="alert">The rules couldn't be loaded.</p>}

      {!isPending && !isError && (
        <div className={styles.layout}>
          <RulesTable rules={rules} selectedId={showNew ? null : (selected?.id ?? null)} onSelect={setSelection} />
          {/* key: a different selection gets a fresh editor (and a fresh draft) */}
          <RuleEditor
            key={showNew ? 'new' : selected?.id}
            rule={showNew ? undefined : selected}
            onCreated={(rule) => setSelection(rule.id)}
            onDeleted={() => setSelection(null)}
          />
        </div>
      )}
    </>
  )
}
