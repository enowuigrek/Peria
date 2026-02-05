import { memo } from 'react'
import PropTypes from 'prop-types'
import styles from './NavBar.module.scss'

function NavBar({ activeView, onSwitch }) {
    return (
        <nav className={styles.navBar}>
            <button
                className={activeView === 'notes' ? styles.active : ''}
                onClick={() => onSwitch('notes')}
                aria-label="Notatki"
            >
                📝
            </button>
            <button
                className={activeView === 'chat' ? styles.active : ''}
                onClick={() => onSwitch('chat')}
                aria-label="Nagraj"
            >
                🎤
            </button>
        </nav>
    )
}

NavBar.propTypes = {
    activeView: PropTypes.oneOf(['notes', 'chat']).isRequired,
    onSwitch: PropTypes.func.isRequired,
}

export default memo(NavBar)