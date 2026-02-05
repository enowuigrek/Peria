import { useState, useEffect } from 'react'
import PropTypes from 'prop-types'
import { askAgent } from '../../agent'
import styles from './Chat.module.scss'

export default function Chat({ onAdd }) {
  const [messages, setMessages] = useState(() => {
    const stored = localStorage.getItem('chatMessages')
    return stored ? JSON.parse(stored) : []
  })
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)

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
          return [...updated, { from: 'bot', text: 'Nie udało się wygenerować zadań.' }]
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

  return (
    <div className={styles.chatWrapper}>
      {messages.length > 0 && (
        <button onClick={clearChat} className={styles.clearButton} title="Wyczyść historię czatu">
          🗑️ Wyczyść czat
        </button>
      )}
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
      <div className={styles.chatInputBar}>
        <input
          type="text"
          placeholder="Napisz wiadomość..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={isLoading}
        />
        <button onClick={handleSend} disabled={isLoading || !input.trim()}>
          {isLoading ? 'Wysyłam...' : 'Wyślij'}
        </button>
      </div>
    </div>
  )
}

Chat.propTypes = {
  onAdd: PropTypes.func.isRequired,
}