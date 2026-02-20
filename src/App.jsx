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
import periaVideo from './assets/peria-intro.mp4'

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
            {/* Desktop fallback – apka działa tylko na mobile */}
            <div className="desktop-block">
                <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
                    <rect x="5" y="2" width="14" height="20" rx="2" ry="2"/>
                    <line x1="12" y1="18" x2="12.01" y2="18"/>
                </svg>
                <h2>Peria działa tylko na urządzeniach mobilnych</h2>
                <p>Otwórz aplikację na telefonie lub tablecie</p>
            </div>

            {showSplash && <SplashScreen onComplete={() => setShowSplash(false)} videoSrc={periaVideo} />}
            <div className="app-container" data-view={activeView}>

                {/* Sekcja środkowa - główny content */}
                <div className="content" data-view={activeView}>
                    {activeView === 'mynotes' && <MyNotes />}
                    {activeView === 'checklists' && <Checklists />}
                    {activeView === 'events' && <Events />}
                    {activeView === 'inbox' && <Inbox />}
                    {activeView === 'chat' && (
                        <ChatVoiceFirst
                            onAdd={addTask}
                            showInputMethods={showInputMethods}
                            onInputMethodsChange={setShowInputMethods}
                            onNavigate={setActiveView}
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