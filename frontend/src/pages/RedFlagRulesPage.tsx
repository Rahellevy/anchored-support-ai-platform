import { useState } from 'react'
import { Button } from '../components/Button'
import { PageHeader } from '../components/PageHeader'
import { RuleEditor } from '../features/redFlagRules/RuleEditor'
import { RulesTable } from '../features/redFlagRules/RulesTable'
import { useRedFlagCategories } from '../features/redFlagRules/useRedFlagCategories'
import styles from '../features/redFlagRules/rules.module.css'

/** /admin/rules: red-flag categories, and an editor for the selected one. */
export function RedFlagRulesPage() {
  const { data: categories = [], isPending } = useRedFlagCategories()
  const [selectedCode, setSelectedCode] = useState<string | null>(null)
  const [statusMessage, setStatusMessage] = useState('')

  // Default to the first category until the admin picks one.
  const selected = categories.find((c) => c.code === selectedCode) ?? categories[0]

  return (
    <>
      <title>Red-flag rules · Anchored Administration</title>

      <PageHeader
        title="Red-flag rules"
        description="What gets flagged in patient conversations, how serious it is, and who is notified."
        // TODO: new-category form
        actions={
          <Button onClick={() => setStatusMessage('New categories are not connected yet.')}>New category</Button>
        }
      />
      {statusMessage && (
        <p className={styles.statusNote} role="status">
          {statusMessage}
        </p>
      )}

      <p className={styles.sponsorNotice}>
        Draft categories proposed by the development team from common clinical risk-assessment areas. They take
        effect only after Anchored Support Services reviews and approves them.
      </p>

      {isPending || !selected ? (
        <p>Loading rules…</p>
      ) : (
        <div className={styles.layout}>
          <RulesTable categories={categories} selectedCode={selected.code} onSelect={setSelectedCode} />
          {/* key: a new category gets a fresh editor (and a fresh draft) instead of reusing the old one */}
          <RuleEditor key={selected.code} category={selected} />
        </div>
      )}
    </>
  )
}
