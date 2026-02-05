import { useState, useEffect } from 'react'
import styles from './Checklists.module.scss'

export default function Checklists() {
  const [checklists, setChecklists] = useState(() => {
    const stored = localStorage.getItem('peria_checklists')
    return stored ? JSON.parse(stored) : []
  })
  const [expandedChecklists, setExpandedChecklists] = useState(new Set())
  const [editingItemId, setEditingItemId] = useState(null)
  const [editText, setEditText] = useState('')

  useEffect(() => {
    localStorage.setItem('peria_checklists', JSON.stringify(checklists))
  }, [checklists])

  const toggleExpand = (id) => {
    setExpandedChecklists(prev => {
      const newSet = new Set(prev)
      if (newSet.has(id)) {
        newSet.delete(id)
      } else {
        newSet.add(id)
      }
      return newSet
    })
  }

  const deleteChecklist = (id) => {
    if (window.confirm('Usunąć tę checklistę?')) {
      setChecklists(prev => prev.filter(c => c.id !== id))
    }
  }

  const toggleItem = (checklistId, itemIndex) => {
    setChecklists(prev => prev.map(checklist => {
      if (checklist.id === checklistId) {
        const updatedContent = Array.isArray(checklist.content)
          ? checklist.content.map((item, idx) =>
              idx === itemIndex ? { ...item, completed: !item.completed } : item
            )
          : checklist.content
        return { ...checklist, content: updatedContent }
      }
      return checklist
    }))
  }

  const startEditItem = (checklistId, itemIndex, currentText) => {
    setEditingItemId(`${checklistId}-${itemIndex}`)
    setEditText(currentText)
  }

  const saveEditItem = (checklistId, itemIndex) => {
    setChecklists(prev => prev.map(checklist => {
      if (checklist.id === checklistId) {
        const updatedContent = Array.isArray(checklist.content)
          ? checklist.content.map((item, idx) =>
              idx === itemIndex ? { ...item, text: editText } : item
            )
          : checklist.content
        return { ...checklist, content: updatedContent }
      }
      return checklist
    }))
    setEditingItemId(null)
    setEditText('')
  }

  const cancelEdit = () => {
    setEditingItemId(null)
    setEditText('')
  }

  const deleteItem = (checklistId, itemIndex) => {
    if (window.confirm('Usunąć ten element?')) {
      setChecklists(prev => prev.map(checklist => {
        if (checklist.id === checklistId) {
          const updatedContent = Array.isArray(checklist.content)
            ? checklist.content.filter((_, idx) => idx !== itemIndex)
            : checklist.content
          return { ...checklist, content: updatedContent }
        }
        return checklist
      }))
    }
  }

  const exportToReminders = async (checklist) => {
    const content = Array.isArray(checklist.content)
      ? checklist.content.map(item => `${item.completed ? '✓' : '□'} ${item.text}`).join('\n')
      : checklist.content

    const exportText = `${checklist.title}\n\n${content}`

    if (navigator.share) {
      try {
        await navigator.share({
          title: checklist.title,
          text: exportText
        })
        alert('✅ Wyeksportowano checklistę')
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

  if (checklists.length === 0) {
    return (
      <div className={styles.emptyState}>
        <div className={styles.emptyIcon}>✅</div>
        <p>Brak checklisty</p>
        <p className={styles.emptyHint}>Checklisty z Inbox pojawią się tutaj</p>
      </div>
    )
  }

  return (
    <div className={styles.checklistsWrapper}>
      <div className={styles.checklistsList}>
        {checklists.map((checklist) => {
          const isExpanded = expandedChecklists.has(checklist.id)
          const items = Array.isArray(checklist.content) ? checklist.content : []
          const completedCount = items.filter(item => item.completed).length
          const totalCount = items.length

          return (
            <div key={checklist.id} className={styles.checklistCard}>
              <div
                className={styles.checklistHeader}
                onClick={() => toggleExpand(checklist.id)}
                style={{ cursor: 'pointer' }}
              >
                <div className={styles.checklistHeaderLeft}>
                  <div className={styles.checklistTitle}>{checklist.title}</div>
                  <div className={styles.checklistDate}>
                    {new Date(checklist.createdAt).toLocaleDateString('pl-PL', {
                      day: 'numeric',
                      month: 'short',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                    <span className={styles.progressBadge}>
                      {completedCount}/{totalCount}
                    </span>
                  </div>
                </div>
                <div className={styles.checklistHeaderRight}>
                  <span className={styles.expandIcon}>{isExpanded ? '▼' : '▶'}</span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      deleteChecklist(checklist.id)
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
                <div className={styles.checklistBody}>
                  <div className={styles.itemsList}>
                    {/* Nieukończone zadania */}
                    {items.map((item, idx) => {
                      if (item.completed) return null
                      const isEditing = editingItemId === `${checklist.id}-${idx}`

                      return (
                        <div
                          key={idx}
                          className={styles.checklistItem}
                        >
                          {isEditing ? (
                            <div className={styles.editContainer}>
                              <input
                                type="text"
                                className={styles.editInput}
                                value={editText}
                                onChange={(e) => setEditText(e.target.value)}
                                autoFocus
                              />
                              <div className={styles.editActions}>
                                <button
                                  onClick={() => saveEditItem(checklist.id, idx)}
                                  className={styles.saveButton}
                                  title="Zapisz"
                                >
                                  ✓
                                </button>
                                <button
                                  onClick={cancelEdit}
                                  className={styles.cancelButton}
                                  title="Anuluj"
                                >
                                  ✕
                                </button>
                              </div>
                            </div>
                          ) : (
                            <>
                              <input
                                type="checkbox"
                                checked={item.completed || false}
                                onChange={() => toggleItem(checklist.id, idx)}
                                className={styles.checkbox}
                              />
                              <span className={styles.itemText}>{item.text}</span>
                              <div className={styles.itemActions}>
                                <button
                                  onClick={() => startEditItem(checklist.id, idx, item.text)}
                                  className={styles.editItemButton}
                                  title="Edytuj"
                                >
                                  ✎
                                </button>
                                <button
                                  onClick={() => deleteItem(checklist.id, idx)}
                                  className={styles.deleteItemButton}
                                  title="Usuń"
                                >
                                  ✕
                                </button>
                              </div>
                            </>
                          )}
                        </div>
                      )
                    })}

                    {/* Separator jeśli są ukończone zadania */}
                    {items.some(item => item.completed) && items.some(item => !item.completed) && (
                      <div className={styles.completedSeparator}>
                        <span>Ukończone</span>
                      </div>
                    )}

                    {/* Ukończone zadania */}
                    {items.map((item, idx) => {
                      if (!item.completed) return null
                      const isEditing = editingItemId === `${checklist.id}-${idx}`

                      return (
                        <div
                          key={idx}
                          className={`${styles.checklistItem} ${styles.completed}`}
                        >
                          {isEditing ? (
                            <div className={styles.editContainer}>
                              <input
                                type="text"
                                className={styles.editInput}
                                value={editText}
                                onChange={(e) => setEditText(e.target.value)}
                                autoFocus
                              />
                              <div className={styles.editActions}>
                                <button
                                  onClick={() => saveEditItem(checklist.id, idx)}
                                  className={styles.saveButton}
                                  title="Zapisz"
                                >
                                  ✓
                                </button>
                                <button
                                  onClick={cancelEdit}
                                  className={styles.cancelButton}
                                  title="Anuluj"
                                >
                                  ✕
                                </button>
                              </div>
                            </div>
                          ) : (
                            <>
                              <input
                                type="checkbox"
                                checked={item.completed || false}
                                onChange={() => toggleItem(checklist.id, idx)}
                                className={styles.checkbox}
                              />
                              <span className={styles.itemText}>{item.text}</span>
                              <div className={styles.itemActions}>
                                <button
                                  onClick={() => startEditItem(checklist.id, idx, item.text)}
                                  className={styles.editItemButton}
                                  title="Edytuj"
                                >
                                  ✎
                                </button>
                                <button
                                  onClick={() => deleteItem(checklist.id, idx)}
                                  className={styles.deleteItemButton}
                                  title="Usuń"
                                >
                                  ✕
                                </button>
                              </div>
                            </>
                          )}
                        </div>
                      )
                    })}
                  </div>

                  <div className={styles.checklistActions}>
                    <button
                      onClick={() => exportToReminders(checklist)}
                      className={styles.exportButton}
                    >
                      → Apple Reminders
                    </button>
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
