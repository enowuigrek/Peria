import { useState, useEffect } from 'react'
import styles from './Notes.module.scss'

export default function Notes() {
  const [notes, setNotes] = useState(() => {
    const stored = localStorage.getItem('peria_notes')
    return stored ? JSON.parse(stored) : []
  })

  useEffect(() => {
    localStorage.setItem('peria_notes', JSON.stringify(notes))
  }, [notes])

  const deleteNote = (id) => {
    if (window.confirm('Usunąć tę notatkę?')) {
      setNotes(prev => prev.filter(n => n.id !== id))
    }
  }

  const exportToApp = async (note, appType) => {
    let exportText = ''
    let title = 'Peria - Notatka'

    if (appType === 'reminders' && note.detected?.tasks?.length > 0) {
      title = 'Peria - Zadania'
      exportText = note.detected.tasks.map(task => `• ${task.text}`).join('\n')
    } else if (appType === 'notes') {
      exportText = note.sourceText
      if (note.detected?.tasks?.length > 0) {
        exportText += '\n\n--- Zadania ---\n'
        exportText += note.detected.tasks.map(t => `• ${t.text}`).join('\n')
      }
      if (note.detected?.events?.length > 0) {
        exportText += '\n\n--- Wydarzenia ---\n'
        exportText += note.detected.events.map(e => `• ${e.title} - ${e.date} ${e.time || ''}`).join('\n')
      }
    } else if (appType === 'calendar' && note.detected?.events?.length > 0) {
      title = 'Peria - Wydarzenia'
      exportText = note.detected.events.map(e => `${e.title}\n${e.date} ${e.time || ''}`).join('\n\n')
    }

    // Web Share API
    if (navigator.share) {
      try {
        await navigator.share({
          title: title,
          text: exportText
        })

        // Oznacz jako wyeksportowane
        setNotes(prev => prev.map(n =>
          n.id === note.id
            ? { ...n, exported: { ...n.exported, [appType]: true } }
            : n
        ))
      } catch (error) {
        if (error.name !== 'AbortError') {
          console.error('Share error:', error)
          fallbackCopyToClipboard(exportText)
        }
      }
    } else {
      fallbackCopyToClipboard(exportText)
    }
  }

  const fallbackCopyToClipboard = (text) => {
    navigator.clipboard.writeText(text).then(() => {
      alert('✅ Skopiowano do schowka!')
    }).catch((error) => {
      console.error('Clipboard error:', error)
      alert('❌ Błąd kopiowania.')
    })
  }

  if (notes.length === 0) {
    return (
      <div className={styles.emptyState}>
        <div className={styles.emptyIcon}>📝</div>
        <p>Brak notatek</p>
        <p className={styles.emptyHint}>Nagraj swoją pierwszą myśl</p>
      </div>
    )
  }

  return (
    <div className={styles.notesWrapper}>
      <div className={styles.notesList}>
        {notes.map((note) => (
          <div key={note.id} className={styles.noteCard}>
            {/* Header */}
            <div className={styles.noteHeader}>
              <span className={styles.noteDate}>
                {new Date(note.createdAt).toLocaleDateString('pl-PL', {
                  day: 'numeric',
                  month: 'short',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </span>
              <button
                onClick={() => deleteNote(note.id)}
                className={styles.deleteButton}
                title="Usuń"
              >
                ✕
              </button>
            </div>

            {/* Source text */}
            <div className={styles.sourceText}>
              {note.sourceText}
            </div>

            {/* Detected structure */}
            {note.detected && (
              <div className={styles.detectedSection}>
                {note.detected.tasks?.length > 0 && (
                  <div className={styles.detectedItem}>
                    <span className={styles.detectedLabel}>✅ {note.detected.tasks.length} zadań</span>
                    <button
                      onClick={() => exportToApp(note, 'reminders')}
                      className={styles.exportButton}
                      disabled={note.exported?.reminders}
                    >
                      {note.exported?.reminders ? '✓' : '→ Reminders'}
                    </button>
                  </div>
                )}

                {note.detected.events?.length > 0 && (
                  <div className={styles.detectedItem}>
                    <span className={styles.detectedLabel}>📅 {note.detected.events.length} wydarzeń</span>
                    <button
                      onClick={() => exportToApp(note, 'calendar')}
                      className={styles.exportButton}
                      disabled={note.exported?.calendar}
                    >
                      {note.exported?.calendar ? '✓' : '→ Calendar'}
                    </button>
                  </div>
                )}

                {note.detected.creative && (
                  <div className={styles.detectedItem}>
                    <span className={styles.detectedLabel}>💡 Pomysł</span>
                  </div>
                )}

                {/* Zawsze można wyeksportować pełną notatkę */}
                <div className={styles.detectedItem}>
                  <span className={styles.detectedLabel}>📝 Pełna notatka</span>
                  <button
                    onClick={() => exportToApp(note, 'notes')}
                    className={styles.exportButton}
                    disabled={note.exported?.notes}
                  >
                    {note.exported?.notes ? '✓' : '→ Notes'}
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
