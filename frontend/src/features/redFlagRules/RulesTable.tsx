import { Badge } from '../../components/Badge'
import { SeverityBadge } from '../../components/SeverityBadge'
import type { RedFlagRule } from '../../types/redFlagRules'
import { MATCH_TYPE_LABELS } from './labels'
import styles from './rules.module.css'

/**
 * All red-flag rules. Clicking a row (or its name button, for keyboard users) selects it for editing.
 */
interface RulesTableProps {
  rules: RedFlagRule[]
  selectedId: number | null
  onSelect: (id: number) => void
}

const SEVERITY_ORDER = { High: 0, Medium: 1, Low: 2 } as const

export function RulesTable({ rules, selectedId, onSelect }: RulesTableProps) {
  const sorted = [...rules].sort((a, b) => SEVERITY_ORDER[a.severity] - SEVERITY_ORDER[b.severity] || a.id - b.id)

  return (
    <div className={styles.tableWrap}>
      <table className={styles.table}>
        <thead>
          <tr>
            <th scope="col">Rule</th>
            <th scope="col">Severity</th>
            <th scope="col">Detection</th>
            <th scope="col">Status</th>
          </tr>
        </thead>
        <tbody>
          {sorted.map((rule) => (
            <tr
              key={rule.id}
              className={rule.id === selectedId ? styles.selected : undefined}
              onClick={() => onSelect(rule.id)}
            >
              <td>
                <button
                  type="button"
                  className={styles.rowButton}
                  aria-pressed={rule.id === selectedId}
                  onClick={(e) => {
                    e.stopPropagation() // the row's onClick would fire too
                    onSelect(rule.id)
                  }}
                >
                  {rule.name}
                  <span className={styles.code}>{rule.pattern}</span>
                </button>
              </td>
              <td>
                <SeverityBadge severity={rule.severity} />
              </td>
              <td>{MATCH_TYPE_LABELS[rule.matchType]}</td>
              <td>
                <Badge tone={rule.enabled ? 'success' : 'neutral'}>{rule.enabled ? 'On' : 'Off'}</Badge>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {rules.length === 0 && <p className={styles.small}>No rules yet. Use “New rule” to add one.</p>}
    </div>
  )
}
