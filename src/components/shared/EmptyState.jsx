import PropTypes from 'prop-types'
import styles from './EmptyState.module.scss'

export function EmptyState({ icon, message, hint }) {
  return (
    <div className={styles.emptyState}>
      {icon && <div className={styles.emptyIcon}>{icon}</div>}
      <p className={styles.emptyMessage}>{message}</p>
      {hint && <p className={styles.emptyHint}>{hint}</p>}
    </div>
  )
}

EmptyState.propTypes = {
  icon: PropTypes.string,
  message: PropTypes.string.isRequired,
  hint: PropTypes.string
}
