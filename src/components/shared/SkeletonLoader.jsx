import styles from './SkeletonLoader.module.scss'

export default function SkeletonLoader() {
  return (
    <div className={styles.skeletonWrapper}>
      <div className={styles.skeletonLabel}>
        <span className={styles.brain}>🧠</span>
        <span className={styles.labelText}>Strukturyzuję myśl...</span>
      </div>

      {/* Szkielet notatki */}
      <div className={styles.skeletonCard}>
        <div className={styles.cardHeader}>
          <div className={`${styles.shimmer} ${styles.titleLine}`}></div>
          <div className={`${styles.shimmer} ${styles.badge}`}></div>
        </div>
        <div className={styles.cardBody}>
          <div className={`${styles.shimmer} ${styles.line} ${styles.lineWide}`}></div>
          <div className={`${styles.shimmer} ${styles.line} ${styles.lineMed}`}></div>
          <div className={`${styles.shimmer} ${styles.line} ${styles.lineShort}`}></div>
        </div>
      </div>

      {/* Szkielet checklisty */}
      <div className={`${styles.skeletonCard} ${styles.checklistCard}`}>
        <div className={styles.cardHeader}>
          <div className={`${styles.shimmer} ${styles.titleLine} ${styles.titleGreen}`}></div>
          <div className={`${styles.shimmer} ${styles.badge} ${styles.badgeGreen}`}></div>
        </div>
        <div className={styles.cardBody}>
          {[1, 2, 3].map(i => (
            <div key={i} className={styles.checkItem}>
              <div className={`${styles.shimmer} ${styles.checkBox}`}></div>
              <div className={`${styles.shimmer} ${styles.checkLine}`} style={{ width: `${60 + i * 10}%` }}></div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
