import { memo } from 'react'
import PropTypes from 'prop-types'
import styles from './NavBar.module.scss'

function NavBar({ activeView, onSwitch }) {
    return (
        <nav className={styles.navBar}>
            {/* GRUPA 1: Sekcje (małe przyciski) */}
            <button
                className={`${styles.navButton} ${styles.sectionButton} ${activeView === 'mynotes' ? styles.active : ''}`}
                onClick={() => onSwitch('mynotes')}
                aria-label="Moje notatki"
            >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                    <polyline points="14 2 14 8 20 8"/>
                    <line x1="16" y1="13" x2="8" y2="13"/>
                    <line x1="16" y1="17" x2="8" y2="17"/>
                    <line x1="10" y1="9" x2="8" y2="9"/>
                </svg>
            </button>

            <button
                className={`${styles.navButton} ${styles.sectionButton} ${activeView === 'checklists' ? styles.active : ''}`}
                onClick={() => onSwitch('checklists')}
                aria-label="Checklisty"
            >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M9 11l3 3L22 4"/>
                    <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/>
                </svg>
            </button>

            <button
                className={`${styles.navButton} ${styles.sectionButton} ${activeView === 'events' ? styles.active : ''}`}
                onClick={() => onSwitch('events')}
                aria-label="Wydarzenia"
            >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                    <line x1="16" y1="2" x2="16" y2="6"/>
                    <line x1="8" y1="2" x2="8" y2="6"/>
                    <line x1="3" y1="10" x2="21" y2="10"/>
                </svg>
            </button>

            {/* SEPARATOR */}
            <div className={styles.separator} />

            {/* GRUPA 2: Akcje (większe przyciski) */}
            <button
                className={`${styles.navButton} ${styles.actionButton} ${activeView === 'inbox' ? styles.active : ''}`}
                onClick={() => onSwitch('inbox')}
                aria-label="Inbox"
            >
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="22 12 16 12 14 15 10 15 8 12 2 12"/>
                    <path d="M5.45 5.11L2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z"/>
                </svg>
            </button>

            <button
                className={`${styles.navButton} ${styles.recordButton} ${activeView === 'chat' ? styles.active : ''}`}
                onClick={() => onSwitch('chat')}
                aria-label="Nagraj"
            >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
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
    activeView: PropTypes.oneOf(['mynotes', 'checklists', 'events', 'inbox', 'chat']).isRequired,
    onSwitch: PropTypes.func.isRequired,
}

export default memo(NavBar)
