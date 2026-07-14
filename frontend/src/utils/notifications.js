import { initializeApp } from 'firebase/app';
import { getMessaging, getToken, onMessage } from 'firebase/messaging';
import { notificationsAPI } from '../api';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || '',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || '',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || '',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '',
  appId: import.meta.env.VITE_FIREBASE_APP_ID || '',
};

let messaging = null;

export function initFirebase() {
  try {
    if (!firebaseConfig.apiKey) return false;
    const app = initializeApp(firebaseConfig);
    messaging = getMessaging(app);
    return true;
  } catch {
    return false;
  }
}

export async function requestNotificationPermission() {
  if (!('Notification' in window)) return false;
  const permission = await Notification.requestPermission();
  return permission === 'granted';
}

export async function registerDevice() {
  if (!messaging) return false;
  try {
    const token = await getToken(messaging, {
      vapidKey: import.meta.env.VITE_FIREBASE_VAPID_KEY || '',
    });
    if (token) {
      await notificationsAPI.registerDevice(token);
      return true;
    }
    return false;
  } catch {
    return false;
  }
}

export function onMessageListener(callback) {
  if (!messaging) return () => {};
  return onMessage(messaging, (payload) => {
    callback(payload);
  });
}

export function showLocalNotification(title, body, url) {
  if (Notification.permission !== 'granted') return;
  new Notification(title, {
    body,
    icon: '/logo192.png',
    tag: 'khmermarket-notification',
  });
}
