import { useState, useEffect } from 'react'

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
                <li key={task.id} style={{ marginBottom: '0.5rem', display: 'flex', alignItems: 'center' }}>
                    <label style={{ flex: 1, display: 'flex', alignItems: 'center' }}>
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
                                style={{
                                    marginLeft: '0.5rem',
                                    flex: 1,
                                    border: '1px solid #ccc',
                                    borderRadius: '4px',
                                    padding: '0.25rem'
                                }}
                            />
                        ) : (
                            <span
                                className={task.done ? 'done' : ''}
                                style={{ marginLeft: '0.5rem', flex: 1 }}
                            >
              {task.text}
            </span>
                        )}
                    </label>
                    <button
                        onClick={() => setEditingId(task.id)}
                        style={{
                            marginLeft: '0.5rem',
                            background: 'none',
                            border: 'none',
                            color: '#555',
                            cursor: 'pointer',
                            fontSize: '1rem'
                        }}
                        title="Edytuj zadanie"
                    >
                        ✏️
                    </button>
                    <button
                        onClick={() => onRemove(task.id)}
                        style={{
                            marginLeft: '0.5rem',
                            background: 'none',
                            border: 'none',
                            color: '#c00',
                            cursor: 'pointer',
                            fontSize: '1rem'
                        }}
                        title="Usuń zadanie"
                    >
                        🗑
                    </button>
                </li>
            ))}
        </ul>
    )
}