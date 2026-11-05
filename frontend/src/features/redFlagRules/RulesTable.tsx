import { Badge } from '../../components/Badge'
import { SeverityBadge } from '../../components/SeverityBadge'
import type { RedFlagCategory } from '../../types/flags'
import { APPROVAL_TONES, DETECTION_LABELS, notifyLabel } from './labels'
import styles from './rules.module.css'

/**
 * All red-flag categories. Clicking a row (or its name button, for keyboard users)
 * selects it for editing.
 */
interface RulesTableProps {
  categories: RedFlagCategory[]
  selectedCode: string | null
  onSelect: (code: string) => void
}

export function RulesTable({ categories, selectedCode, onSelect }: RulesTableProps) {
  return (
    <div className={styles.tableWrap}>
      <table className={styles.table}>
        <thead>
          <tr>
            <th scope="col">Category</th>
            <th scope="col">Severity</th>
            <th scope="col">Detection</th>
            <th scope="col">Notifies</th>
            <th scope="col">Sponsor approval</th>
          </tr>
        </thead>
        <tbody>
          {categories.map((category) => (
            <tr
              key={category.code}
              className={category.code === selectedCode ? styles.selected : undefined}
              onClick={() => onSelect(category.code)}
            >
              <td>
                <button
                  type="button"
                  className={styles.rowButton}
                  aria-pressed={category.code === selectedCode}
                  onClick={(e) => {
                    e.stopPropagation() // the row's onClick would fire too
                    onSelect(category.code)
                  }}
                >
                  {category.name}
                  <span className={styles.code}>{category.code}</span>
                </button>
              </td>
              <td>
                <SeverityBadge severity={category.severity} />
              </td>
              <td>{DETECTION_LABELS[category.detection]}</td>
              <td>{notifyLabel(category.notify)}</td>
              <td>
                <Badge tone={APPROVAL_TONES[category.approval]}>{category.approval}</Badge>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
