import React, { useEffect, useState } from 'react';
import { chatAPI } from '../../../api/chat';
import { getStorageItem } from '../../../utils/helpers';
import styles from './ChatList.module.css';

export default function ChatList({ activeRoom, onSelectRoom }) {
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = getStorageItem('token');
    if (!token) {
      setLoading(false);
      return;
    }
    chatAPI.getChatRooms()
      .then(({ data }) => setRooms(data.data || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className={styles.list}>
        <h3 className={styles.title}>Messages</h3>
        <div className={styles.loading}>Loading...</div>
      </div>
    );
  }

  if (!rooms.length) {
    return (
      <div className={styles.list}>
        <h3 className={styles.title}>Messages</h3>
        <div className={styles.empty}>No conversations yet</div>
      </div>
    );
  }

  return (
    <div className={styles.list}>
      <h3 className={styles.title}>Messages</h3>
      {rooms.map(room => {
        const other = room.buyer || room.seller || {};
        const name = other.display_name || other.full_name || 'User';
        const initial = name[0] || '?';
        const lastMsg = room.last_message || '';
        const time = room.last_message_at
          ? new Date(room.last_message_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          : '';
        const unread = room.unread_count || 0;

        return (
          <button
            key={room.id}
            className={`${styles.chatItem} ${activeRoom?.id === room.id ? styles.active : ''}`}
            onClick={() => onSelectRoom(room)}
          >
            <div className={styles.avatar}>{initial}</div>
            <div className={styles.info}>
              <div className={styles.header}>
                <span className={styles.name}>{name}</span>
                <span className={styles.time}>{time}</span>
              </div>
              <div className={styles.preview}>
                <span className={styles.message}>{lastMsg}</span>
                {unread > 0 && <span className={styles.badge}>{unread}</span>}
              </div>
            </div>
          </button>
        );
      })}
    </div>
  );
}
