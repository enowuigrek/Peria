import { useState, useEffect } from 'react'
import styles from './Inbox.module.scss'

export default function Inbox() {
  const [notes, setNotes] = useState(() => {
    const stored = localStorage.getItem('peria_inbox')
    return stored ? JSON.parse(stored) : []
  })
  const [expandedNotes, setExpandedNotes] = useState(new Set())
  const [editingTitleId, setEditingTitleId] = useState(null)
  const [editTitleText, setEditTitleText] = useState('')

  useEffect(() => {
    localStorage.setItem('peria_inbox', JSON.stringify(notes))
  }, [notes])

  // Check if exported items still exist in sections
  useEffect(() => {
    const checkExportedItems = () => {
      setNotes(prev => prev.map(note => {
        if (!note.exported) return note

        const updatedExported = { ...note.exported }
        let hasChanges = false

        // Check each section
        Object.keys(updatedExported).forEach(section => {
          if (updatedExported[section]) {
            const storageKey = `peria_${section}`
            const sectionItems = JSON.parse(localStorage.getItem(storageKey) || '[]')
            const itemExists = sectionItems.some(item => item.sourceNoteId === note.id)

            if (!itemExists) {
              updatedExported[section] = false
              hasChanges = true
            }
          }
        })

        return hasChanges ? { ...note, exported: updatedExported } : note
      }))
    }

    checkExportedItems()

    // Listen for storage changes from other tabs/windows
    window.addEventListener('storage', checkExportedItems)
    return () => window.removeEventListener('storage', checkExportedItems)
  }, [])

  const toggleExpand = (id) => {
    // Mark as read when expanded for the first time
    setNotes(prev => prev.map(n =>
      n.id === id && !n.read
        ? { ...n, read: true }
        : n
    ))

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

  const startEditTitle = (note, e) => {
    e.stopPropagation()
    setEditingTitleId(note.id)
    setEditTitleText(note.title || 'Notatka')
  }

  const saveTitle = (id) => {
    setNotes(prev => prev.map(n =>
      n.id === id ? { ...n, title: editTitleText } : n
    ))
    setEditingTitleId(null)
    setEditTitleText('')
  }

  const cancelEditTitle = () => {
    setEditingTitleId(null)
    setEditTitleText('')
  }

  const deleteNote = (id) => {
    if (window.confirm('Usunąć tę notatkę?')) {
      setNotes(prev => prev.filter(n => n.id !== id))
    }
  }

  const addToSection = (note, section, content) => {
    // Get existing items from the target section
    const storageKey = `peria_${section}`
    const existing = JSON.parse(localStorage.getItem(storageKey) || '[]')

    // Create new item with note's metadata
    const newItem = {
      id: note.id + '_' + Date.now(), // Unique ID for section item
      sourceNoteId: note.id,
      title: note.title || 'Notatka',
      content: content,
      createdAt: new Date().toISOString(),
      sourceDate: note.createdAt
    }

    // Add to beginning of array
    existing.unshift(newItem)
    localStorage.setItem(storageKey, JSON.stringify(existing))

    // Mark as exported in current note
    setNotes(prev => prev.map(n =>
      n.id === note.id
        ? { ...n, exported: { ...n.exported, [section]: true } }
        : n
    ))

    alert(`✅ Dodano do ${section === 'mynotes' ? 'Notatek' : section === 'checklists' ? 'Checklisty' : 'Wydarzeń'}`)
  }

  if (notes.length === 0) {
    return (
      <div className={styles.emptyState}>
        <div className={styles.emptyIcon}>📥</div>
        <p>Brak nagrań do przeanalizowania</p>
        <p className={styles.emptyHint}>Nagraj swoją pierwszą myśl</p>
      </div>
    )
  }

  return (
    <div className={styles.notesWrapper}>
      <div className={styles.notesList}>
        {notes.map((note) => {
          const isExpanded = expandedNotes.has(note.id)
          const hasContent = note.detected?.note || note.detected?.checklist?.length > 0 || note.detected?.events?.length > 0
          const isEditingTitle = editingTitleId === note.id

          // Determine status class
          let statusClass = ''
          if (!note.read) {
            statusClass = styles.statusNew
          } else if (note.exported) {
            const exportedCategories = Object.keys(note.exported).filter(k => note.exported[k])
            if (exportedCategories.length === 1) {
              statusClass = styles[`statusCategorized${exportedCategories[0].charAt(0).toUpperCase() + exportedCategories[0].slice(1)}`]
            } else if (exportedCategories.length > 1) {
              statusClass = styles.statusCategorizedMultiple
            }
          } else if (note.read) {
            statusClass = styles.statusRead
          }

          return (
            <div key={note.id} className={`${styles.noteCard} ${isExpanded ? styles.expanded : ''} ${statusClass}`}>
              {/* Collapsed header - always visible */}
              <div
                className={styles.noteHeader}
                onClick={() => !isEditingTitle && hasContent && toggleExpand(note.id)}
                style={{ cursor: isEditingTitle ? 'default' : (hasContent ? 'pointer' : 'default') }}
              >
                <div className={styles.noteHeaderLeft}>
                  {isEditingTitle ? (
                    <input
                      type="text"
                      className={styles.titleInput}
                      value={editTitleText}
                      onChange={(e) => setEditTitleText(e.target.value)}
                      onBlur={() => saveTitle(note.id)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') saveTitle(note.id)
                        if (e.key === 'Escape') cancelEditTitle()
                      }}
                      autoFocus
                      onClick={(e) => e.stopPropagation()}
                    />
                  ) : (
                    <div
                      className={styles.noteTitle}
                      onClick={(e) => startEditTitle(note, e)}
                    >
                      {note.title || 'Notatka'}
                    </div>
                  )}
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
                    <div className={styles.expandIcon}>
                      <svg viewBox="0 0 24 24">
                        <polyline points="9 18 15 12 9 6" />
                      </svg>
                    </div>
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
                    <div className={`${styles.section} ${styles.sectionMynotes}`}>
                      <div className={styles.sectionHeader}>
                        <span className={styles.sectionTitle}>📝 Notatka</span>
                        <button
                          onClick={() => addToSection(note, 'mynotes', note.detected.note)}
                          className={styles.exportButton}
                          disabled={note.exported?.mynotes}
                        >
                          {note.exported?.mynotes ? '✓ Dodano' : '→ Notatki'}
                        </button>
                      </div>
                      <div className={styles.sectionContent}>
                        {note.detected.note}
                      </div>
                    </div>
                  )}

                  {/* Checklista */}
                  {note.detected?.checklist?.length > 0 && (
                    <div className={`${styles.section} ${styles.sectionChecklists}`}>
                      <div className={styles.sectionHeader}>
                        <span className={styles.sectionTitle}>✅ Checklista ({note.detected.checklist.length})</span>
                        <button
                          onClick={() => addToSection(
                            note,
                            'checklists',
                            note.detected.checklist
                          )}
                          className={styles.exportButton}
                          disabled={note.exported?.checklists}
                        >
                          {note.exported?.checklists ? '✓ Dodano' : '→ Checklisty'}
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
                    <div className={`${styles.section} ${styles.sectionEvents}`}>
                      <div className={styles.sectionHeader}>
                        <span className={styles.sectionTitle}>📅 Wydarzenia ({note.detected.events.length})</span>
                        <button
                          onClick={() => addToSection(
                            note,
                            'events',
                            note.detected.events
                          )}
                          className={styles.exportButton}
                          disabled={note.exported?.events}
                        >
                          {note.exported?.events ? '✓ Dodano' : '→ Wydarzenia'}
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
                    <summary className={styles.originalSummary}>
                      <span>Pokaż oryginał</span>
                      <svg className={styles.originalChevron} viewBox="0 0 24 24">
                        <polyline points="9 18 15 12 9 6" />
                      </svg>
                    </summary>
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
    </div>
  )
}
