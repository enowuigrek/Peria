import { useState, useEffect, useRef, useCallback } from 'react'
import PropTypes from 'prop-types'
import { detectStructure } from '../../agent'
import styles from './Chat.module.scss'
import SkeletonLoader from '../shared/SkeletonLoader'

// ─── Text-to-Speech helper ────────────────────────────────────────────────────

// Wybór najlepszego dostępnego głosu żeńskiego PL.
// Priorytet: Siri > Premium/Enhanced > localService (offline) > pierwszy PL
const pickBestPolishVoice = (voices) => {
  const pl = voices.filter((v) => v.lang.startsWith('pl'))
  if (!pl.length) return null

  const name = (v) => v.name.toLowerCase()

  // 1. Głos Siri (iOS/macOS) – najlepszy na urządzeniach Apple
  const siri = pl.find((v) => name(v).includes('siri'))
  if (siri) return siri

  // 2. Premium lub Enhanced – wysokiej jakości głosy systemowe
  const premium = pl.find(
    (v) => name(v).includes('premium') || name(v).includes('enhanced')
  )
  if (premium) return premium

  // 3. Głos offline (localService) – działa bez internetu, zwykle naturalniejszy
  const local = pl.find((v) => v.localService)
  if (local) return local

  // 4. Fallback: pierwszy dostępny głos PL
  return pl[0]
}

const speak = (text) => {
  if (!('speechSynthesis' in window)) return
  window.speechSynthesis.cancel()

  const utt = new SpeechSynthesisUtterance(text)
  utt.lang = 'pl-PL'
  utt.volume = 0.92

  const voices = window.speechSynthesis.getVoices()
  const voice = pickBestPolishVoice(voices)

  if (voice) {
    utt.voice = voice
    const n = voice.name.toLowerCase()
    // Siri i Premium mają naturalny rytm – nie wymuszaj parametrów
    if (n.includes('siri') || n.includes('premium') || n.includes('enhanced')) {
      utt.rate = 0.96
      utt.pitch = 1.0
    } else {
      // Dla syntetycznych głosów: lekko obniż pitch, zwolnij tempo
      utt.rate = 0.90
      utt.pitch = 0.92
    }
  } else {
    // Brak głosu PL – domyślny systemowy
    utt.rate = 0.90
    utt.pitch = 0.92
  }

  window.speechSynthesis.speak(utt)
}

// ─── Voice confirmation messages ─────────────────────────────────────────────
const getConfirmationText = (detected) => {
  if (detected.checklist?.isShoppingList) return 'Zapisałam listę zakupów.'
  if (detected.checklist?.items?.length > 0) return 'Zapisałam checklistę.'
  if (detected.events?.length > 0 && detected.note) return 'Zapisałam notatkę i dodałam wydarzenie do kalendarza.'
  if (detected.events?.length > 0) return 'Dodałam do kalendarza.'
  return 'Zapisałam notatkę.'
}

