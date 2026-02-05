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
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                    <polyline points="14 2 14 8 20 8"/>
                    <line x1="16" y1="13" x2="8" y2="13"/>
                    <line x1="16" y1="17" x2="8" y2="17"/>
                    <line x1="10" y1="9" x2="8" y2="9"/>
                </svg>
            </button>
            <button
                className={activeView === 'chat' ? styles.active : ''}
                onClick={() => onSwitch('chat')}
                aria-label="Nagraj"
            >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/>
                    <path d="M19 10v2a7 7 0 0 1-14 0v-2"/>
                    <line x1="12" y1="19" x2="12" y2="23"/>
                    <line x1="8" y1="23" x2="16" y2="23"/>
                </svg>
            </button>
        </nav>
    )
}

NavBar.propTypes = {
    activeView: PropTypes.oneOf(['notes', 'chat']).isRequired,
    onSwitch: PropTypes.func.isRequired,
}

export default memo(NavBar)