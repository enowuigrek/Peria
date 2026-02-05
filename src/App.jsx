import { useState, useEffect, useCallback } from 'react'
import { nanoid } from 'nanoid'
import './App.scss'
import TaskInput from './components/TaskInput/TaskInput.jsx'
import TaskList from './components/TaskList/TaskList.jsx'
import ChatVoiceFirst from './components/Chat/ChatVoiceFirst.jsx'
import Calendar from './components/Calendar/Calendar.jsx'
import NavBar from './components/NavBar/NavBar.jsx'

function App() {
    const [tasks, setTasks] = useState(() => {
        const stored = localStorage.getItem('myTasks')
        return stored ? JSON.parse(stored) : []
    })
    const [activeView, setActiveView] = useState('tasks')

    useEffect(() => {
        localStorage.setItem('myTasks', JSON.stringify(tasks))
    }, [tasks])

    const addTask = useCallback((text) => {
        setTasks((prev) => [
          ...prev,
          {
            id: nanoid(),
            text,
            done: false,
          },
        ])
    }, [])

    const toggleTask = useCallback((id) => {
        setTasks(prev =>
            prev.map(task => task.id === id ? { ...task, done: !task.done } : task)
        )
    }, [])

    const removeTask = useCallback((id) => {
        setTasks(prev => prev.filter(task => task.id !== id))
    }, [])

    const editTask = useCallback((id, newText) => {
        setTasks(prev =>
            prev.map(task => task.id === id ? { ...task, text: newText } : task)
        )
    }, [])

    return (
        <div className="app-wrapper">
            <div className="app-container">

                {/* Sekcja górna - input */}
                <div className="header">
                    {activeView === 'tasks' && (
                        <TaskInput onAdd={addTask} />
                    )}
                </div>

                {/* Sekcja środkowa - tu będzie scroll (TaskList, Chat, Calendar) */}
                <div className="content">
                    {activeView === 'tasks' && (
                        <TaskList
                            tasks={tasks}
                            onToggle={toggleTask}
                            onRemove={removeTask}
                            onEdit={editTask}
                        />
                    )}
                    {activeView === 'chat' && <ChatVoiceFirst onAdd={addTask} />}
                    {activeView === 'calendar' && <Calendar />}
                </div>

                {/* Sekcja dolna - nawigacja */}
                <div className="footer">
                    <NavBar
                        activeView={activeView}
                        onSwitch={(view) => setActiveView(view)}
                    />
                </div>
            </div>
        </div>
    )
}

export default App