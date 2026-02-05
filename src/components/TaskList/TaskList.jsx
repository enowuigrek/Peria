import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import styles from './TaskList.module.scss'

export default function TaskList({ tasks, onToggle, onRemove, onEdit }) {
    const [editingId, setEditingId] = useState(null)
    const [editedText, setEditedText] = useState('')

    useEffect(() => {
        const taskToEdit = tasks.find(t => t.id === editingId)
        if (taskToEdit) {
            setEditedText(taskToEdit.text)
        } else {
            setEditedText('')
        }
    }, [editingId, tasks])

    if (tasks.length === 0) return <p>Na czysto</p>

    const incompleteTasks = tasks.filter(task => !task.done)
    const completedTasks = tasks.filter(task => task.done)

    return (
        <div>
            {incompleteTasks.length > 0 && (
                <>
                    <h2 className={styles.sectionTitle}>Do zrobienia</h2>
                    <AnimatePresence>
                        <ul className={styles.incompleteList}>
                            {incompleteTasks.map(task => (
                                <motion.li
                                    key={task.id}
                                    className={styles.taskItem}
                                    initial={{ opacity: 0, y: -10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: 10 }}
                                    layout
                                >
                                    <label className={styles.taskLabel}>
                                        <input
                                            type="checkbox"
                                            checked={task.done}
                                            onChange={() => onToggle(task.id)}
                                        />
                                        {editingId === task.id ? (
                                            <input
                                                type="text"
                                                value={editedText}
                                                onChange={(e) => setEditedText(e.target.value)}
                                                onKeyDown={(e) => {
                                                    if (e.key === 'Enter') {
                                                        onEdit(task.id, editedText)
                                                        setEditingId(null)
                                                    }
                                                }}
                                                onBlur={() => {
                                                    onEdit(task.id, editedText)
                                                    setEditingId(null)
                                                }}
                                                autoFocus
                                                className={styles.editInput}
                                            />
                                        ) : (
                                            <span className={`${task.done ? styles.done : ''} ${styles.taskText}`}>
                                                {task.text}
                                            </span>
                                        )}
                                    </label>
                                    <button
                                        onClick={() => setEditingId(task.id)}
                                        className={styles.editButton}
                                        title="Edytuj zadanie"
                                    >
                                        ✏️
                                    </button>
                                    <button
                                        onClick={() => onRemove(task.id)}
                                        className={styles.deleteButton}
                                        title="Usuń zadanie"
                                    >
                                        🗑
                                    </button>
                                </motion.li>
                            ))}
                        </ul>
                    </AnimatePresence>
                </>
            )}

            {completedTasks.length > 0 && (
                <>
                    <h2 className={styles.sectionTitle}>Ukończone</h2>
                    <AnimatePresence>
                        {completedTasks.map(task => (
                            <motion.li
                                key={task.id}
                                className={styles.taskItem}
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: 10 }}
                                layout
                            >
                                <label className={styles.taskLabel}>
                                    <input
                                        type="checkbox"
                                        checked={task.done}
                                        onChange={() => onToggle(task.id)}
                                    />
                                    <span className={`${styles.done} ${styles.taskText}`}>
                                        {task.text}
                                    </span>
                                </label>
                                <button
                                    onClick={() => setEditingId(task.id)}
                                    className={styles.editButton}
                                    title="Edytuj zadanie"
                                >
                                    ✏️
                                </button>
                                <button
                                    onClick={() => onRemove(task.id)}
                                    className={styles.deleteButton}
                                    title="Usuń zadanie"
                                >
                                    🗑
                                </button>
                            </motion.li>
                        ))}
                    </AnimatePresence>
                </>
            )}
        </div>
    )
}