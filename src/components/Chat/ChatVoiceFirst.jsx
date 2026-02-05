import { useState, useEffect, useRef } from 'react'
import PropTypes from 'prop-types'
import { detectStructure } from '../../agent'
import styles from './Chat.module.scss'

export default function ChatVoiceFirst({ onAdd }) {
  const [messages, setMessages] = useState(() => {
    const stored = localStorage.getItem('chatMessages')
    return stored ? JSON.parse(stored) : []
  })
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isRecording, setIsRecording] = useState(false)
  const [recordingTime, setRecordingTime] = useState(0)
  const [lastResult, setLastResult] = useState(null)
  const [showTextInput, setShowTextInput] = useState(false) // Kontrola widoczności text inputa
  const mediaRecorderRef = useRef(null)
  const audioChunksRef = useRef([])
  const recordingIntervalRef = useRef(null)

  useEffect(() => {
    localStorage.setItem('chatMessages', JSON.stringify(messages))
  }, [messages])

  const handleTextSend = async () => {
    if (!input.trim() || isLoading) return

    const userMessage = input.trim()
    setMessages((prev) => [...prev, { from: 'user', text: userMessage }])
    setInput('')
    setShowTextInput(false) // Ukryj input po wysłaniu

    await processText(userMessage)
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleTextSend()
    }
  }

  const clearChat = () => {
    if (window.confirm('Czy na pewno chcesz wyczyścić historię czatu?')) {
      setMessages([])
      localStorage.removeItem('chatMessages')
      setLastResult(null)
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
    setMessages((prev) => [...prev, { from: 'bot', text: '🎤 Transkrybuję nagranie...' }])

    try {
      // Sprawdź czy jest API key
      if (!import.meta.env.VITE_OPENAI_API_KEY) {
        throw new Error('Brak klucza API OpenAI. Ustaw VITE_OPENAI_API_KEY w pliku .env')
      }

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
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error?.message || `HTTP ${response.status}: ${response.statusText}`)
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

      // Przetwórz przez detectStructure
      await processText(transcription)

    } catch (error) {
      console.error('❌ Błąd transkrypcji:', error)
      setMessages((prev) => {
        const updated = [...prev]
        updated.pop()
        return [...updated, { from: 'bot', text: `❌ Błąd transkrypcji:\n${error.message}` }]
      })
      setIsLoading(false)
    }
  }

  const processText = async (text) => {
    setIsLoading(true)
    setMessages((prev) => [...prev, { from: 'bot', text: '🧠 Wykrywam strukturę...' }])

    try {
      const detected = await detectStructure(text)

      // Usuń "thinking" message
      setMessages((prev) => prev.slice(0, -1))

      // Zapisz rezultat
      const result = {
        id: Date.now().toString(),
        sourceText: text,
        detected: detected,
        createdAt: new Date().toISOString(),
        exported: {
          reminders: false,
          notes: false,
          calendar: false
        }
      }
      setLastResult(result)

      // Zapisz do localStorage jako notatka
      const notes = JSON.parse(localStorage.getItem('peria_notes') || '[]')
      notes.unshift(result) // Dodaj na początek (najnowsze na górze)
      localStorage.setItem('peria_notes', JSON.stringify(notes))

      // Wyświetl rezultat
      let resultText = `📋 **Wykryto strukturę**\n\n`

      if (detected.tasks && detected.tasks.length > 0) {
        resultText += `✅ Zadania (${detected.tasks.length}):\n`
        detected.tasks.forEach((task, i) => {
          resultText += `${i + 1}. ${task.text}\n`
        })
        resultText += '\n'
      }

      if (detected.events && detected.events.length > 0) {
        resultText += `📅 Wydarzenia (${detected.events.length}):\n`
        detected.events.forEach((event, i) => {
          resultText += `${i + 1}. ${event.title} - ${event.date} ${event.time || ''}\n`
        })
        resultText += '\n'
      }

      if (detected.creative) {
        resultText += `💡 Pomysł kreatywny:\n${detected.creative}\n`
      }

      if (!detected.tasks?.length && !detected.events?.length && !detected.creative) {
        resultText = `📝 Zapisano jako notatka:\n\n${text}`
      }

      setMessages((prev) => [...prev, { from: 'bot', text: resultText }])

      // Dodaj zadania do listy (jeśli są)
      if (detected.tasks && detected.tasks.length > 0) {
        detected.tasks.forEach(task => onAdd(task.text))
      }

    } catch (error) {
      console.error('Błąd wykrywania struktury:', error)
      setMessages((prev) => {
        const updated = [...prev]
        updated.pop()
        return [...updated, { from: 'bot', text: '❌ Błąd przetwarzania: ' + error.message }]
      })
    } finally {
      setIsLoading(false)
    }
  }

  const exportToApp = async (appType) => {
    if (!lastResult) return

    let exportText = ''
    let title = 'Peria - Notatka'

    if (appType === 'reminders' && lastResult.detected?.tasks?.length > 0) {
      title = 'Peria - Zadania'
      exportText = lastResult.detected.tasks.map(task => `• ${task.text}`).join('\n')
    } else if (appType === 'notes') {
      exportText = lastResult.sourceText
      if (lastResult.detected?.tasks?.length > 0) {
        exportText += '\n\n--- Zadania ---\n'
        exportText += lastResult.detected.tasks.map(t => `• ${t.text}`).join('\n')
      }
      if (lastResult.detected?.events?.length > 0) {
        exportText += '\n\n--- Wydarzenia ---\n'
        exportText += lastResult.detected.events.map(e => `• ${e.title} - ${e.date} ${e.time || ''}`).join('\n')
      }
    } else if (appType === 'calendar' && lastResult.detected?.events?.length > 0) {
      // TODO: Generate .ics file
      title = 'Peria - Wydarzenia'
      exportText = lastResult.detected.events.map(e => `${e.title}\n${e.date} ${e.time || ''}`).join('\n\n')
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
      alert('❌ Błąd kopiowania. Spróbuj ponownie.')
    })
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

      {/* Export bar */}
      {lastResult && lastResult.detected && (
        <div className={styles.exportBar}>
          {lastResult.detected.tasks?.length > 0 && (
            <button onClick={() => exportToApp('reminders')} className={styles.exportButton}>
              📤 Do Reminders
            </button>
          )}
          <button onClick={() => exportToApp('notes')} className={styles.exportButton}>
            📤 Do Notes
          </button>
          {lastResult.detected.events?.length > 0 && (
            <button onClick={() => exportToApp('calendar')} className={styles.exportButton}>
              📤 Do Kalendarza
            </button>
          )}
        </div>
      )}

      {/* Input bar - VOICE FIRST */}
      <div className={styles.chatInputBar}>
        {/* Główny przycisk: NAGRYWANIE */}
        <button
          onClick={isRecording ? stopRecording : startRecording}
          disabled={isLoading}
          className={isRecording ? styles.recordingButton : styles.micButton}
          title={isRecording ? 'Zatrzymaj nagrywanie' : 'Nagraj głosem'}
          style={{ flex: showTextInput ? '0 0 auto' : '1 1 auto' }}
        >
          {isRecording ? (
            <>⏹ {recordingTime}s</>
          ) : (
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/>
              <path d="M19 10v2a7 7 0 0 1-14 0v-2"/>
              <line x1="12" y1="19" x2="12" y2="23"/>
              <line x1="8" y1="23" x2="16" y2="23"/>
            </svg>
          )}
        </button>

        {/* Text input (opcjonalny) */}
        {showTextInput && (
          <>
            <input
              type="text"
              placeholder="Wpisz myśl..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={isLoading || isRecording}
            />
            <button
              onClick={handleTextSend}
              disabled={isLoading || !input.trim() || isRecording}
              className={styles.sendButton}
            >
              {isLoading ? '⏳' : '➤'}
            </button>
            {/* Zamknij text input */}
            <button
              onClick={() => setShowTextInput(false)}
              className={styles.closeInputButton}
              title="Zamknij"
            >
              ✕
            </button>
          </>
        )}

        {/* Toggle text input (mała ikona) */}
        {!showTextInput && !isRecording && (
          <button
            onClick={() => setShowTextInput(true)}
            className={styles.textInputToggle}
            title="Wpisz tekstem"
          >
            ✏️
          </button>
        )}

        {/* Clear chat (zawsze widoczne, małe) */}
        {messages.length > 0 && !showTextInput && (
          <button onClick={clearChat} className={styles.clearChatButton} title="Wyczyść czat">
            🗑️
          </button>
        )}
      </div>
    </div>
  )
}

ChatVoiceFirst.propTypes = {
  onAdd: PropTypes.func.isRequired,
}
