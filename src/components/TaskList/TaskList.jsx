import { useState, useEffect } from 'react'
import PropTypes from 'prop-types'
import styles from './TaskList.module.scss'
import TaskItem from '../TaskItem/TaskItem'

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

    if (tasks.length === 0) {
        return (
            <div style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '4rem 2rem',
                color: 'var(--text-muted, #6b7280)',
                textAlign: 'center',
                gap: '1rem'
            }}>
                <div style={{ fontSize: '3rem', opacity: 0.3 }}>✓</div>
                <p style={{ fontSize: '1.1rem', margin: 0 }}>Brak zadań</p>
                <p style={{ fontSize: '0.9rem', opacity: 0.6, margin: 0 }}>Dodaj nowe zadanie, aby rozpocząć</p>
            </div>
        )
    }

    const incompleteTasks = tasks.filter(task => !task.done)
    const completedTasks = tasks.filter(task => task.done)

    return (
        <div>
            {incompleteTasks.length > 0 && (
                <ul className={styles.incompleteList}>
                    {incompleteTasks.map((task) => {
                        if (!task || typeof task !== 'object' || !('id' in task && 'text' in task && 'done' in task)) return null;
                        const validTask = task;
                        return (
                            <TaskItem
                                key={String(validTask.id)}
                                task={validTask}
                                editingId={editingId}
                                setEditingId={setEditingId}
                                editedText={editedText}
                                setEditedText={setEditedText}
                                onToggle={onToggle}
                                onRemove={onRemove}
                                onEdit={onEdit}
                            />
                        )
                    })}
                </ul>
            )}

            {completedTasks.length > 0 && (
                <ul className={styles.completedList}>
                    {completedTasks.map((task) => {
                        if (!task || typeof task !== 'object' || !('id' in task && 'text' in task && 'done' in task)) return null;
                        const validTask = task;
                        return (
                            <TaskItem
                                key={String(validTask.id)}
                                task={validTask}
                                editingId={editingId}
                                setEditingId={setEditingId}
                                editedText={editedText}
                                setEditedText={setEditedText}
                                onToggle={onToggle}
                                onRemove={onRemove}
                                onEdit={onEdit}
                            />
                        )
                    })}
                </ul>
            )}
        </div>
    )
}

TaskList.propTypes = {
    tasks: PropTypes.arrayOf(
        PropTypes.shape({
            id: PropTypes.string.isRequired,
            text: PropTypes.string.isRequired,
            done: PropTypes.bool.isRequired,
        })
    ).isRequired,
    onToggle: PropTypes.func.isRequired,
    onRemove: PropTypes.func.isRequired,
    onEdit: PropTypes.func.isRequired,
}