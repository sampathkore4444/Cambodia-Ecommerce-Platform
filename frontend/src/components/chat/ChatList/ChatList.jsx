import React from 'react';
import styles from './ChatList.module.css';

const mockChats = [
  { id: 1, name: 'Sokha Shop', lastMessage: 'ផលិតផលនៅមានទេ?', time: '១០:៣០', unread: 2, avatar: 'S' },
  { id: 2, name: 'Dara Store', lastMessage: 'ការដឹកជញ្ជូននឹងមកដល់ថ្ងៃស្អែក', time: '៩:១៥', unread: 0, avatar: 'D' },
  { id: 3, name: 'Chantrea Market', lastMessage: 'អរគុណសម្រាប់ការទិញ', time: 'ម្សិលមិញ', unread: 0, avatar: 'C' },
];

export default function ChatList({ activeRoom, onSelectRoom }) {
  return (
    <div className={styles.list}>
      <h3 className={styles.title}>សារ</h3>
      {mockChats.map(chat => (
        <button key={chat.id} className={`${styles.chatItem} ${activeRoom === chat.id ? styles.active : ''}`} onClick={() => onSelectRoom(chat.id)}>
          <div className={styles.avatar}>{chat.avatar}</div>
          <div className={styles.info}>
            <div className={styles.header}><span className={styles.name}>{chat.name}</span><span className={styles.time}>{chat.time}</span></div>
            <div className={styles.preview}><span className={styles.message}>{chat.lastMessage}</span>{chat.unread > 0 && <span className={styles.badge}>{chat.unread}</span>}</div>
          </div>
        </button>
      ))}
    </div>
  );
}
