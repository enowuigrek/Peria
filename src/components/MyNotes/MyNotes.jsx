import { useState, useEffect } from 'react'
import { groupByDate } from '../../utils/dateHelpers'
import styles from './MyNotes.module.scss'

export default function MyNotes() {
  const [notes, setNotes] = useState(() => {
    const stored = localStorage.getItem('peria_mynotes')
    return stored ? JSON.parse(stored) : []
  })
  const [expandedNotes, setExpandedNotes] = useState(new Set())
  const [expandedDays, setExpandedDays] = useState(new Set(['Dzisiaj', 'Wczoraj'])) // Auto-expand recent days
  const [editingId, setEditingId] = useState(null)
  const [editContent, setEditContent] = useState('')
  const [editingTitleId, setEditingTitleId] = useState(null)
  const [editTitleText, setEditTitleText] = useState('')
  const [copiedNoteId, setCopiedNoteId] = useState(null)

  useEffect(() => {
    localStorage.setItem('peria_mynotes', JSON.stringify(notes))
  }, [notes])

  const copyToClipboard = async (note) => {
    try {
      await navigator.clipboard.writeText(note.content)
      setCopiedNoteId(note.id)
      setTimeout(() => setCopiedNoteId(null), 800)
    } catch (err) {
      console.error('Failed to copy:', err)
    }
  }

  const toggleExpand = (id) => {
    // Mark as not new when expanded
    setNotes(prev => prev.map(n =>
      n.id === id && n.isNew
        ? { ...n, isNew: false }
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

  const deleteNote = (id) => {
    if (window.confirm('Usunąć tę notatkę?')) {
      setNotes(prev => prev.filter(n => n.id !== id))
    }
  }

  const startEdit = (note) => {
    setEditingId(note.id)
    setEditContent(note.content)
  }

  const saveEdit = (id) => {
    setNotes(prev => prev.map(n =>
      n.id === id ? { ...n, content: editContent } : n
    ))
    setEditingId(null)
    setEditContent('')
  }

  const cancelEdit = () => {
    setEditingId(null)
    setEditContent('')
  }

  const exportToAppleNotes = async (note) => {
    const exportText = `${note.title}\n\n${note.content}`

    if (navigator.share) {
      try {
        await navigator.share({
          title: note.title,
          text: exportText
        })
        alert('✅ Wyeksportowano notatkę')
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
        <div className={styles.emptyIcon}>
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#fdd03b" strokeWidth="1.5" strokeOpacity="0.35">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
            <polyline points="14 2 14 8 20 8"/>
            <line x1="16" y1="13" x2="8" y2="13"/>
            <line x1="16" y1="17" x2="8" y2="17"/>
            <line x1="10" y1="9" x2="8" y2="9"/>
          </svg>
        </div>
        <p>Brak zapisanych notatek</p>
        <p className={styles.emptyHint}>Notatki z Inbox pojawią się tutaj</p>
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
          const isEditing = editingId === note.id
          const isEditingTitle = editingTitleId === note.id

          return (
            <div key={note.id} className={`${styles.noteCard} ${isExpanded ? styles.expanded : ''} ${note.isNew ? styles.isNew : ''}`}>
              <div
                className={styles.noteHeader}
                onClick={() => !isEditing && toggleExpand(note.id)}
                style={{ cursor: isEditing ? 'default' : 'pointer' }}
              >
                <div className={styles.noteHeaderLeft}>
                  {isEditingTitle ? (
                    <input
                      type="text"
                      className={styles.titleInput}
                      value={editTitleText}
                      onChange={(e) => setEditTitleText(e.target.value)}
                      onBlur={() => {
                        if (editTitleText.trim()) {
                          setNotes(prev => prev.map(n =>
                            n.id === editingTitleId ? { ...n, title: editTitleText } : n
                          ))
                        }
                        setEditingTitleId(null)
                        setEditTitleText('')
                      }}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          if (editTitleText.trim()) {
                            setNotes(prev => prev.map(n =>
                              n.id === editingTitleId ? { ...n, title: editTitleText } : n
                            ))
                          }
                          setEditingTitleId(null)
                          setEditTitleText('')
                        }
                        if (e.key === 'Escape') {
                          setEditingTitleId(null)
                          setEditTitleText('')
                        }
                      }}
                      autoFocus
                      onClick={(e) => e.stopPropagation()}
                    />
                  ) : (
                    <div className={styles.titleRow}>
                      <div className={styles.noteTitle}>
                        {note.title}
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          setEditingTitleId(note.id)
                          setEditTitleText(note.title)
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
                  {!isEditing && (
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

              {isExpanded && (
                <div className={styles.noteBody}>
                  {isEditing ? (
                    <div className={styles.editContainer}>
                      <textarea
                        className={styles.editTextarea}
                        value={editContent}
                        onChange={(e) => setEditContent(e.target.value)}
                        autoFocus
                      />
                      <div className={styles.editActions}>
                        <button
                          onClick={() => saveEdit(note.id)}
                          className={styles.saveButton}
                        >
                          ✓ Zapisz
                        </button>
                        <button
                          onClick={cancelEdit}
                          className={styles.cancelButton}
                        >
                          ✕ Anuluj
                        </button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className={`${styles.noteContent} ${copiedNoteId === note.id ? styles.copied : ''}`}>
                        {note.content}
                      </div>

                      {/* Oryginalna wiadomość (ukryta pod przyciskiem) */}
                      {note.sourceText && (
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
                      )}

                      <div className={styles.noteActions}>
                        <button
                          onClick={() => startEdit(note)}
                          className={styles.editButton}
                          title="Edytuj"
                        >
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                          </svg>
                        </button>
                        <button
                          onClick={() => copyToClipboard(note)}
                          className={`${styles.copyButton} ${copiedNoteId === note.id ? styles.copied : ''}`}
                          title="Kopiuj"
                        >
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/>
                            <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
                          </svg>
                        </button>
                        <button
                          onClick={() => exportToAppleNotes(note)}
                          className={styles.exportButton}
                          title="Eksportuj"
                        >
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                            <polyline points="7 10 12 15 17 10" />
                            <line x1="12" y1="15" x2="12" y2="3" />
                          </svg>
                        </button>
                      </div>
                    </>
                  )}
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
