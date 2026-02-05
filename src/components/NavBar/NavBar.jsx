import { memo } from 'react'
import PropTypes from 'prop-types'
import styles from './NavBar.module.scss'

function NavBar({ activeView, onSwitch }) {
    return (
        <nav className={styles.navBar}>
            <button
                className={activeView === 'tasks' ? styles.active : ''}
                onClick={() => onSwitch('tasks')}
            >
                📝
            </button>
            <button
                className={activeView === 'chat' ? styles.active : ''}
                onClick={() => onSwitch('chat')}
            >
                💬
            </button>
            <button
                className={activeView === 'calendar' ? styles.active : ''}
                onClick={() => onSwitch('calendar')}
            >
                🗓
            </button>
        </nav>
    )
}

NavBar.propTypes = {
    activeView: PropTypes.oneOf(['tasks', 'chat', 'calendar']).isRequired,
    onSwitch: PropTypes.func.isRequired,
}

export default memo(NavBar)