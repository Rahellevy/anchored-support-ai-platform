import styles from './SafetyBanner.module.css'

/** Full-width notice shown at the top of every portal page. */
export const SafetyBanner = () => {
  return (
    <div className={styles.banner} role="note">
      Synthetic data only. Proof of concept. This system is not a crisis or emergency service.
    </div>
  )
}
