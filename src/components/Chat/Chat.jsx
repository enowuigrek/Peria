import { useState, useEffect, useRef } from 'react'
import PropTypes from 'prop-types'
import { askAgent } from '../../agent'
import { chaosToStructure, isConfident, getTypeLabel } from '../../utils/chaosToStructure'
import styles from './Chat.module.scss'

export default function Chat({ onAdd }) {
  const [messages, setMessages] = useState(() => {
    const stored = localStorage.getItem('chatMessages')
    return stored ? JSON.parse(stored) : []
  })
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isRecording, setIsRecording] = useState(false)
  const [recordingTime, setRecordingTime] = useState(0)
  const [lastResult, setLastResult] = useState(null)
  const [pendingText, setPendingText] = useState(null)
  const [showTypeSelector, setShowTypeSelector] = useState(false)
  const mediaRecorderRef = useRef(null)
  const audioChunksRef = useRef([])
  const recordingIntervalRef = useRef(null)

  useEffect(() => {
    localStorage.setItem('chatMessages', JSON.stringify(messages))
  }, [messages])

  const handleSend = async () => {
    if (!input.trim() || isLoading) return

    const userMessage = input.trim()
    const newMessage = { from: 'user', text: userMessage }
    const thinkingMessage = { from: 'bot', text: '...' }

    setMessages((prev) => [...prev, newMessage, thinkingMessage])
    setInput('')
    setIsLoading(true)

    try {
      const responseText = await askAgent(userMessage)
      let tasks = []

      if (typeof responseText === 'string') {
        tasks = responseText
          .split('\n')
          .map((line) => line.trim())
          .filter((line) => line)
      } else if (Array.isArray(responseText)) {
        tasks = responseText.map((line) => line.trim()).filter((line) => line)
      } else {
        console.error('Response from agent is not a valid string or array:', responseText)
        setMessages((prev) => {
          const updated = [...prev]
          updated.pop()
          return [...updated, { from: 'bot', text: '[Błąd AI: Niepoprawny format odpowiedzi]' }]
        })
        return
      }

      if (tasks.length === 0) {
        setMessages((prev) => {
          const updated = [...prev]
          updated.pop()
          return [...updated, { from: 'bot', text: 'Nie udało się uporządkować myśli.' }]
        })
        return
      }

      setMessages((prev) => {
        const updated = [...prev]
        updated.pop()
        return [
          ...updated,
          {
            from: 'bot',
            text: tasks
              .map((t, i) => `${i + 1}. ${typeof t === 'string' ? t.replace(/^- /, '') : String(t)}`)
              .join('\n'),
          },
        ]
      })

      tasks.forEach((task) => {
        if (typeof task === 'string') {
          onAdd(task.replace(/^- /, ''))
        }
      })
    } catch (error) {
      console.error('Błąd podczas komunikacji z AI:', error)
      setMessages((prev) => {
        const updated = [...prev]
        updated.pop()
        return [...updated, { from: 'bot', text: '[Błąd AI: Nie udało się uzyskać odpowiedzi]' }]
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const clearChat = () => {
    if (window.confirm('Czy na pewno chcesz wyczyścić historię czatu?')) {
      setMessages([])
      localStorage.removeItem('chatMessages')
    }
  }

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const mediaRecorder = new MediaRecorder(stream)
      mediaRecorderRef.current = mediaRecorder
      audioChunksRef.current = []

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data)
        }
      }

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' })
        stream.getTracks().forEach(track => track.stop())
        await processAudioBlob(audioBlob)
      }

      mediaRecorder.start()
      setIsRecording(true)
      setRecordingTime(0)

      // Timer
      recordingIntervalRef.current = setInterval(() => {
        setRecordingTime(prev => {
          if (prev >= 60) {
            stopRecording()
            return 60
          }
          return prev + 1
        })
      }, 1000)

    } catch (error) {
      console.error('Błąd dostępu do mikrofonu:', error)
      alert('Nie można uzyskać dostępu do mikrofonu. Sprawdź uprawnienia w ustawieniach przeglądarki.')
    }
  }

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop()
      setIsRecording(false)
      if (recordingIntervalRef.current) {
        clearInterval(recordingIntervalRef.current)
      }
    }
  }

  const processAudioBlob = async (audioBlob) => {
    setIsLoading(true)
    const thinkingMessage = { from: 'bot', text: '🎤 Transkrybuję nagranie...' }
    setMessages((prev) => [...prev, thinkingMessage])

    try {
      // Wysyłanie do Whisper API
      const formData = new FormData()
      formData.append('file', audioBlob, 'recording.webm')
      formData.append('model', 'whisper-1')
      formData.append('language', 'pl')

      const response = await fetch('https://api.openai.com/v1/audio/transcriptions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${import.meta.env.VITE_OPENAI_API_KEY}`
        },
        body: formData
      })

      if (!response.ok) {
        throw new Error('Błąd transkrypcji: ' + response.statusText)
      }

      const data = await response.json()
      const transcription = data.text

      if (!transcription || !transcription.trim()) {
        setMessages((prev) => {
          const updated = [...prev]
          updated.pop()
          return [...updated, { from: 'bot', text: '❌ Nie wykryto mowy. Spróbuj ponownie.' }]
        })
        setIsLoading(false)
        return
      }

      // Dodaj transkrypcję jako wiadomość użytkownika
      setMessages((prev) => {
        const updated = [...prev]
        updated.pop()
        return [...updated, { from: 'user', text: transcription }]
      })

      // Przetwórz przez chaos→structure
      await processChaosToStructure(transcription)

    } catch (error) {
      console.error('Błąd przetwarzania audio:', error)
      setMessages((prev) => {
        const updated = [...prev]
        updated.pop()
        return [...updated, { from: 'bot', text: '❌ Błąd transkrypcji: ' + error.message }]
      })
      setIsLoading(false)
    }
  }

  const exportToApp = async (appType) => {
    if (!lastResult) return

    const today = new Date().toISOString().split('T')[0]
    let exportText = ''
    let title = ''
    let instruction = ''

    if (appType === 'reminders' && lastResult.type === 'checklist') {
      title = `Peria - ${lastResult.title}`
      exportText = lastResult.structured.items.map(item => `☐ ${item}`).join('\n')
      instruction = 'Otwórz Apple Reminders → Nowa lista → Wklej'
    } else if (appType === 'notes' && lastResult.type === 'note') {
      title = `Peria - ${lastResult.title}`
      exportText = `# ${lastResult.title}\n\n${lastResult.content}`
      if (lastResult.structured?.tags && lastResult.structured.tags.length > 0) {
        exportText += `\n\n---\n${lastResult.structured.tags.map(t => `#${t}`).join(' ')}`
      }
      instruction = 'Otwórz Apple Notes → Nowa notatka → Wklej'
    } else if (appType === 'calendar' && lastResult.type === 'calendar_event') {
      title = `Peria - ${lastResult.title}`
      exportText = `${lastResult.title}\n\n📅 ${lastResult.structured?.datetime || today}\n\n${lastResult.content}`
      instruction = 'Otwórz Kalendarz → Nowe wydarzenie → Wklej'
    } else {
      // Fallback - eksport jako tekst
      title = `Peria - ${lastResult.title}`
      exportText = `${lastResult.title}\n\n${lastResult.content}`
      instruction = 'Wklej gdzie chcesz'
    }

    // Spróbuj Web Share API (działa na iOS)
    if (navigator.share) {
      try {
        await navigator.share({
          title: title,
          text: exportText
        })
      } catch (error) {
        if (error.name !== 'AbortError') {
          console.error('Share error:', error)
          fallbackCopyToClipboard(exportText, instruction)
        }
      }
    } else {
      // Fallback: kopiuj do schowka
      fallbackCopyToClipboard(exportText, instruction)
    }
  }

  const fallbackCopyToClipboard = (text, instruction) => {
    navigator.clipboard.writeText(text).then(() => {
      alert(`✅ Skopiowano do schowka!\n\n${instruction}`)
    }).catch((error) => {
      console.error('Clipboard error:', error)
      alert('❌ Błąd kopiowania. Spróbuj ponownie.')
    })
  }

  const processChaosToStructure = async (text, forcedType = null) => {
    const thinkingMessage = { from: 'bot', text: '🧠 Porządkuję chaos...' }
    setMessages((prev) => [...prev, thinkingMessage])

    try {
      const result = await chaosToStructure(text)

      // Usuń "thinking" message
      setMessages((prev) => prev.slice(0, -1))

      // Jeśli niska pewność i nie wymuszony typ - zapytaj użytkownika
      if (!forcedType && !isConfident(result.confidence)) {
        setPendingText(text)
        setShowTypeSelector(true)
        setMessages((prev) => [
          ...prev,
          {
            from: 'bot',
            text: `🤔 Nie jestem pewien (${Math.round(result.confidence * 100)}%).\n\nCo to ma być?`
          }
        ])
        setIsLoading(false)
        return
      }

      // Zapisz rezultat do eksportu
      setLastResult(result)

      // Wyświetl rezultat
      let resultText = `📋 **${result.title}**\n\nTyp: ${getTypeLabel(result.type)}\nPewność: ${Math.round(result.confidence * 100)}%\n\n`

      if (result.type === 'checklist' && result.structured?.items) {
        resultText += result.structured.items.map((item, i) => `${i + 1}. ${item}`).join('\n')
      } else if (result.type === 'note' && result.structured?.paragraphs) {
        resultText += result.structured.paragraphs.join('\n\n')
        if (result.structured?.tags && result.structured.tags.length > 0) {
          resultText += `\n\n🏷️ ${result.structured.tags.join(', ')}`
        }
      } else if (result.type === 'calendar_event') {
        resultText += `📅 ${result.structured?.datetime || 'Brak daty'}\n\n${result.content}`
      } else {
        resultText += result.content
      }

      setMessages((prev) => [...prev, { from: 'bot', text: resultText }])

      // Dodaj do listy zadań jeśli to checklist
      if (result.type === 'checklist' && result.structured?.items) {
        result.structured.items.forEach(item => onAdd(item))
      }

    } catch (error) {
      console.error('Błąd chaos→structure:', error)
      setMessages((prev) => {
        const updated = [...prev]
        updated.pop()
        return [...updated, { from: 'bot', text: '❌ Błąd przetwarzania: ' + error.message }]
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleTypeSelection = async (type) => {
    setShowTypeSelector(false)
    setIsLoading(true)

    // Przetwórz ponownie z wymuszonym typem
    const manualResult = {
      type: type,
      confidence: 1.0,
      title: pendingText.substring(0, 50) + (pendingText.length > 50 ? '...' : ''),
      content: pendingText,
      structured: type === 'checklist'
        ? { items: pendingText.split('\n').filter(l => l.trim()) }
        : type === 'note'
        ? { paragraphs: [pendingText], tags: [] }
        : { datetime: new Date().toISOString(), description: pendingText }
    }

    setLastResult(manualResult)

    let resultText = `📋 **${manualResult.title}**\n\nTyp: ${getTypeLabel(type)} (ręcznie wybrane)\n\n`

    if (type === 'checklist' && manualResult.structured?.items) {
      resultText += manualResult.structured.items.map((item, i) => `${i + 1}. ${item}`).join('\n')
      manualResult.structured.items.forEach(item => onAdd(item))
    } else if (type === 'note') {
      resultText += manualResult.content
    } else if (type === 'calendar_event') {
      resultText += `📅 ${new Date().toLocaleDateString('pl-PL')}\n\n${manualResult.content}`
    }

    setMessages((prev) => [...prev, { from: 'bot', text: resultText }])
    setPendingText(null)
    setIsLoading(false)
  }

  return (
    <div className={styles.chatWrapper}>
      <div className={styles.chatMessages}>
        {messages.map((msg, index) => (
          <div
            key={index}
            className={msg.from === 'user' ? styles.userBubble : styles.botBubble}
          >
            {msg.text === '...' ? (
              <span className={styles.loadingDots}>
                <span className={styles.dot}></span>
                <span className={styles.dot}></span>
                <span className={styles.dot}></span>
              </span>
            ) : (
              msg.text
            )}
          </div>
        ))}
      </div>
      {showTypeSelector && (
        <div className={styles.typeSelectorBar}>
          <button onClick={() => handleTypeSelection('checklist')} className={styles.typeButton}>
            ✅ Checklist
          </button>
          <button onClick={() => handleTypeSelection('note')} className={styles.typeButton}>
            📝 Notatka
          </button>
          <button onClick={() => handleTypeSelection('calendar_event')} className={styles.typeButton}>
            📅 Wydarzenie
          </button>
        </div>
      )}
      {lastResult && !showTypeSelector && (
        <div className={styles.exportBar}>
          {lastResult.type === 'checklist' && (
            <button onClick={() => exportToApp('reminders')} className={styles.exportButton}>
              📤 Do Reminders
            </button>
          )}
          {lastResult.type === 'note' && (
            <button onClick={() => exportToApp('notes')} className={styles.exportButton}>
              📤 Do Notes
            </button>
          )}
          {lastResult.type === 'calendar_event' && (
            <button onClick={() => exportToApp('calendar')} className={styles.exportButton}>
              📤 Do Kalendarza
            </button>
          )}
        </div>
      )}
      <div className={styles.chatInputBar}>
        <button
          onClick={isRecording ? stopRecording : startRecording}
          disabled={isLoading}
          className={isRecording ? styles.recordingButton : styles.micButton}
          title={isRecording ? 'Zatrzymaj nagrywanie' : 'Nagraj głosem'}
        >
          {isRecording ? `⏹ ${recordingTime}s` : '🎤'}
        </button>
        <input
          type="text"
          placeholder="Schwytaj myśl, zanim przeminie..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={isLoading || isRecording}
        />
        <button onClick={handleSend} disabled={isLoading || !input.trim() || isRecording} className={styles.sendButton}>
          {isLoading ? '⏳' : '➤'}
        </button>
        {messages.length > 0 && (
          <button onClick={clearChat} className={styles.clearButton} title="Wyczyść czat">
            ✕
          </button>
        )}
      </div>
    </div>
  )
}

Chat.propTypes = {
  onAdd: PropTypes.func.isRequired,
}