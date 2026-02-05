import styles from './NavBar.module.scss' // jeśli chcesz mieć osobne style, w razie czego możesz ten plik stworzyć i wrzucić tam style

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