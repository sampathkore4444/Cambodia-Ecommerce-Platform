import React, { useState } from 'react';
import ChatList from '../../components/chat/ChatList/ChatList';
import ChatWindow from '../../components/chat/ChatWindow/ChatWindow';
import { useMediaQuery } from '../../hooks/useMediaQuery';
import styles from './ChatPage.module.css';

export default function ChatPage() {
  const [activeRoom, setActiveRoom] = useState(null);
  const isMobile = useMediaQuery('(max-width: 767px)');

  return (
    <div className={styles.page}>
      {(!isMobile || !activeRoom) && (
        <div className={styles.sidebar}>
          <ChatList activeRoom={activeRoom} onSelectRoom={setActiveRoom} />
        </div>
      )}
      {(!isMobile || activeRoom) && (
        <div className={styles.main}>
          {activeRoom ? <ChatWindow /> : (
            <div className={styles.placeholder}>
              <p>ជ្រើសរើសការជជែក</p>
              <p className={styles.sub}>ជ្រើសរើសការជជែកពីបញ្ជី</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
