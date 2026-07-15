importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-messaging-compat.js');

let firebaseConfig = null;

// Try to load config from the generated file first
try {
  importScripts('/firebase-config.js');
  firebaseConfig = window.__FIREBASE_CONFIG__;
} catch {}

// Fallback: read from environment (build-time injected)
if (!firebaseConfig && typeof __FIREBASE_CONFIG__ !== 'undefined') {
  firebaseConfig = __FIREBASE_CONFIG__;
}

if (firebaseConfig && firebaseConfig.apiKey) {
  firebase.initializeApp(firebaseConfig);

  const messaging = firebase.messaging();

  messaging.onBackgroundMessage((payload) => {
    const notificationTitle = payload.notification?.title || 'KhmerMarket';
    const notificationOptions = {
      body: payload.notification?.body || '',
      icon: '/logo192.png',
      badge: '/logo192.png',
      data: payload.data,
      tag: payload.data?.type || 'khmermarket',
    };
    self.registration.showNotification(notificationTitle, notificationOptions);
  });
}

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const url = event.notification.data?.url || '/';
  event.waitUntil(clients.matchAll({ type: 'window' }).then(clientList => {
    for (const client of clientList) {
      if (client.url.includes(self.location.origin) && 'focus' in client) {
        client.navigate(url);
        return client.focus();
      }
    }
    return clients.openWindow(url);
  }));
});
