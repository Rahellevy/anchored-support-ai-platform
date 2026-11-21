import styles from './FilterTabs.module.css'

/**
 * Row of pill buttons that filter a list (Alerts: Open/High/..., Users: All/Patients/...).
 * They're toggle buttons (aria-pressed), not real tabs, because they filter one list in place.
 *
 *   <FilterTabs label="Filter alerts" value={filter} onChange={setFilter}
 *     tabs={[{ value: 'open', label: 'Open', count: 2 }, ...]} />
 */
export interface FilterTab<T extends string> {
  value: T
  label: string
  count?: number
}

interface FilterTabsProps<T extends string> {
  label: string
  tabs: FilterTab<T>[]
  value: T
  onChange: (value: T) => void
}

export function FilterTabs<T extends string>({ label, tabs, value, onChange }: FilterTabsProps<T>) {
  return (
    <div className={styles.tabs} role="group" aria-label={label}>
      {tabs.map((tab) => (
        <button
          key={tab.value}
          type="button"
          className={styles.tab}
          aria-pressed={tab.value === value}
          onClick={() => onChange(tab.value)}
        >
          {tab.label}
          {tab.count !== undefined && ` (${tab.count})`}
        </button>
      ))}
    </div>
  )
}
