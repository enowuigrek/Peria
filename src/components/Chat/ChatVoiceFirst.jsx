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
  const [showTextInput, setShowTextInput] = useState(false)
  const mediaRecorderRef = useRef(null)
  const audioChunksRef = useRef([])
  const recordingIntervalRef = useRef(null)
  const messagesEndRef = useRef(null)

  useEffect(() => {
    localStorage.setItem('chatMessages', JSON.stringify(messages))
    // Auto-scroll do dołu po każdej zmianie wiadomości
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
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

      // Sprawdź dostępne formaty i wybierz najbezpieczniejszy dla Whisper API
      let mimeType = 'audio/webm;codecs=opus'
      if (!MediaRecorder.isTypeSupported(mimeType)) {
        // Fallback do innych formatów
        const types = [
          'audio/webm',
          'audio/mp4',
          'audio/mpeg',
          'audio/wav'
        ]
        mimeType = types.find(type => MediaRecorder.isTypeSupported(type)) || ''
      }

      console.log('🎙️ Using MIME type:', mimeType)

      const mediaRecorder = mimeType
        ? new MediaRecorder(stream, { mimeType })
        : new MediaRecorder(stream)

      mediaRecorderRef.current = mediaRecorder
      audioChunksRef.current = []

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data)
        }
      }

      mediaRecorder.onstop = async () => {
        // Użyj typu z MediaRecorder
        const recordedType = mediaRecorder.mimeType || 'audio/webm'
        const audioBlob = new Blob(audioChunksRef.current, { type: recordedType })

        console.log('📦 Audio blob:', {
          size: audioBlob.size,
          type: audioBlob.type
        })

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

      // Określ rozszerzenie pliku na podstawie MIME type
      const mimeToExt = {
        'audio/webm': 'webm',
        'audio/webm;codecs=opus': 'webm',
        'audio/mp4': 'm4a',
        'audio/mpeg': 'mp3',
        'audio/wav': 'wav',
        'audio/ogg': 'ogg'
      }

      const audioType = audioBlob.type.toLowerCase()
      const ext = mimeToExt[audioType] || 'webm'
      const filename = `recording.${ext}`

      console.log('📤 Sending to Whisper:', {
        filename,
        type: audioBlob.type,
        size: audioBlob.size
      })

      // Wysyłanie do Whisper API
      const formData = new FormData()
      formData.append('file', audioBlob, filename)
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

      // Zapisz rezultat z nową strukturą
      const result = {
        id: Date.now().toString(),
        title: detected.title || "Notatka",
        sourceText: text,
        detected: {
          note: detected.note || null,
          checklist: detected.checklist || [],
          events: detected.events || []
        },
        createdAt: new Date().toISOString(),
        exported: {
          notes: false,
          reminders: false,
          calendar: false
        }
      }

      // Zapisz do localStorage
      const notes = JSON.parse(localStorage.getItem('peria_inbox') || '[]')
      notes.unshift(result)
      localStorage.setItem('peria_inbox', JSON.stringify(notes))

      // Wyświetl potwierdzenie
      let resultText = `✅ "${detected.title || 'Notatka'}" zapisana\n\n`

      const parts = []
      if (detected.note) parts.push('Notatka')
      if (detected.checklist?.length > 0) parts.push(`Checklista (${detected.checklist.length})`)
      if (detected.events?.length > 0) parts.push(`Wydarzenia (${detected.events.length})`)

      if (parts.length > 0) {
        resultText += `Zawiera: ${parts.join(', ')}\n`
      }

      resultText += `\n📥 Zobacz w Inbox`

      setMessages((prev) => [...prev, { from: 'bot', text: resultText }])

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


  return (
    <div className={styles.chatWrapper}>
      {/* Header z przyciskiem czyszczenia */}
      <div className={styles.chatHeader}>
        <button onClick={clearChat} className={styles.clearChatButton} title="Wyczyść czat">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="3 6 5 6 21 6"/>
            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
          </svg>
        </button>
      </div>

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
        <div ref={messagesEndRef} />
      </div>

      {/* Input bar - VOICE FIRST, mobile redesign */}
      <div className={styles.chatInputBar}>
        {isRecording ? (
          // Podczas nagrywania: licznik + przycisk stop
          <>
            <div className={styles.recordingIndicator}>
              <span className={styles.recordingDot}></span>
              <span className={styles.recordingTime}>{recordingTime}s</span>
            </div>
            <button
              onClick={stopRecording}
              className={styles.stopButton}
              title="Zatrzymaj nagrywanie"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <rect x="6" y="6" width="12" height="12" rx="2"/>
              </svg>
            </button>
          </>
        ) : showTextInput ? (
          // Tryb tekstowy: input z przyciskiem wewnątrz + X do zamknięcia
          <>
            <div className={styles.inputWrapper}>
              <input
                type="text"
                placeholder="Wpisz myśl..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                disabled={isLoading}
                autoFocus
              />
              <button
                onClick={handleTextSend}
                disabled={isLoading || !input.trim()}
                className={styles.sendButtonInside}
                title="Wyślij"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="22" y1="2" x2="11" y2="13"/>
                  <polygon points="22 2 15 22 11 13 2 9 22 2"/>
                </svg>
              </button>
            </div>
            <button
              onClick={() => setShowTextInput(false)}
              className={styles.closeInputButton}
              title="Zamknij"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="18" y1="6" x2="6" y2="18"/>
                <line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            </button>
          </>
        ) : (
          // Domyślny widok: przycisk pisania po lewej, nagrywania po prawej
          <>
            <button
              onClick={() => setShowTextInput(true)}
              className={styles.textInputToggle}
              title="Wpisz tekstem"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
              </svg>
            </button>
            <button
              onClick={startRecording}
              disabled={isLoading}
              className={styles.micButton}
              title="Nagraj głosem"
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/>
                <path d="M19 10v2a7 7 0 0 1-14 0v-2"/>
                <line x1="12" y1="19" x2="12" y2="23"/>
                <line x1="8" y1="23" x2="16" y2="23"/>
              </svg>
            </button>
          </>
        )}
      </div>
    </div>
  )
}

ChatVoiceFirst.propTypes = {
  onAdd: PropTypes.func.isRequired,
}
