import { useState } from 'react';
import styles from './Chat.module.scss';

export default function Chat({ onAdd }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');

  const handleSend = () => {
    if (!input.trim()) return;
    const newMessage = { from: 'user', text: input };
    const thinkingMessage = { from: 'bot', text: '...' };
    setMessages((prev) => [...prev, newMessage, thinkingMessage]);

    setTimeout(() => {
      const response = { from: 'bot', text: `dodaje: ${input}` };
      setMessages((prev) => {
        const updated = [...prev];
        updated.pop(); // remove '...'
        return [...updated, response];
      });
      onAdd(input);
    }, 1000);
    setInput('');
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') handleSend();
  };

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
            ) : msg.text}
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
        />
        <button onClick={handleSend}>Wyślij</button>
      </div>
    </div>
  );
}