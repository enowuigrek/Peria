/**
 * Generates .ics (iCalendar) file content for calendar events
 * Compatible with iOS Calendar, Google Calendar, Outlook, etc.
 */

/**
 * Format date to iCalendar format: YYYYMMDDTHHMMSSZ
 * @param {string} dateStr - Date in YYYY-MM-DD format
 * @param {string} timeStr - Time in HH:MM format (optional)
 * @returns {string} - iCalendar formatted datetime
 */
function formatDateForICS(dateStr, timeStr = null) {
  const date = new Date(dateStr)

  if (timeStr) {
    const [hours, minutes] = timeStr.split(':')
    date.setHours(parseInt(hours, 10), parseInt(minutes, 10), 0, 0)
  } else {
    // All-day event
    date.setHours(0, 0, 0, 0)
  }

  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  const hours = String(date.getHours()).padStart(2, '0')
  const mins = String(date.getMinutes()).padStart(2, '0')
  const secs = String(date.getSeconds()).padStart(2, '0')

  if (timeStr) {
    // With time (local timezone)
    return `${year}${month}${day}T${hours}${mins}${secs}`
  } else {
    // All-day event (VALUE=DATE format)
    return `${year}${month}${day}`
  }
}

/**
 * Escape special characters for iCalendar format
 * @param {string} text
 * @returns {string}
 */
function escapeICSText(text) {
  if (!text) return ''
  return text
    .replace(/\\/g, '\\\\')
    .replace(/;/g, '\\;')
    .replace(/,/g, '\\,')
    .replace(/\n/g, '\\n')
}

/**
 * Generate a single VEVENT component
 * @param {Object} event - Event object
 * @param {string} event.title - Event title
 * @param {string} event.date - Date in YYYY-MM-DD format
 * @param {string} event.time - Start time in HH:MM format (optional)
 * @param {string} event.endTime - End time in HH:MM format (optional)
 * @param {string} event.endDate - End date for multi-day events (optional)
 * @returns {string} - VEVENT component
 */
function generateVEvent(event) {
  const { title, date, time, endTime, endDate } = event
  const now = new Date()
  const timestamp = formatDateForICS(now.toISOString().split('T')[0], now.toTimeString().split(' ')[0].substring(0, 5))

  // Generate unique ID
  const uid = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}@peria.app`

  let vevent = 'BEGIN:VEVENT\r\n'
  vevent += `UID:${uid}\r\n`
  vevent += `DTSTAMP:${timestamp}\r\n`

  // Handle different event types
  if (endDate) {
    // Multi-day event (e.g., "Trip to Greece for 2 weeks")
    const startDate = formatDateForICS(date)
    const endDateFormatted = formatDateForICS(endDate)
    vevent += `DTSTART;VALUE=DATE:${startDate}\r\n`
    vevent += `DTEND;VALUE=DATE:${endDateFormatted}\r\n`
  } else if (time) {
    // Event with specific time
    const startDateTime = formatDateForICS(date, time)

    if (endTime) {
      // Event with start and end time (e.g., "Meeting 14:00-16:00")
      const endDateTime = formatDateForICS(date, endTime)
      vevent += `DTSTART:${startDateTime}\r\n`
      vevent += `DTEND:${endDateTime}\r\n`
    } else {
      // Event with start time only (default 1 hour duration)
      vevent += `DTSTART:${startDateTime}\r\n`
      const endDate = new Date(new Date(date + 'T' + time).getTime() + 60 * 60 * 1000)
      const endDateTime = formatDateForICS(
        endDate.toISOString().split('T')[0],
        endDate.toTimeString().split(' ')[0].substring(0, 5)
      )
      vevent += `DTEND:${endDateTime}\r\n`
    }
  } else {
    // All-day event
    const startDate = formatDateForICS(date)
    vevent += `DTSTART;VALUE=DATE:${startDate}\r\n`

    // All-day events: DTEND is the day after
    const nextDay = new Date(date)
    nextDay.setDate(nextDay.getDate() + 1)
    const endDate = formatDateForICS(nextDay.toISOString().split('T')[0])
    vevent += `DTEND;VALUE=DATE:${endDate}\r\n`
  }

  vevent += `SUMMARY:${escapeICSText(title)}\r\n`
  vevent += 'END:VEVENT\r\n'

  return vevent
}

/**
 * Generate complete .ics file content
 * @param {Array|Object} events - Single event object or array of events
 * @returns {string} - Complete .ics file content
 */
export function generateICS(events) {
  const eventArray = Array.isArray(events) ? events : [events]

  let ics = 'BEGIN:VCALENDAR\r\n'
  ics += 'VERSION:2.0\r\n'
  ics += 'PRODID:-//Peria//Voice Notes Calendar//PL\r\n'
  ics += 'CALSCALE:GREGORIAN\r\n'
  ics += 'METHOD:PUBLISH\r\n'

  eventArray.forEach(event => {
    ics += generateVEvent(event)
  })

  ics += 'END:VCALENDAR\r\n'

  return ics
}

/**
 * Download .ics file or open in calendar app
 * iOS rozpoznaje data URI z text/calendar i otwiera w Kalendarzu natychmiast
 * @param {string} icsContent - .ics file content
 * @param {string} filename - Filename (without .ics extension)
 */
export async function downloadOrShareICS(icsContent, filename = 'event') {
  // Detect iOS (iPhone/iPad)
  const isIOS = /iPhone|iPad|iPod/i.test(navigator.userAgent)

  if (isIOS) {
    // iOS: używamy data URI - natywnie otwiera w Kalendarzu
    // Tak samo jak PKP, Booksy, bilety lotnicze
    const dataUri = `data:text/calendar;charset=utf-8,${encodeURIComponent(icsContent)}`

    // WAŻNE: window.location.href zamiast window.open() - nie otwiera nowej karty
    window.location.href = dataUri

    return { success: true, method: 'ios-calendar' }
  }

  // Android/Desktop: tradycyjny download
  const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `${filename}.ics`
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)

  return { success: true, method: 'download' }
}
