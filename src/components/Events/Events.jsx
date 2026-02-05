import { useState, useEffect } from 'react'
import styles from './Events.module.scss'
import { generateICS, downloadOrShareICS } from '../../utils/icsGenerator'

export default function Events() {
  const [events, setEvents] = useState(() => {
    const stored = localStorage.getItem('peria_events')
    return stored ? JSON.parse(stored) : []
  })
  const [expandedEvents, setExpandedEvents] = useState(new Set())
  const [editingTitleId, setEditingTitleId] = useState(null)
  const [editTitleText, setEditTitleText] = useState('')
  const [editingItemId, setEditingItemId] = useState(null) // eventId-itemIndex
  const [editItemData, setEditItemData] = useState({ title: '', date: '', time: '', endTime: '' })

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

  const startEditItem = (eventId, itemIndex, item) => {
    setEditingItemId(`${eventId}-${itemIndex}`)
    setEditItemData({
      title: item.title || '',
      date: item.date || '',
      time: item.time || '',
      endTime: item.endTime || ''
    })
  }

  const saveEditItem = (eventId, itemIndex) => {
    setEvents(prev => prev.map(event => {
      if (event.id === eventId && Array.isArray(event.content)) {
        const updatedContent = event.content.map((item, idx) =>
          idx === itemIndex ? { ...item, ...editItemData } : item
        )
        return { ...event, content: updatedContent }
      }
      return event
    }))
    setEditingItemId(null)
    setEditItemData({ title: '', date: '', time: '', endTime: '' })
  }

  const cancelEditItem = () => {
    setEditingItemId(null)
    setEditItemData({ title: '', date: '', time: '', endTime: '' })
  }

  const exportSingleEvent = async (item) => {
    // Generate .ics file for single event
    const icsContent = generateICS(item)
    const filename = `${item.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}`

    try {
      const result = await downloadOrShareICS(icsContent, filename)
      if (result.success && !result.cancelled) {
        alert('✅ Wydarzenie dodane do kalendarza!')
      }
    } catch (error) {
      console.error('Export error:', error)
      alert('❌ Błąd eksportu wydarzenia')
    }
  }

  const exportToCalendar = async (event) => {
    // Generate .ics file with all events in this group
    const eventItems = Array.isArray(event.content) ? event.content : []

    if (eventItems.length === 0) {
      alert('❌ Brak wydarzeń do eksportu')
      return
    }

    const icsContent = generateICS(eventItems)
    const filename = `${event.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_wydarzenia`

    try {
      const result = await downloadOrShareICS(icsContent, filename)
      if (result.success && !result.cancelled) {
        const count = eventItems.length
        alert(`✅ Dodano ${count} ${count === 1 ? 'wydarzenie' : 'wydarzenia'} do kalendarza!`)
      }
    } catch (error) {
      console.error('Export error:', error)
      alert('❌ Błąd eksportu wydarzeń')
    }
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
                    {/* Licznik wydarzeń */}
                    {eventItems.length > 0 && (
                      <span className={styles.eventCountBadge}>{eventItems.length}</span>
                    )}
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
                    {eventItems.map((item, idx) => {
                      const isEditingItem = editingItemId === `${event.id}-${idx}`

                      return (
                        <div key={idx} className={styles.eventItem}>
                          <div className={styles.eventItemContent}>
                            {isEditingItem ? (
                              <div className={styles.editItemForm}>
                                <input
                                  type="text"
                                  placeholder="Tytuł"
                                  className={styles.editItemInput}
                                  value={editItemData.title}
                                  onChange={(e) => setEditItemData(prev => ({ ...prev, title: e.target.value }))}
                                />
                                <input
                                  type="text"
                                  placeholder="Data (np. 2024-01-15)"
                                  className={styles.editItemInput}
                                  value={editItemData.date}
                                  onChange={(e) => setEditItemData(prev => ({ ...prev, date: e.target.value }))}
                                />
                                <div className={styles.editItemTimeRow}>
                                  <input
                                    type="text"
                                    placeholder="Czas (np. 14:00)"
                                    className={styles.editItemInputSmall}
                                    value={editItemData.time}
                                    onChange={(e) => setEditItemData(prev => ({ ...prev, time: e.target.value }))}
                                  />
                                  <input
                                    type="text"
                                    placeholder="Do (np. 16:00)"
                                    className={styles.editItemInputSmall}
                                    value={editItemData.endTime}
                                    onChange={(e) => setEditItemData(prev => ({ ...prev, endTime: e.target.value }))}
                                  />
                                </div>
                                <div className={styles.editItemActions}>
                                  <button
                                    onClick={() => saveEditItem(event.id, idx)}
                                    className={styles.saveEditButton}
                                  >
                                    ✓ Zapisz
                                  </button>
                                  <button
                                    onClick={cancelEditItem}
                                    className={styles.cancelEditButton}
                                  >
                                    ✕ Anuluj
                                  </button>
                                </div>
                              </div>
                            ) : (
                              <>
                                <div className={styles.eventItemTitle}>📅 {item.title}</div>
                                <div className={styles.eventItemDateTime}>
                                  {item.endDate ? (
                                    <>
                                      <div className={styles.eventItemDate}>Start: {item.date}</div>
                                      <div className={styles.eventItemDate}>Koniec: {item.endDate}</div>
                                    </>
                                  ) : (
                                    <div className={styles.eventItemDateRow}>
                                      <span className={styles.eventItemDate}>{item.date}</span>
                                      {item.time && (
                                        <span className={styles.eventItemTime}>
                                          • {item.time}{item.endTime && ` - ${item.endTime}`}
                                        </span>
                                      )}
                                    </div>
                                  )}
                                </div>
                              </>
                            )}
                          </div>
                          {!isEditingItem && (
                            <div className={styles.eventItemActions}>
                              <button
                                onClick={() => startEditItem(event.id, idx, item)}
                                className={styles.editItemButton}
                                title="Edytuj"
                              >
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                                  <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                                </svg>
                              </button>
                              <button
                                onClick={() => exportSingleEvent(item)}
                                className={styles.exportItemButton}
                                title="Eksportuj"
                              >
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                                  <polyline points="7 10 12 15 17 10" />
                                  <line x1="12" y1="15" x2="12" y2="3" />
                                </svg>
                              </button>
                              <button
                                onClick={() => deleteEventItem(event.id, idx)}
                                className={styles.deleteItemButton}
                                title="Usuń"
                              >
                                ✕
                              </button>
                            </div>
                          )}
                        </div>
                      )
                    })}
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
