import { useState, useEffect } from 'react'
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

    return (
        <ul>
            {tasks.map(task => (
                <li key={task.id} className={styles.taskItem}>
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
                </li>
            ))}
        </ul>
    )
}