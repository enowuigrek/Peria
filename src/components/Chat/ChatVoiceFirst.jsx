import { useState, useEffect, useRef, useCallback } from 'react'
import PropTypes from 'prop-types'
import { detectStructure } from '../../agent'
import styles from './Chat.module.scss'
import SkeletonLoader from '../shared/SkeletonLoader'

// ─── Text-to-Speech helper ────────────────────────────────────────────────────

// Aktualnie odtwarzany element audio — zatrzymujemy go przed nowym
let _currentAudio = null

// Fallback: Web Speech API gdy brak połączenia / klucza
const speakFallback = (text) => {
  if (!('speechSynthesis' in window)) return
  window.speechSynthesis.cancel()
  const tryNow = () => {
    const voices = window.speechSynthesis.getVoices()
    const pl = voices.filter((v) => v.lang.startsWith('pl'))
    const voice =
      pl.find((v) => /siri/i.test(v.name)) ||
      pl.find((v) => /premium|enhanced/i.test(v.name)) ||
      pl.find((v) => v.localService) ||
      pl[0] ||
      null
    const utt = new SpeechSynthesisUtterance(text)
    utt.lang = 'pl-PL'
    utt.volume = 0.92
    utt.rate = 0.93
    utt.pitch = 1.0
    if (voice) utt.voice = voice
    window.speechSynthesis.speak(utt)
  }
  // Daj przeglądarce chwilę na załadowanie głosów
  if (window.speechSynthesis.getVoices().length > 0) {
    tryNow()
  } else {
    window.speechSynthesis.addEventListener('voiceschanged', tryNow, { once: true })
  }
}

// Cache blob URL żeby nie generować tego samego dźwięku dwa razy
const _ttsCache = new Map()
const TTS_CACHE_MAX = 15

const speak = async (text) => {
  // Zatrzymaj poprzednie odtwarzanie natychmiast
  if (_currentAudio) {
    _currentAudio.pause()
    _currentAudio.currentTime = 0
    _currentAudio = null
  }

  const apiKey = import.meta.env.VITE_OPENAI_API_KEY
  if (!apiKey) { speakFallback(text); return }

  // Cache hit
  if (_ttsCache.has(text)) {
    const url = _ttsCache.get(text)
    const audio = new Audio(url)
    audio.volume = 0.92
    _currentAudio = audio
    audio.play().catch(() => speakFallback(text))
    return
  }

  try {
    const res = await fetch('https://api.openai.com/v1/audio/speech', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'tts-1',
        voice: 'nova',   // ciepły, naturalny głos żeński, świetnie po polsku
        input: text,
        speed: 0.95,
      }),
    })
    if (!res.ok) throw new Error(`TTS ${res.status}`)

    const blob = await res.blob()
    const url = URL.createObjectURL(blob)

    // Evict najstarszy wpis gdy cache pełny
    if (_ttsCache.size >= TTS_CACHE_MAX) {
      const oldest = _ttsCache.keys().next().value
      URL.revokeObjectURL(_ttsCache.get(oldest))
      _ttsCache.delete(oldest)
    }
    _ttsCache.set(text, url)

    // Jeśli w międzyczasie przyszło kolejne speak() — porzuć to
    if (_currentAudio !== null) return

    const audio = new Audio(url)
    audio.volume = 0.92
    _currentAudio = audio
    audio.addEventListener('ended', () => { _currentAudio = null })
    audio.play().catch(() => speakFallback(text))
  } catch (err) {
    console.warn('OpenAI TTS error, fallback:', err.message)
    speakFallback(text)
  }
}

// ─── Voice confirmation messages ─────────────────────────────────────────────
const getConfirmationText = (detected) => {
  if (detected.checklist?.isShoppingList) return 'Zapisałam listę zakupów.'
  if (detected.checklist?.items?.length > 0) return 'Zapisałam checklistę.'
  if (detected.events?.length > 0 && detected.note) return 'Zapisałam notatkę i dodałam wydarzenie do kalendarza.'
  if (detected.events?.length > 0) return 'Dodałam do kalendarza.'
  return 'Zapisałam notatkę.'
}

// ─── SVG ikony kategorii (te same co w navbar) ────────────────────────────────
const IconNote = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
    <polyline points="14 2 14 8 20 8"/>
    <line x1="16" y1="13" x2="8" y2="13"/>
    <line x1="16" y1="17" x2="8" y2="17"/>
    <line x1="10" y1="9" x2="8" y2="9"/>
  </svg>
)

const IconChecklist = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M9 11l3 3L22 4"/>
    <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/>
  </svg>
)

const IconShopping = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="9" cy="21" r="1"/>
    <circle cx="20" cy="21" r="1"/>
    <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
  </svg>
)

const IconCalendar = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
    <line x1="16" y1="2" x2="16" y2="6"/>
    <line x1="8" y1="2" x2="8" y2="6"/>
    <line x1="3" y1="10" x2="21" y2="10"/>
  </svg>
)

