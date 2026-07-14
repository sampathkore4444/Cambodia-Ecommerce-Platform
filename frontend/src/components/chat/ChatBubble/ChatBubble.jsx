import React from 'react';
import styles from './ChatBubble.module.css';

export default function ChatBubble({ message }) {
  const isSent = message.sender === 'me';

  return (
    <div className={`${styles.bubble} ${isSent ? styles.sent : styles.received}`}>
      <div className={styles.content}>
        <p className={styles.text}>{message.text}</p>
        <span className={styles.time}>{message.time}</span>
      </div>
    </div>
  );
}
