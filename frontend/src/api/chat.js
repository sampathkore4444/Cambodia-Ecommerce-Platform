import client from './client';

export const chatAPI = {
  getChatRooms: () => client.get('/chat/rooms'),
  getMessages: (roomId, params) => client.get(`/chat/rooms/${roomId}/messages`, { params }),
  sendMessage: (roomId, data) => client.post(`/chat/rooms/${roomId}/messages`, data),
  createRoom: (data) => client.post('/chat/rooms', data),
  markAsRead: (roomId) => client.put(`/chat/rooms/${roomId}/read`),
  getUnreadCount: () => client.get('/chat/unread'),
};

export function createChatWS(roomId, token) {
  const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
  const host = window.location.host;
  const ws = new WebSocket(`${protocol}//${host}/ws/chat/${roomId}?token=${token}`);
  return ws;
}
