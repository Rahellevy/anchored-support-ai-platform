import styles from './FlagDisclaimer.module.css'

/** Shown wherever flags are listed, so nobody treats them as a safety guarantee. */
export function FlagDisclaimer() {
  return (
    <p className={styles.disclaimer}>
      Flags come from rules configured by Anchored Support Services. They can include false positives and can miss
      concerns, so they are not a clinical safety guarantee.
    </p>
  )
}
