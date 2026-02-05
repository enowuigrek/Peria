import styles from './NavBar.module.scss'

export default function NavBar({ activeView, onSwitch }) {
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