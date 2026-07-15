import React, { useState, useRef, useEffect, useCallback } from 'react';
import { chatbotAPI } from '../../api/chatbot';
import styles from './ChatbotWidget.module.css';

const WELCOME_MSG = {
  role: 'assistant',
  content:
    'Welcome to KhmerMarket! I can help you with orders, products, payments, shipping, and more. How can I assist you today?',
};

const SendIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="22" y1="2" x2="11" y2="13" />
    <polygon points="22 2 15 22 11 13 2 9 22 2" />
  </svg>
);

const CloseIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="20" height="20">
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);

const BotIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="28" height="28">
    <path d="M12 2a4 4 0 0 1 4 4v2a4 4 0 0 1-8 0V6a4 4 0 0 1 4-4z" />
    <rect x="3" y="10" width="18" height="10" rx="3" />
    <circle cx="9" cy="16" r="1" fill="currentColor" />
    <circle cx="15" cy="16" r="1" fill="currentColor" />
  </svg>
);

export default function ChatbotWidget() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([WELCOME_MSG]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading, scrollToBottom]);

  useEffect(() => {
    if (open) inputRef.current?.focus();
  }, [open]);

  const send = async () => {
    const text = input.trim();
    if (!text || loading) return;

    const userMsg = { role: 'user', content: text };
    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setError('');
    setLoading(true);

    const history = messages.slice(1).map((m) => ({
      role: m.role === 'assistant' ? 'assistant' : 'user',
      content: m.content,
    }));

    try {
      const { data } = await chatbotAPI.chat({ message: text, history });
      const reply = data.data?.reply || data.reply || 'No response received.';
      setMessages((prev) => [...prev, { role: 'assistant', content: reply }]);
    } catch (err) {
      setError(err.message || 'Failed to get a response. Is Ollama running?');
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      send();
    }
  };

  return (
    <div className={styles.widget}>
      {open && (
        <div className={styles.window}>
          <div className={styles.header}>
            <div className={styles.headerInfo}>
              <span className={styles.headerDot} />
              <div>
                <div className={styles.headerTitle}>KhmerMarket Support</div>
                <div className={styles.headerSub}>AI-powered assistant</div>
              </div>
            </div>
            <button className={styles.closeBtn} onClick={() => setOpen(false)} aria-label="Close chat">
              <CloseIcon />
            </button>
          </div>

          <div className={styles.messages}>
            {messages.length === 1 && (
              <div className={styles.emptyState}>
                <span className={styles.emptyIcon}><BotIcon /></span>
                <span>Ask me anything about KhmerMarket!</span>
              </div>
            )}
            {messages.map((msg, i) => (
              <div
                key={i}
                className={`${styles.bubble} ${msg.role === 'user' ? styles.user : styles.bot}`}
              >
                {msg.content}
              </div>
            ))}
            {loading && <div className={styles.typing}>Thinking...</div>}
            {error && <div className={styles.errorMsg}>{error}</div>}
            <div ref={messagesEndRef} />
          </div>

          <div className={styles.inputArea}>
            <textarea
              ref={inputRef}
              className={styles.input}
              rows={1}
              placeholder="Type your question..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={loading}
            />
            <button className={styles.sendBtn} onClick={send} disabled={loading || !input.trim()} aria-label="Send message">
              <SendIcon />
            </button>
          </div>
        </div>
      )}

      <button className={styles.toggleBtn} onClick={() => setOpen((o) => !o)} aria-label="Toggle chat">
        {open ? <CloseIcon /> : <BotIcon />}
      </button>
    </div>
  );
}
