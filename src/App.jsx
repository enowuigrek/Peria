import { useState, useCallback } from 'react'
import { nanoid } from 'nanoid'
import './App.scss'
import ChatVoiceFirst from './components/Chat/ChatVoiceFirst.jsx'
import Inbox from './components/Inbox/Inbox.jsx'
import MyNotes from './components/MyNotes/MyNotes.jsx'
import Checklists from './components/Checklists/Checklists.jsx'
import Events from './components/Events/Events.jsx'
import NavBar from './components/NavBar/NavBar.jsx'
import SplashScreen from './components/SplashScreen/SplashScreen.jsx'

function App() {
    const [showSplash, setShowSplash] = useState(true)
    const [activeView, setActiveView] = useState('chat') // Domyślnie ekran nagrywania
    const [showInputMethods, setShowInputMethods] = useState(false)

    const addTask = useCallback((text) => {
        // Kompatybilność wsteczna
        const note = {
            id: nanoid(),
            title: "Notatka",
            sourceText: text,
            detected: { note: null, checklist: [{ text }], events: [] },
            createdAt: new Date().toISOString(),
            exported: { reminders: false, notes: false, calendar: false }
        }
        const notes = JSON.parse(localStorage.getItem('peria_inbox') || '[]')
        notes.unshift(note)
        localStorage.setItem('peria_inbox', JSON.stringify(notes))
    }, [])

    const handleNavBarAction = useCallback((view) => {
        if (view === 'toggleInput') {
            // Jeśli nie jesteśmy w chat view, najpierw przełącz na chat i pokaż menu
            if (activeView !== 'chat') {
                setActiveView('chat')
            }
            // Zawsze pokazuj menu (nie toggle, tylko open)
            setShowInputMethods(true)
        } else {
            setActiveView(view)
            setShowInputMethods(false) // Ukryj menu przy przełączeniu widoku
        }
    }, [activeView])

    return (
        <div className="app-wrapper">
            {showSplash && <SplashScreen onComplete={() => setShowSplash(false)} />}
            <div className="app-container">

                {/* Sekcja środkowa - główny content */}
                <div className="content">
                    {activeView === 'mynotes' && <MyNotes />}
                    {activeView === 'checklists' && <Checklists />}
                    {activeView === 'events' && <Events />}
                    {activeView === 'inbox' && <Inbox />}
                    {activeView === 'chat' && (
                        <ChatVoiceFirst
                            onAdd={addTask}
                            showInputMethods={showInputMethods}
                            onInputMethodsChange={setShowInputMethods}
                        />
                    )}
                </div>

                {/* Sekcja dolna - nawigacja */}
                <div className="footer">
                    <NavBar
                        activeView={activeView}
                        onSwitch={handleNavBarAction}
                    />
                </div>
            </div>
        </div>
    )
}

export default App