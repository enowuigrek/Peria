import { useState } from 'react';
import styles from './Chat.module.scss';

export default function Chat({ onAdd }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');

  const handleSend = () => {
    if (!input.trim()) return;
    const newMessage = { from: 'user', text: input };
    const response = { from: 'bot', text: `dodaje: ${input}` };
    setMessages([...messages, newMessage, response]);
    onAdd(input);
    setInput('');
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') handleSend();
  };

  return (
    <div className={styles.chatWrapper}>
      <div className={styles.chatMessages}>
        {messages.map((msg, index) => (
          <div key={index} className={msg.from === 'user' ? styles.userBubble : styles.botBubble}>
            {msg.text}
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