import { useState, useEffect } from 'react'
import styles from './TaskList.module.scss'
import TaskItem from '../TaskItem/TaskItem' // zakładam, że plik nazywa się TaskItem.jsx

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
                <ul className={styles.incompleteList}>
                    {incompleteTasks.map(task => (
                        <TaskItem
                            key={task.id}          // klucz
                            task={task}           // przekazujemy całe zadanie
                            editingId={editingId}
                            setEditingId={setEditingId}
                            editedText={editedText}
                            setEditedText={setEditedText}
                            onToggle={onToggle}
                            onRemove={onRemove}
                            onEdit={onEdit}
                        />
                    ))}
                </ul>
            )}

            {completedTasks.length > 0 && (
                <ul className={styles.completedList}>
                    {completedTasks.map(task => (
                        <TaskItem
                            key={task.id}
                            task={task}
                            editingId={editingId}
                            setEditingId={setEditingId}
                            editedText={editedText}
                            setEditedText={setEditedText}
                            onToggle={onToggle}
                            onRemove={onRemove}
                            onEdit={onEdit}
                        />
                    ))}
                </ul>
            )}
        </div>
    )
}