// ─── ResultCard – ładna karta potwierdzenia ───────────────────────────────────
function ResultCard({ detected, onNavigateToInbox }) {
  const items = []

  if (detected.note) {
    items.push({
      color: '#fdd03b',
      IconComponent: IconNote,
      label: 'Notatka',
      detail: null,
    })
  }

  if (detected.checklist?.items?.length > 0) {
    const isShopping = detected.checklist.isShoppingList
    items.push({
      color: '#5db85f', // zawsze zielony – shopping to podtyp checklisty
      IconComponent: isShopping ? IconShopping : IconChecklist,
      label: isShopping
        ? detected.checklist.listName || 'Lista zakupów'
        : detected.checklist.listName || 'Checklista',
      detail: `${detected.checklist.items.length} ${detected.checklist.items.length === 1 ? 'pozycja' : detected.checklist.items.length < 5 ? 'pozycje' : 'pozycji'}`,
    })
  }

  if (detected.events?.length > 0) {
    items.push({
      color: '#4a9396',
      IconComponent: IconCalendar,
      label: detected.events.length === 1 ? (detected.events[0].title || 'Wydarzenie') : 'Wydarzenia',
      detail: detected.events.length > 1 ? `${detected.events.length} terminy` : null,
    })
  }

  return (
    <div
      className={styles.resultCard}
      onClick={onNavigateToInbox}
      role="button"
      tabIndex={0}
      title="Przejdź do Inbox"
    >
      <div className={styles.resultTitle}>
        <span className={styles.resultCheck}>✓</span>
        <span>{detected.title || 'Zapisano'}</span>
        <span className={styles.resultInboxHint}>→ inbox</span>
      </div>
      {items.length > 0 && (
        <ul className={styles.resultList}>
          {items.map((item, i) => (
            <li key={i} className={styles.resultItem}>
              <span
                className={styles.resultDot}
                style={{ background: item.color, boxShadow: `0 0 6px ${item.color}80` }}
              />
              <span className={styles.resultIcon} style={{ color: item.color }}>
                <item.IconComponent />
              </span>
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
  onNavigateToInbox: PropTypes.func,
}

// ─── VoiceBars – wizualizator głosu ──────────────────────────────────────────
function VoiceBars({ isRecording, analyserNode }) {
  const barsRef = useRef([])
  const animFrameRef = useRef(null)
  const [heights, setHeights] = useState([0.15, 0.15, 0.15, 0.15, 0.15])

  useEffect(() => {
    if (!isRecording) {
      cancelAnimationFrame(animFrameRef.current)
      setHeights([0.08, 0.08, 0.08, 0.08, 0.08])
      return
    }

    if (analyserNode) {
      // ── Tryb realny: Web Audio API ──
      // fftSize=256 → frequencyBinCount=128, każdy bin ≈ 86Hz (przy 22kHz)
      // Głos ludzki: 80Hz – 3kHz → biny 1–35
      // Dzielimy ten zakres na 5 pasm logarytmicznie (głos ma więcej energii w dole)
      const sampleRate = 44100
      const binHz = sampleRate / (analyserNode.fftSize)
      const voiceMaxHz = 3000
      const voiceMaxBin = Math.min(Math.floor(voiceMaxHz / binHz), analyserNode.frequencyBinCount - 1)
      const voiceMinBin = Math.max(1, Math.floor(80 / binHz))

      // 5 granic pasm log-liniowo między voiceMinBin a voiceMaxBin
      const bands = []
      for (let i = 0; i < 5; i++) {
        const t0 = i / 5
        const t1 = (i + 1) / 5
        // logarytmiczny podział – więcej rozdzielczości w niskich pasmach
        const lo = Math.round(voiceMinBin * Math.pow(voiceMaxBin / voiceMinBin, t0))
        const hi = Math.round(voiceMinBin * Math.pow(voiceMaxBin / voiceMinBin, t1))
        bands.push([lo, Math.max(lo + 1, hi)])
      }

      const dataArray = new Uint8Array(analyserNode.frequencyBinCount)
      // Smoothing już ustawiony na 0.7 w startRecording

      const draw = () => {
        animFrameRef.current = requestAnimationFrame(draw)
        analyserNode.getByteFrequencyData(dataArray)

        const newHeights = bands.map(([lo, hi]) => {
          let sum = 0
          for (let j = lo; j < hi; j++) sum += dataArray[j]
          const avg = sum / (hi - lo) / 255
          // Wzmocnienie x3 bo głos wypełnia tylko część zakresu
          return Math.max(0.08, Math.min(1, avg * 3.0))
        })
        setHeights(newHeights)
      }
      draw()
    } else {
      // ── Tryb fallback: organiczna animacja sinusoidalna ──
      // Każdy słupek ma własną fazę i prędkość → niezależny ruch
      const phases = [0, 1.2, 2.4, 3.6, 4.8]
      const speeds = [0.06, 0.09, 0.07, 0.10, 0.08]
      let tick = 0

      const animate = () => {
        tick++
        setHeights(phases.map((phase, i) => {
          const s = Math.sin(tick * speeds[i] + phase)
          // Mapuj [-1,1] → [0.08, 0.85]
          return 0.08 + (s * 0.5 + 0.5) * 0.77
        }))
        animFrameRef.current = requestAnimationFrame(animate)
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
export default function ChatVoiceFirst({ onAdd, showInputMethods, onInputMethodsChange, onNavigate }) {
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
        {messages.length === 0 && (
          <div className={styles.chatEmptyWatermark}>
            zostaw swoją myśl
          </div>
        )}
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
                <ResultCard
                  detected={msg.data}
                  onNavigateToInbox={() => onNavigate?.('inbox')}
                />
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
  onNavigate: PropTypes.func,
}
