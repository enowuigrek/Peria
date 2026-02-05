/**
 * Export checklist to Apple Reminders
 * Uses URL scheme for iOS native integration
 */

/**
 * Export checklist items to Apple Reminders
 * @param {Object} checklist - Checklist object
 * @param {string} checklist.title - List title
 * @param {Array} checklist.content - Array of {text, completed}
 */
export function exportToReminders(checklist) {
  const items = Array.isArray(checklist.content) ? checklist.content : []

  // Filter out completed items (user probably doesn't want them in new list)
  const pendingItems = items.filter(item => !item.completed)

  if (pendingItems.length === 0) {
    alert('✅ Wszystkie zadania już wykonane!')
    return
  }

  // Detect iOS
  const isIOS = /iPhone|iPad|iPod/i.test(navigator.userAgent)

  if (isIOS) {
    // iOS: Try URL scheme (may not work in all iOS versions)
    // Fallback to share API if URL scheme fails

    // Format: Create reminders one by one (iOS doesn't support bulk import via URL)
    // We'll use Share API which works better for Reminders

    const reminderText = pendingItems.map(item => `• ${item.text}`).join('\n')
    const shareText = `${checklist.title}\n\n${reminderText}\n\n(Skopiuj do Apple Reminders)`

    // Use native share - user can choose "Reminders" app
    if (navigator.share) {
      navigator.share({
        title: checklist.title,
        text: shareText
      }).then(() => {
        // Success
      }).catch((error) => {
        if (error.name !== 'AbortError') {
          console.error('Share error:', error)
          fallbackCopy(shareText)
        }
      })
    } else {
      fallbackCopy(shareText)
    }
  } else {
    // Desktop/Android: Copy to clipboard
    const exportText = pendingItems.map(item => item.text).join('\n')
    fallbackCopy(`${checklist.title}\n\n${exportText}`)
  }
}

function fallbackCopy(text) {
  navigator.clipboard.writeText(text).then(() => {
    alert('📋 Skopiowano do schowka!\nWklej w Apple Reminders.')
  }).catch(() => {
    alert('❌ Nie udało się skopiować')
  })
}
