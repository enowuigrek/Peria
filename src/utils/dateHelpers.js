/**
 * Helper functions for date manipulation and grouping
 */

/**
 * Groups items by date
 * @param {Array} items - Array of items with createdAt or sourceDate field
 * @param {string} dateField - Field name to use for grouping (default: 'createdAt')
 * @returns {Array} Array of { date, label, items } objects sorted chronologically
 */
export function groupByDate(items, dateField = 'createdAt') {
  const groups = {}

  items.forEach(item => {
    const dateStr = item[dateField]
    if (!dateStr) return

    const date = new Date(dateStr)
    const dayKey = date.toISOString().split('T')[0] // YYYY-MM-DD

    if (!groups[dayKey]) {
      groups[dayKey] = {
        date: dayKey,
        dateObj: date,
        label: formatDateLabel(date),
        items: []
      }
    }

    groups[dayKey].items.push(item)
  })

  // Convert to array and sort by date (newest first)
  return Object.values(groups).sort((a, b) => b.dateObj - a.dateObj)
}

/**
 * Formats date to Polish label
 * @param {Date} date
 * @returns {string} Formatted label like "Dzisiaj", "Wczoraj", "pon, 6 sty"
 */
export function formatDateLabel(date) {
  const now = new Date()
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const dateOnly = new Date(date.getFullYear(), date.getMonth(), date.getDate())

  const diffTime = today - dateOnly
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24))

  if (diffDays === 0) return 'Dzisiaj'
  if (diffDays === 1) return 'Wczoraj'
  if (diffDays === 2) return 'Przedwczoraj'
  if (diffDays < 7) {
    return date.toLocaleDateString('pl-PL', { weekday: 'long' })
  }

  // For older dates
  return date.toLocaleDateString('pl-PL', {
    weekday: 'short',
    day: 'numeric',
    month: 'short'
  })
}

/**
 * Groups events by their event date (not creation date)
 * @param {Array} events - Array of events with content array containing date field
 * @returns {Array} Array of { date, label, items } objects sorted chronologically
 */
export function groupEventsByEventDate(events) {
  const groups = {}

  events.forEach(event => {
    const eventItems = Array.isArray(event.content) ? event.content : []

    eventItems.forEach(item => {
      if (!item.date) return

      const dayKey = item.date // Already in YYYY-MM-DD format
      const date = new Date(item.date)

      if (!groups[dayKey]) {
        groups[dayKey] = {
          date: dayKey,
          dateObj: date,
          label: formatDateLabel(date),
          items: []
        }
      }

      groups[dayKey].items.push({ ...event, eventItem: item })
    })
  })

  // Sort by date (nearest first for events)
  return Object.values(groups).sort((a, b) => a.dateObj - b.dateObj)
}
