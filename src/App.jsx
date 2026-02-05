import { useState, useEffect } from 'react'
import './App.scss'
import TaskInput from './components/TaskInput/TaskInput.jsx'
import TaskList from './components/TaskList/TaskList.jsx'

function App() {
    const [tasks, setTasks] = useState(() => {
        const stored = localStorage.getItem('myTasks')
        return stored ? JSON.parse(stored) : []
    })

    useEffect(() => {
        localStorage.setItem('myTasks', JSON.stringify(tasks))
    }, [tasks])

    const addTask = (text) => {
        setTasks(prev => [...prev, { id: Date.now(), text, done: false }])
    }

    const toggleTask = (id) => {
        setTasks(prev =>
            prev.map(task => task.id === id ? { ...task, done: !task.done } : task)
        )
    }

    const removeTask = (id) => {
        setTasks(prev => prev.filter(task => task.id !== id))
    }

    const editTask = (id, newText) => {
        setTasks(prev =>
            prev.map(task => task.id === id ? { ...task, text: newText } : task)
        )
    }

    return (
        <div className="app-wrapper">
            <div className="app-container">
                <TaskInput onAdd={addTask} />
                <TaskList tasks={tasks} onToggle={toggleTask} onRemove={removeTask} onEdit={editTask} />
            </div>
        </div>
    )
}

export default App
