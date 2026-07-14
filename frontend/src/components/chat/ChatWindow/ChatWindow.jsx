import React, { useState, useRef, useEffect } from 'react';
import { Send, Image } from 'lucide-react';
import ChatBubble from '../ChatBubble/ChatBubble';
import styles from './ChatWindow.module.css';

const mockMessages = [
  { id: 1, sender: 'other', text: 'សួស្តី! ផលិតផលនៅមានទេ?', time: '១០:២៥' },
  { id: 2, sender: 'me', text: 'សួស្តី! បាទ នៅមាន', time: '១០:២៦' },
  { id: 3, sender: 'other', text: 'តើអាចផ្ញើរបានទេ?', time: '១០:២៧' },
  { id: 4, sender: 'me', text: 'បាទ អាចផ្ញើបាន។ ដឹកជញ្ជូនឥតគិតថ្លៃ', time: '១០:២៨' },
];

export default function ChatWindow({ roomName = 'Sokha Shop' }) {
  const [messages, setMessages] = useState(mockMessages);
  const [input, setInput] = useState('');
  const bottomRef = useRef();

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  const handleSend = () => {
    if (!input.trim()) return;
    setMessages(prev => [...prev, { id: Date.now(), sender: 'me', text: input, time: 'ឥឡូវ' }]);
    setInput('');
  };

  return (
    <div className={styles.window}>
      <div className={styles.header}>
        <div className={styles.headerAvatar}>S</div>
        <div>
          <div className={styles.headerName}>{roomName}</div>
          <div className={styles.status}>Online</div>
        </div>
      </div>
      <div className={styles.messages}>
        {messages.map(msg => <ChatBubble key={msg.id} message={msg} />)}
        <div ref={bottomRef} />
      </div>
      <div className={styles.inputArea}>
        <button className={styles.attachBtn}><Image size={20} /></button>
        <input className={styles.input} value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleSend()} placeholder="វាយសារ..." />
        <button className={styles.sendBtn} onClick={handleSend} disabled={!input.trim()}><Send size={20} /></button>
      </div>
    </div>
  );
}