// ─── ResultCard – ładna karta potwierdzenia ───────────────────────────────────
function ResultCard({ detected }) {
  const items = []

  if (detected.note) {
    items.push({
      color: '#fdd03b',
      icon: '📝',
      label: 'Notatka',
      detail: null,
    })
  }

  if (detected.checklist?.items?.length > 0) {
    const isShopping = detected.checklist.isShoppingList
    items.push({
      color: isShopping ? '#f97316' : '#5db85f',
      icon: isShopping ? '🛒' : '✅',
      label: isShopping
        ? detected.checklist.listName || 'Lista zakupów'
        : detected.checklist.listName || 'Checklista',
      detail: `${detected.checklist.items.length} ${detected.checklist.items.length === 1 ? 'pozycja' : detected.checklist.items.length < 5 ? 'pozycje' : 'pozycji'}`,
    })
  }

  if (detected.events?.length > 0) {
    items.push({
      color: '#4a9396',
      icon: '📅',
      label: detected.events.length === 1 ? (detected.events[0].title || 'Wydarzenie') : 'Wydarzenia',
      detail: detected.events.length > 1 ? `${detected.events.length} terminy` : null,
    })
  }

  return (
    <div className={styles.resultCard}>
      <div className={styles.resultTitle}>
        <span className={styles.resultCheck}>✓</span>
        <span>{detected.title || 'Zapisano'}</span>
      </div>
      {items.length > 0 && (
        <ul className={styles.resultList}>
          {items.map((item, i) => (
            <li key={i} className={styles.resultItem}>
              <span
                className={styles.resultDot}
                style={{ background: item.color, boxShadow: `0 0 6px ${item.color}80` }}
              />
              <span className={styles.resultIcon}>{item.icon}</span>
              <span className={styles.resultLabel}>{item.label}</span>
              {item.detail && (
                <span className={styles.resultDetail} style={{ color: item.color }}>
                  {item.detail}
                </span>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

ResultCard.propTypes = {
  detected: PropTypes.shape({
    title: PropTypes.string,
    note: PropTypes.string,
    checklist: PropTypes.object,
    events: PropTypes.array,
  }),
}

// ─── VoiceBars – wizualizator głosu ──────────────────────────────────────────
function VoiceBars({ isRecording, analyserNode }) {
  const barsRef = useRef([])
  const animFrameRef = useRef(null)
  const [heights, setHeights] = useState([0.15, 0.15, 0.15, 0.15, 0.15])

  useEffect(() => {
    if (!isRecording) {
      cancelAnimationFrame(animFrameRef.current)
      setHeights([0.15, 0.15, 0.15, 0.15, 0.15])
      return
    }

    if (analyserNode) {
      // ── Tryb realny: Web Audio API ──
      const bufferLength = analyserNode.frequencyBinCount
      const dataArray = new Uint8Array(bufferLength)

      const draw = () => {
        animFrameRef.current = requestAnimationFrame(draw)
        analyserNode.getByteFrequencyData(dataArray)

        // Podziel pasmo na 5 zakresów
        const step = Math.floor(bufferLength / 6)
        const newHeights = [1, 2, 3, 4, 5].map((i) => {
          const start = i * step
          const end = start + step
          let sum = 0
          for (let j = start; j < end; j++) sum += dataArray[j]
          const avg = sum / step / 255
          return Math.max(0.08, Math.min(1, avg * 2.2))
        })
        setHeights(newHeights)
      }
      draw()
    } else {
      // ── Tryb fallback: losowa animacja ──
      const animate = () => {
        animFrameRef.current = requestAnimationFrame(() => {
          setHeights((prev) =>
            prev.map((h) => {
              const delta = (Math.random() - 0.5) * 0.4
              return Math.max(0.08, Math.min(1, h + delta))
            })
          )
          setTimeout(animate, 80)
        })
      }
      animate()
    }

    return () => cancelAnimationFrame(animFrameRef.current)
  }, [isRecording, analyserNode])

  const barColors = [
    '#4a9396', // teal/blue
    '#fdd03b', // yellow
    '#5db85f', // green
    '#fdd03b', // yellow
    '#4a9396', // teal/blue
  ]

  return (
    <div className={styles.voiceBars} ref={barsRef}>
      {heights.map((h, i) => (
        <div
          key={i}
          className={styles.voiceBar}
          style={{
            height: `${Math.round(h * 36)}px`,
            background: barColors[i],
            opacity: 0.85 + h * 0.15,
          }}
        />
      ))}
    </div>
  )
}

VoiceBars.propTypes = {
  isRecording: PropTypes.bool.isRequired,
  analyserNode: PropTypes.object,
}

// ─── Main component ───────────────────────────────────────────────────────────
export default function ChatVoiceFirst({ onAdd, showInputMethods, onInputMethodsChange }) {
  const [messages, setMessages] = useState(() => {
    const stored = localStorage.getItem('chatMessages')
    return stored ? JSON.parse(stored) : []
  })
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isRecording, setIsRecording] = useState(false)
  const [recordingTime, setRecordingTime] = useState(0)
  const [showTextInput, setShowTextInput] = useState(false)
  const [showImageInput, setShowImageInput] = useState(false)
  const [shakeError, setShakeError] = useState(false)  // shake efekt przy błędzie
  const [analyserNode, setAnalyserNode] = useState(null)

  const mediaRecorderRef = useRef(null)
  const audioChunksRef = useRef([])
  const recordingIntervalRef = useRef(null)
  const messagesEndRef = useRef(null)
  const fileInputRef = useRef(null)
  const audioContextRef = useRef(null)

  useEffect(() => {
    localStorage.setItem('chatMessages', JSON.stringify(messages))
    messagesEndRef.current?.scrollIntoView({ behavior: 'instant' })
  }, [messages])

  // Załaduj głosy TTS po zamontowaniu
  useEffect(() => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.getVoices()
      window.speechSynthesis.onvoiceschanged = () => window.speechSynthesis.getVoices()
    }
  }, [])

  // ── Haptic ──────────────────────────────────────────────────────────────────
  const vibrate = useCallback((pattern) => {
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      navigator.vibrate(pattern)
    }
  }, [])

  // ── Shake + double vibrate przy błędzie ────────────────────────────────────
  const triggerError = useCallback(() => {
    vibrate([60, 80, 60]) // dwa krótkie uderzenia
    setShakeError(true)
    setTimeout(() => setShakeError(false), 500)
  }, [vibrate])

  // ── Text send ───────────────────────────────────────────────────────────────
  const handleTextSend = async () => {
    if (!input.trim() || isLoading) return
    const userMessage = input.trim()
    setMessages((prev) => [...prev, { from: 'user', text: userMessage }])
    setInput('')
    setShowTextInput(false)
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
    }
  }

  // ── Recording ───────────────────────────────────────────────────────────────
  const startRecording = async () => {
    vibrate([30, 20, 60]) // zdecydowane podwójne stuknięcie na start
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })

      // ── Web Audio API – analizator głosu ──
      try {
        const audioContext = new (window.AudioContext || window.webkitAudioContext)()
        audioContextRef.current = audioContext
        const source = audioContext.createMediaStreamSource(stream)
        const analyser = audioContext.createAnalyser()
        analyser.fftSize = 256
        analyser.smoothingTimeConstant = 0.7
        source.connect(analyser)
        setAnalyserNode(analyser)
      } catch (e) {
        console.warn('Web Audio API niedostępne, fallback do animacji losowej:', e)
        setAnalyserNode(null)
      }

      // ── MediaRecorder setup ──
      let mimeType = 'audio/webm;codecs=opus'
      if (!MediaRecorder.isTypeSupported(mimeType)) {
        const types = ['audio/webm', 'audio/mp4', 'audio/mpeg', 'audio/wav']
        mimeType = types.find((type) => MediaRecorder.isTypeSupported(type)) || ''
      }

      const mediaRecorder = mimeType
        ? new MediaRecorder(stream, { mimeType })
        : new MediaRecorder(stream)

      mediaRecorderRef.current = mediaRecorder
      audioChunksRef.current = []

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) audioChunksRef.current.push(event.data)
      }

      mediaRecorder.onstop = async () => {
        const recordedType = mediaRecorder.mimeType || 'audio/webm'
        const audioBlob = new Blob(audioChunksRef.current, { type: recordedType })
        stream.getTracks().forEach((track) => track.stop())

        // Zamknij AudioContext
        if (audioContextRef.current) {
          audioContextRef.current.close()
          audioContextRef.current = null
        }
        setAnalyserNode(null)

        await processAudioBlob(audioBlob)
      }

      mediaRecorder.start()
      setIsRecording(true)
      setRecordingTime(60)

      recordingIntervalRef.current = setInterval(() => {
        setRecordingTime((prev) => {
          if (prev <= 1) {
            stopRecording()
            return 0
          }
          return prev - 1
        })
      }, 1000)
    } catch (error) {
      console.error('Błąd dostępu do mikrofonu:', error)
      triggerError()
      alert('Nie można uzyskać dostępu do mikrofonu. Sprawdź uprawnienia.')
    }
  }

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      vibrate(40)
      mediaRecorderRef.current.stop()
      setIsRecording(false)
      if (recordingIntervalRef.current) clearInterval(recordingIntervalRef.current)
    }
  }

  // ── Process audio blob ──────────────────────────────────────────────────────
  const processAudioBlob = async (audioBlob) => {
    setIsLoading(true)
    setMessages((prev) => [...prev, { from: 'bot', text: '🎤 Transkrybuję nagranie...' }])

    try {
      if (!import.meta.env.VITE_OPENAI_API_KEY) {
        throw new Error('Brak klucza API OpenAI. Ustaw VITE_OPENAI_API_KEY w pliku .env')
      }

      const mimeToExt = {
        'audio/webm': 'webm',
        'audio/webm;codecs=opus': 'webm',
        'audio/mp4': 'm4a',
        'audio/mpeg': 'mp3',
        'audio/wav': 'wav',
        'audio/ogg': 'ogg',
      }
      const ext = mimeToExt[audioBlob.type.toLowerCase()] || 'webm'
      const filename = `recording.${ext}`

      const formData = new FormData()
      formData.append('file', audioBlob, filename)
      formData.append('model', 'whisper-1')
      formData.append('language', 'pl')

      const response = await fetch('https://api.openai.com/v1/audio/transcriptions', {
        method: 'POST',
        headers: { Authorization: `Bearer ${import.meta.env.VITE_OPENAI_API_KEY}` },
        body: formData,
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error?.message || `HTTP ${response.status}`)
      }

      const data = await response.json()
      const transcription = data.text

      if (!transcription?.trim()) {
        triggerError()
        setMessages((prev) => {
          const updated = [...prev]
          updated.pop()
          return [...updated, { from: 'bot', text: '❌ Nie wykryto mowy. Spróbuj ponownie.' }]
        })
        setIsLoading(false)
        return
      }

      setMessages((prev) => {
        const updated = [...prev]
        updated.pop()
        return [...updated, { from: 'user', text: transcription }]
      })

      await processText(transcription)
    } catch (error) {
      console.error('❌ Błąd transkrypcji:', error)
      triggerError()
      setMessages((prev) => {
        const updated = [...prev]
        updated.pop()
        return [...updated, { from: 'bot', text: `❌ Błąd transkrypcji:\n${error.message}` }]
      })
      setIsLoading(false)
    }
  }

  // ── OCR / image ─────────────────────────────────────────────────────────────
  const handleImageSelect = async (event) => {
    const file = event.target.files?.[0]
    if (!file) return

    setIsLoading(true)
    setShowImageInput(false)
    setMessages((prev) => [...prev, { from: 'bot', text: '📷 Rozpoznaję tekst z obrazu...' }])

    try {
      const reader = new FileReader()
      reader.readAsDataURL(file)

      reader.onload = async () => {
        const base64Image = reader.result

        const response = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${import.meta.env.VITE_OPENAI_API_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: 'gpt-4o',
            messages: [
              {
                role: 'user',
                content: [
                  {
                    type: 'text',
                    text: 'You are an OCR system. Extract ALL text visible in this image. Include every single word, message, name, date, and any other text you see. If there are multiple messages or text bubbles, transcribe them all in order from top to bottom. Preserve line breaks and structure. Output ONLY the extracted text with no additional commentary.',
                  },
                  { type: 'image_url', image_url: { url: base64Image } },
                ],
              },
            ],
            max_tokens: 4000,
          }),
        })

        if (!response.ok) throw new Error(`HTTP ${response.status}`)

        const data = await response.json()
        const extractedText = data.choices[0].message.content

        if (!extractedText?.trim()) {
          triggerError()
          setMessages((prev) => {
            const updated = [...prev]
            updated.pop()
            return [...updated, { from: 'bot', text: '❌ Nie wykryto tekstu na obrazie.' }]
          })
          setIsLoading(false)
          return
        }

        setMessages((prev) => {
          const updated = [...prev]
          updated.pop()
          return [...updated, { from: 'user', text: extractedText }]
        })

        await processText(extractedText)
      }

      reader.onerror = () => {
        throw new Error('Błąd odczytu pliku')
      }
    } catch (error) {
      console.error('❌ Błąd OCR:', error)
      triggerError()
      setMessages((prev) => {
        const updated = [...prev]
        updated.pop()
        return [...updated, { from: 'bot', text: `❌ Błąd OCR:\n${error.message}` }]
      })
      setIsLoading(false)
    }
  }

  // ── Process text (main AI pipeline) ─────────────────────────────────────────
  const processText = async (text) => {
    setIsLoading(true)
    setMessages((prev) => [...prev, { from: 'bot', text: '__skeleton__', type: 'skeleton' }])

    try {
      const detected = await detectStructure(text)

      setMessages((prev) => prev.slice(0, -1))

      const result = {
        id: Date.now().toString(),
        title: detected.title || 'Notatka',
        sourceText: text,
        detected: {
          note: detected.note || null,
          checklist: detected.checklist || null,
          events: detected.events || [],
        },
        createdAt: new Date().toISOString(),
        exported: { mynotes: false, checklists: false, events: false },
      }

      const notes = JSON.parse(localStorage.getItem('peria_inbox') || '[]')
      notes.unshift(result)
      localStorage.setItem('peria_inbox', JSON.stringify(notes))

      // ── Potwierdzenie głosowe ──
      speak(getConfirmationText(detected))

      // ── Karta wynikowa ──
      setMessages((prev) => [...prev, { from: 'bot', type: 'result', data: detected }])
    } catch (error) {
      console.error('Błąd wykrywania struktury:', error)
      triggerError()
      setMessages((prev) => {
        const updated = [...prev]
        updated.pop()
        return [...updated, { from: 'bot', text: '❌ Błąd przetwarzania: ' + error.message }]
      })
    } finally {
      setIsLoading(false)
    }
  }

  // ─────────────────────────────────────────────────────────────────────────────
  return (
    <div className={`${styles.chatWrapper} ${isLoading ? styles.aiThinking : ''}`}>
      {/* Header */}
      <div className={styles.chatHeader}>
        <button onClick={clearChat} className={styles.clearChatButton} title="Wyczyść czat">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="3 6 5 6 21 6" />
            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
          </svg>
        </button>
      </div>

      {/* Messages */}
      <div className={styles.chatMessages}>
        {messages.map((msg, index) => {
          if (msg.type === 'skeleton') {
            return (
              <div key={index} className={styles.botBubble}>
                <SkeletonLoader />
              </div>
            )
          }
          if (msg.type === 'result') {
            return (
              <div key={index} className={styles.botBubble}>
                <ResultCard detected={msg.data} />
              </div>
            )
          }
          return (
            <div key={index} className={msg.from === 'user' ? styles.userBubble : styles.botBubble}>
              {msg.text === '...' ? (
                <span className={styles.loadingDots}>
                  <span className={styles.dot} />
                  <span className={styles.dot} />
                  <span className={styles.dot} />
                </span>
              ) : (
                msg.text
              )}
            </div>
          )
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* Input methods bar */}
      {showInputMethods && !isRecording && !showTextInput && !showImageInput && (
        <div className={styles.inputMethodsBar}>
          <button
            onClick={() => setShowTextInput(true)}
            className={styles.methodButton}
            title="Wpisz tekstem"
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
            </svg>
          </button>
          <button
            onClick={() => setShowImageInput(true)}
            className={styles.methodButton}
            title="Dodaj obraz z tekstem"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
              <circle cx="12" cy="13" r="4" />
            </svg>
          </button>
          <div className={`${styles.recordButtonWrapper} ${shakeError ? styles.shake : ''}`}>
            <button
              onClick={startRecording}
              disabled={isLoading}
              className={styles.methodButtonLarge}
              title="Nagraj głosem"
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
                <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
                <line x1="12" y1="19" x2="12" y2="23" />
                <line x1="8" y1="23" x2="16" y2="23" />
              </svg>
            </button>
            <span className={styles.pingRing} />
          </div>
        </div>
      )}

      {/* Recording / text / image input bar */}
      {(isRecording || showTextInput || showImageInput) && (
        <div className={`${styles.chatInputBar} ${shakeError ? styles.shake : ''}`}>
          {isRecording ? (
            <>
              {/* Wizualizator fal głosowych */}
              <VoiceBars isRecording={isRecording} analyserNode={analyserNode} />

              <div className={styles.recordingIndicator}>
                <span className={styles.recordingDot} />
                <span className={styles.recordingTime}>{recordingTime}s</span>
              </div>
              <button
                onClick={stopRecording}
                className={styles.stopRecordingButton}
                title="Zatrzymaj nagrywanie"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                  <rect x="6" y="6" width="12" height="12" rx="2" />
                </svg>
              </button>
            </>
          ) : showTextInput ? (
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
                    <line x1="22" y1="2" x2="11" y2="13" />
                    <polygon points="22 2 15 22 11 13 2 9 22 2" />
                  </svg>
                </button>
              </div>
              <button
                onClick={() => setShowTextInput(false)}
                className={styles.closeInputButton}
                title="Zamknij"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </>
          ) : showImageInput ? (
            <>
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={isLoading}
                className={styles.imageSelectButton}
                title="Wybierz obraz"
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
                  <circle cx="12" cy="13" r="4" />
                </svg>
                <span>Dodaj obraz z tekstem</span>
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageSelect}
                style={{ display: 'none' }}
              />
              <button
                onClick={() => setShowImageInput(false)}
                className={styles.closeInputButton}
                title="Zamknij"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </>
          ) : null}
        </div>
      )}
    </div>
  )
}

ChatVoiceFirst.propTypes = {
  onAdd: PropTypes.func.isRequired,
  showInputMethods: PropTypes.bool.isRequired,
  onInputMethodsChange: PropTypes.func.isRequired,
}
