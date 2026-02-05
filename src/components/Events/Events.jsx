import { useState, useEffect } from 'react'
import styles from './Events.module.scss'

export default function Events() {
  const [events, setEvents] = useState(() => {
    const stored = localStorage.getItem('peria_events')
    return stored ? JSON.parse(stored) : []
  })
  const [expandedEvents, setExpandedEvents] = useState(new Set())
  const [editingTitleId, setEditingTitleId] = useState(null)
  const [editTitleText, setEditTitleText] = useState('')

  useEffect(() => {
    localStorage.setItem('peria_events', JSON.stringify(events))
  }, [events])

  const toggleExpand = (id) => {
    // Mark as not new when expanded
    setEvents(prev => prev.map(e =>
      e.id === id && e.isNew
        ? { ...e, isNew: false }
        : e
    ))

    setExpandedEvents(prev => {
      const newSet = new Set(prev)
      if (newSet.has(id)) {
        newSet.delete(id)
      } else {
        newSet.add(id)
      }
      return newSet
    })
  }

  const startEditTitle = (event) => {
    setEditingTitleId(event.id)
    setEditTitleText(event.title)
    setExpandedEvents(prev => {
      const newSet = new Set(prev)
      newSet.add(event.id)
      return newSet
    })
  }

  const saveTitle = () => {
    setEvents(prev => prev.map(e =>
      e.id === editingTitleId ? { ...e, title: editTitleText } : e
    ))
    setEditingTitleId(null)
    setEditTitleText('')
  }

  const cancelEditTitle = () => {
    setEditingTitleId(null)
    setEditTitleText('')
  }

  const deleteEvent = (eventId) => {
    if (window.confirm('Usunąć to wydarzenie?')) {
      setEvents(prev => prev.filter(e => e.id !== eventId))
    }
  }

  const deleteEventItem = (eventId, itemIndex) => {
    if (window.confirm('Usunąć ten element?')) {
      setEvents(prev => prev.map(event => {
        if (event.id === eventId) {
          const updatedContent = Array.isArray(event.content)
            ? event.content.filter((_, idx) => idx !== itemIndex)
            : event.content
          return { ...event, content: updatedContent }
        }
        return event
      }))
    }
  }

  const exportToCalendar = async (event) => {
    let exportText = `${event.title}\n\n`

    if (Array.isArray(event.content)) {
      event.content.forEach(item => {
        const timeRange = item.time
          ? (item.endTime ? `${item.time} - ${item.endTime}` : item.time)
          : ''
        exportText += `${item.title}\n${item.date} ${timeRange}\n\n`
      })
    } else {
      exportText += event.content
    }

    if (navigator.share) {
      try {
        await navigator.share({
          title: event.title,
          text: exportText
        })
        alert('✅ Wyeksportowano wydarzenia')
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

  // Sort events by date
  const sortedEvents = [...events].sort((a, b) => {
    // Try to get first event date if content is an array
    const getFirstDate = (event) => {
      if (Array.isArray(event.content) && event.content.length > 0) {
        return event.content[0].date || ''
      }
      return ''
    }

    const dateA = getFirstDate(a)
    const dateB = getFirstDate(b)

    if (dateA && dateB) {
      return new Date(dateA) - new Date(dateB)
    }

    return new Date(b.createdAt) - new Date(a.createdAt)
  })

  if (events.length === 0) {
    return (
      <div className={styles.emptyState}>
        <div className={styles.emptyIcon}>📅</div>
        <p>Brak wydarzeń</p>
        <p className={styles.emptyHint}>Wydarzenia z Inbox pojawią się tutaj</p>
      </div>
    )
  }

  return (
    <div className={styles.eventsWrapper}>
      <div className={styles.eventsList}>
        {sortedEvents.map((event) => {
          const isExpanded = expandedEvents.has(event.id)
          const eventItems = Array.isArray(event.content) ? event.content : []
          const isEditingTitle = editingTitleId === event.id

          return (
            <div key={event.id} className={`${styles.eventCard} ${isExpanded ? styles.expanded : ''} ${event.isNew ? styles.isNew : ''}`}>
              <div
                className={styles.eventHeader}
                onClick={() => !isEditingTitle && toggleExpand(event.id)}
                style={{ cursor: isEditingTitle ? 'default' : 'pointer' }}
              >
                <div className={styles.eventHeaderLeft}>
                  {isEditingTitle ? (
                    <input
                      type="text"
                      className={styles.titleInput}
                      value={editTitleText}
                      onChange={(e) => setEditTitleText(e.target.value)}
                      onBlur={() => saveTitle()}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') saveTitle()
                        if (e.key === 'Escape') cancelEditTitle()
                      }}
                      autoFocus
                      onClick={(e) => e.stopPropagation()}
                    />
                  ) : (
                    <div className={styles.titleRow}>
                      <div className={styles.eventTitle}>
                        {event.title}
                      </div>
                    </div>
                  )}
                  <div className={styles.eventDate}>
                    {new Date(event.createdAt).toLocaleDateString('pl-PL', {
                      day: 'numeric',
                      month: 'short',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </div>
                </div>
                <div className={styles.eventHeaderRight}>
                  <div className={styles.expandIcon}>
                    <svg viewBox="0 0 24 24">
                      <polyline points="9 18 15 12 9 6" />
                    </svg>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      deleteEvent(event.id)
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
                <div className={styles.eventBody}>
                  <div className={styles.eventItemsList}>
                    {eventItems.map((item, idx) => (
                      <div key={idx} className={styles.eventItem}>
                        <div className={styles.eventItemContent}>
                          <div className={styles.eventItemTitle}>📅 {item.title}</div>
                          <div className={styles.eventItemDateTime}>
                            <span className={styles.eventItemDate}>{item.date}</span>
                            {item.time && (
                              <span className={styles.eventItemTime}>
                                {item.time}{item.endTime && ` - ${item.endTime}`}
                              </span>
                            )}
                          </div>
                        </div>
                        <button
                          onClick={() => deleteEventItem(event.id, idx)}
                          className={styles.deleteItemButton}
                          title="Usuń"
                        >
                          ✕
                        </button>
                      </div>
                    ))}
                  </div>

                  <div className={styles.eventActions}>
                    <button
                      onClick={() => exportToCalendar(event)}
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

                  {/* Oryginalna wiadomość (ukryta pod przyciskiem) */}
                  {event.sourceText && (
                    <details className={styles.originalToggle}>
                      <summary className={styles.originalSummary}>
                        <span>Pokaż oryginał</span>
                        <svg className={styles.originalChevron} viewBox="0 0 24 24">
                          <polyline points="9 18 15 12 9 6" />
                        </svg>
                      </summary>
                      <div className={styles.originalText}>
                        {event.sourceText}
                      </div>
                    </details>
                  )}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
