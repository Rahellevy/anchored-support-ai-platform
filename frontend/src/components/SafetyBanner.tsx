import styles from './SafetyBanner.module.css'

const DEFAULT_MESSAGE = 'Synthetic data only. Proof of concept. This system is not a crisis or emergency service.'

/** Full-width notice under the header on every portal page. */
export function SafetyBanner({ message = DEFAULT_MESSAGE }: { message?: string }) {
  return (
    <div className={styles.banner} role="note">
      {message}
    </div>
  )
}
