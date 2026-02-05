import { useState, useCallback } from 'react'
import { nanoid } from 'nanoid'
import './App.scss'
import ChatVoiceFirst from './components/Chat/ChatVoiceFirst.jsx'
import Notes from './components/Notes/Notes.jsx'
import NavBar from './components/NavBar/NavBar.jsx'

function App() {
    const [activeView, setActiveView] = useState('notes')

    const addTask = useCallback((text) => {
        // Kompatybilność wsteczna - dodaje zadanie jako notatka
        const note = {
            id: nanoid(),
            sourceText: text,
            detected: { tasks: [{ text }], events: [], creative: null },
            createdAt: new Date().toISOString(),
            exported: { reminders: false, notes: false, calendar: false }
        }
        const notes = JSON.parse(localStorage.getItem('peria_notes') || '[]')
        notes.unshift(note)
        localStorage.setItem('peria_notes', JSON.stringify(notes))
    }, [])

    return (
        <div className="app-wrapper">
            <div className="app-container">

                {/* Sekcja środkowa - główny content */}
                <div className="content">
                    {activeView === 'notes' && <Notes />}
                    {activeView === 'chat' && <ChatVoiceFirst onAdd={addTask} />}
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