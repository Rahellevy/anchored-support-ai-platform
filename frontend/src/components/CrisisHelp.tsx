import styles from './CrisisHelp.module.css'

/**
 * Emergency numbers, shown wherever a patient might need them (chat notice, "Who can see this?",
 * patient home). Keep the wording identical everywhere so it's recognizable.
 */
export function CrisisHelp() {
  return (
    <p className={styles.help}>
      <strong>Need help now?</strong> Call 911, or call or text 988. This app can't respond to emergencies.
    </p>
  )
}
