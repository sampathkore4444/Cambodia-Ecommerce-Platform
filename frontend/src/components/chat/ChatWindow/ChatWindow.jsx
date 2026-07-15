import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Send, Image } from 'lucide-react';
import { chatAPI, createChatWS } from '../../../api/chat';
import { getStorageItem } from '../../../utils/helpers';
import ChatBubble from '../ChatBubble/ChatBubble';
import toast from 'react-hot-toast';
import styles from './ChatWindow.module.css';

export default function ChatWindow({ room }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(true);
  const [connected, setConnected] = useState(false);
  const wsRef = useRef(null);
  const bottomRef = useRef();
  const myUserId = useRef(null);

  const scrollToBottom = useCallback(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  useEffect(() => { scrollToBottom(); }, [messages, scrollToBottom]);

  useEffect(() => {
    if (!room?.id) return;
    setLoading(true);
    setMessages([]);

    const token = getStorageItem('token');
    const user = getStorageItem('user');
    myUserId.current = user?.id;

    chatAPI.getMessages(room.id, { page: 1, per_page: 50 })
      .then(({ data }) => {
        const items = data.data || [];
        const mapped = items.map(m => ({
          id: m.id,
          sender_id: m.sender_id,
          text: m.message,
          time: new Date(m.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        }));
        setMessages(mapped);
      })
      .catch(() => {})
      .finally(() => setLoading(false));

    if (token) {
      const ws = createChatWS(room.id, token);
      wsRef.current = ws;

      ws.onopen = () => setConnected(true);
      ws.onclose = () => setConnected(false);
      ws.onerror = () => setConnected(false);

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (data.type === 'message') {
            setMessages(prev => [...prev, {
              id: data.id,
              sender_id: data.sender_id,
              text: data.message,
              time: new Date(data.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            }]);
          }
        } catch {}
      };

      return () => {
        ws.close();
        wsRef.current = null;
      };
    }
  }, [room?.id]);

  const handleSend = () => {
    if (!input.trim() || !room?.id) return;
    const text = input;
    setInput('');

    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ message: text }));
    } else {
      chatAPI.sendMessage(room.id, { message: text })
        .then(({ data }) => {
          const m = data.data;
          setMessages(prev => [...prev, {
            id: m.id,
            sender_id: m.sender_id,
            text: m.message,
            time: new Date(m.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          }]);
        })
        .catch(() => {
          setInput(text);
          toast.error('មិនអាចផ្ញើសារបាន');
        });
    }
  };

  const otherName = room?.buyer?.display_name || room?.seller?.display_name || 'Chat';
  const initial = otherName[0] || '?';

  return (
    <div className={styles.window}>
      <div className={styles.header}>
        <div className={styles.headerAvatar}>{initial}</div>
        <div>
          <div className={styles.headerName}>{otherName}</div>
          <div className={styles.status}>{connected ? 'Online' : 'Offline'}</div>
        </div>
      </div>
      <div className={styles.messages}>
        {loading ? (
          <div className={styles.loading}>Loading messages...</div>
        ) : (
          messages.map(msg => (
            <ChatBubble
              key={msg.id}
              message={{
                sender: msg.sender_id === myUserId.current ? 'me' : 'other',
                text: msg.text,
                time: msg.time,
              }}
            />
          ))
        )}
        <div ref={bottomRef} />
      </div>
      <div className={styles.inputArea}>
        <input
          className={styles.input}
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleSend()}
          placeholder="Type a message..."
        />
        <button className={styles.sendBtn} onClick={handleSend} disabled={!input.trim()}>
          <Send size={20} />
        </button>
      </div>
    </div>
  );
}
