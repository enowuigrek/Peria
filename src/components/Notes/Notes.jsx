import { useState, useEffect } from 'react'
import styles from './Notes.module.scss'
import { groupByDate } from '../../utils/dateHelpers'

export default function Notes() {
  const [notes, setNotes] = useState(() => {
    const stored = localStorage.getItem('peria_notes')
    return stored ? JSON.parse(stored) : []
  })
  const [expandedNotes, setExpandedNotes] = useState(new Set())
  const [expandedDays, setExpandedDays] = useState(new Set(['Dzisiaj', 'Wczoraj']))

  useEffect(() => {
    localStorage.setItem('peria_notes', JSON.stringify(notes))
  }, [notes])

  const toggleExpand = (id) => {
    setExpandedNotes(prev => {
      const newSet = new Set(prev)
      if (newSet.has(id)) {
        newSet.delete(id)
      } else {
        newSet.add(id)
      }
      return newSet
    })
  }

  const deleteNote = (id) => {
    if (window.confirm('Usunąć tę notatkę?')) {
      setNotes(prev => prev.filter(n => n.id !== id))
    }
  }

  const exportToApp = async (note, appType, content) => {
    let exportText = content || ''
    let title = note.title || 'Peria - Notatka'

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

  const noteGroups = groupByDate(notes)

  const toggleDay = (label) => {
    setExpandedDays(prev => {
      const next = new Set(prev)
      if (next.has(label)) next.delete(label)
      else next.add(label)
      return next
    })
  }

  return (
    <div className={styles.notesWrapper}>
      <div className={styles.notesList}>
        {noteGroups.map((group) => {
          const isDayExpanded = expandedDays.has(group.label)
          return (
            <div key={group.date} className={styles.dayGroup}>
              <div className={styles.dayHeader} onClick={() => toggleDay(group.label)}>
                <span>{group.label} ({group.items.length})</span>
                <div className={`${styles.dayChevron} ${isDayExpanded ? styles.dayChevronOpen : ''}`}>
                  <svg viewBox="0 0 24 24">
                    <polyline points="9 18 15 12 9 6" />
                  </svg>
                </div>
              </div>
              {isDayExpanded && (
                <div className={styles.dayItems}>
                  {group.items.map((note) => {
          const isExpanded = expandedNotes.has(note.id)
          const hasContent = note.detected?.note || note.detected?.checklist?.length > 0 || note.detected?.events?.length > 0

          return (
            <div key={note.id} className={styles.noteCard}>
              {/* Collapsed header - always visible */}
              <div
                className={styles.noteHeader}
                onClick={() => hasContent && toggleExpand(note.id)}
                style={{ cursor: hasContent ? 'pointer' : 'default' }}
              >
                <div className={styles.noteHeaderLeft}>
                  <div className={styles.noteTitle}>{note.title || 'Notatka'}</div>
                  <div className={styles.noteDate}>
                    {new Date(note.createdAt).toLocaleDateString('pl-PL', {
                      day: 'numeric',
                      month: 'short',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </div>
                </div>
                <div className={styles.noteHeaderRight}>
                  {hasContent && (
                    <span className={styles.expandIcon}>{isExpanded ? '▼' : '▶'}</span>
                  )}
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      deleteNote(note.id)
                    }}
                    className={styles.deleteButton}
                    title="Usuń"
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <polyline points="3 6 5 6 21 6"/>
                      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                    </svg>
                  </button>
                </div>
              </div>

              {/* Expanded content */}
              {isExpanded && (
                <div className={styles.noteBody}>
                  {/* Notatka (uporządkowana treść) */}
                  {note.detected?.note && (
                    <div className={styles.section}>
                      <div className={styles.sectionHeader}>
                        <span className={styles.sectionTitle}>📝 Notatka</span>
                        <button
                          onClick={() => exportToApp(note, 'notes', `${note.title}\n\n${note.detected.note}`)}
                          className={styles.exportButton}
                          disabled={note.exported?.notes}
                        >
                          {note.exported?.notes ? '✓ Dodano' : '→ Notatki'}
                        </button>
                      </div>
                      <div className={styles.sectionContent}>
                        {note.detected.note}
                      </div>
                    </div>
                  )}

                  {/* Checklista */}
                  {note.detected?.checklist?.length > 0 && (
                    <div className={styles.section}>
                      <div className={styles.sectionHeader}>
                        <span className={styles.sectionTitle}>✅ Checklista ({note.detected.checklist.length})</span>
                        <button
                          onClick={() => exportToApp(
                            note,
                            'reminders',
                            note.detected.checklist.map(item => `• ${item.text}`).join('\n')
                          )}
                          className={styles.exportButton}
                          disabled={note.exported?.reminders}
                        >
                          {note.exported?.reminders ? '✓ Dodano' : '→ Przypomnienia'}
                        </button>
                      </div>
                      <ul className={styles.checklist}>
                        {note.detected.checklist.map((item, idx) => (
                          <li key={idx}>{item.text}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Wydarzenia */}
                  {note.detected?.events?.length > 0 && (
                    <div className={styles.section}>
                      <div className={styles.sectionHeader}>
                        <span className={styles.sectionTitle}>📅 Wydarzenia ({note.detected.events.length})</span>
                        <button
                          onClick={() => exportToApp(
                            note,
                            'calendar',
                            note.detected.events.map(e => `${e.title}\n${e.date} ${e.time || ''}`).join('\n\n')
                          )}
                          className={styles.exportButton}
                          disabled={note.exported?.calendar}
                        >
                          {note.exported?.calendar ? '✓ Dodano' : '→ Kalendarz'}
                        </button>
                      </div>
                      <ul className={styles.eventList}>
                        {note.detected.events.map((event, idx) => (
                          <li key={idx}>
                            <strong>{event.title}</strong><br />
                            {event.date} {event.time && `• ${event.time}`}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Oryginalna wiadomość (ukryta pod przyciskiem) */}
                  <details className={styles.originalToggle}>
                    <summary className={styles.originalSummary}>Pokaż oryginał</summary>
                    <div className={styles.originalText}>
                      {note.sourceText}
                    </div>
                  </details>
                </div>
              )}
            </div>
          )
        })}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
