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
  const [showCompleted, setShowCompleted] = useState(false)
  const [flyingColor, setFlyingColor] = useState(null) // { section: 'mynotes', buttonId: 'export-btn-123' }

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

  // Get category styling for NEW notes
  const getCategoryStyle = (note) => {
    if (!note.detected) return { className: '', style: {} }

    // Nie koloruj jeśli cokolwiek zostało już wyeksportowane
    if (note.exported && Object.keys(note.exported).some(k => note.exported[k])) {
      return { className: '', style: {} }
    }

    const hasNote = note.detected.note
    const hasChecklist = note.detected.checklist?.length > 0
    const hasEvents = note.detected.events?.length > 0

    const categories = []
    if (hasNote) categories.push('mynotes')
    if (hasChecklist) categories.push('checklists')
    if (hasEvents) categories.push('events')

    // Single category
    if (categories.length === 1) {
      const categoryMap = {
        mynotes: styles.categoryMyNotes,
        checklists: styles.categoryChecklists,
        events: styles.categoryEvents
      }
      return { className: categoryMap[categories[0]], style: {} }
    }

    // Multi-category gradient
    if (categories.length > 1) {
      const colorMap = {
        mynotes: '#fdd03b',
        checklists: '#5db85f',
        events: '#4a9396'
      }
      const gradientColors = categories.map(cat => colorMap[cat]).join(', ')
      return {
        className: styles.categoryMulti,
        style: { '--gradient-colors': gradientColors }
      }
    }

    return { className: '', style: {} }
  }

  // Check if note is fully categorized (all detected content has been exported)
  const isFullyCategorized = (note) => {
    if (!note.detected) return false

    const hasNote = note.detected.note
    const hasChecklist = note.detected.checklist?.length > 0
    const hasEvents = note.detected.events?.length > 0

    const noteExported = !hasNote || note.exported?.mynotes
    const checklistExported = !hasChecklist || note.exported?.checklists
    const eventsExported = !hasEvents || note.exported?.events

    return noteExported && checklistExported && eventsExported && note.read
  }

  const addToSection = (note, section, content, event) => {
    // Trigger color flight animation
    if (event) {
      const buttonRect = event.target.getBoundingClientRect()
      setFlyingColor({
        section,
        startX: buttonRect.left + buttonRect.width / 2,
        startY: buttonRect.top + buttonRect.height / 2
      })

      // Clear animation after it completes
      setTimeout(() => setFlyingColor(null), 800)
    }

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
      sourceDate: note.createdAt,
      sourceText: note.sourceText, // Oryginalna transkrypcja
      isNew: true  // Flag for newly exported items
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

  // Separate notes into groups
  const newNotes = notes.filter(n => !n.read)
  const pendingNotes = notes.filter(n => n.read && !isFullyCategorized(n))
  const completedNotes = notes.filter(n => isFullyCategorized(n))

  const renderNote = (note) => {
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
                    <div className={styles.titleRow}>
                      <div className={styles.noteTitle}>
                        {note.title || 'Notatka'}
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          startEditTitle(note, e)
                        }}
                        className={styles.editTitleIcon}
                        title="Edytuj tytuł"
                      >
                        ✎
                      </button>
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
                          onClick={(e) => addToSection(note, 'mynotes', note.detected.note, e)}
                          className={styles.exportButtonMyNotes}
                          disabled={note.exported?.mynotes}
                          title={note.exported?.mynotes ? 'Dodano do Notatek' : 'Dodaj do Notatek'}
                        >
                          {note.exported?.mynotes ? (
                            <span>✓</span>
                          ) : (
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                              <polyline points="14 2 14 8 20 8"/>
                              <line x1="16" y1="13" x2="8" y2="13"/>
                              <line x1="16" y1="17" x2="8" y2="17"/>
                              <line x1="10" y1="9" x2="8" y2="9"/>
                            </svg>
                          )}
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
                          onClick={(e) => addToSection(
                            note,
                            'checklists',
                            note.detected.checklist,
                            e
                          )}
                          className={styles.exportButtonChecklists}
                          disabled={note.exported?.checklists}
                          title={note.exported?.checklists ? 'Dodano do Checklist' : 'Dodaj do Checklist'}
                        >
                          {note.exported?.checklists ? (
                            <span>✓</span>
                          ) : (
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M9 11l3 3L22 4"/>
                              <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/>
                            </svg>
                          )}
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
                        <span className={styles.sectionTitle}>Wydarzenia ({note.detected.events.length})</span>
                        <button
                          onClick={(e) => addToSection(
                            note,
                            'events',
                            note.detected.events,
                            e
                          )}
                          className={styles.exportButtonEvents}
                          disabled={note.exported?.events}
                          title={note.exported?.events ? 'Dodano do Wydarzeń' : 'Dodaj do Wydarzeń'}
                        >
                          {note.exported?.events ? (
                            <span>✓</span>
                          ) : (
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                              <line x1="16" y1="2" x2="16" y2="6"/>
                              <line x1="8" y1="2" x2="8" y2="6"/>
                              <line x1="3" y1="10" x2="21" y2="10"/>
                            </svg>
                          )}
                        </button>
                      </div>
                      <ul className={styles.eventList}>
                        {note.detected.events.map((event, idx) => (
                          <li key={idx}>
                            <div><strong>📅 {event.title}</strong></div>
                            {event.endDate ? (
                              <>
                                <div className={styles.eventDateInfo}>Start: {event.date}</div>
                                <div className={styles.eventDateInfo}>Koniec: {event.endDate}</div>
                              </>
                            ) : (
                              <div className={styles.eventDateInfo}>
                                {event.date} {event.time && `• ${event.time}`}{event.endTime && ` - ${event.endTime}`}
                              </div>
                            )}
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
  }

  return (
    <div className={styles.notesWrapper}>
      <div className={styles.notesList}>
        {/* NEW Notes - unread */}
        {newNotes.map((note) => {
          const categoryStyle = getCategoryStyle(note)
          return (
            <div
              key={note.id}
              className={`${styles.newNoteWrapper} ${categoryStyle.className}`}
              style={categoryStyle.style}
            >
              {renderNote(note)}
            </div>
          )
        })}

        {/* PENDING Notes - read but not fully exported */}
        {pendingNotes.map((note) => renderNote(note))}

        {/* COMPLETED Notes - fully exported (expandable section) */}
        {completedNotes.length > 0 && (
          <div className={styles.completedSection}>
            <div
              className={styles.completedHeader}
              onClick={() => setShowCompleted(!showCompleted)}
            >
              <span className={styles.completedTitle}>
                Przydzielone ({completedNotes.length})
              </span>
              <div className={`${styles.completedChevron} ${showCompleted ? styles.completedChevronOpen : ''}`}>
                <svg viewBox="0 0 24 24">
                  <polyline points="9 18 15 12 9 6" />
                </svg>
              </div>
            </div>
            {showCompleted && (
              <div className={styles.completedList}>
                {completedNotes.map((note) => renderNote(note))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Flying color animation */}
      {flyingColor && (
        <div
          className={styles.flyingDot}
          style={{
            left: `${flyingColor.startX}px`,
            top: `${flyingColor.startY}px`,
            '--target-section': flyingColor.section
          }}
          data-section={flyingColor.section}
        />
      )}
    </div>
  )
}
