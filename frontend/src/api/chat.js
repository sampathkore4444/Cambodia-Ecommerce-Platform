import client from './client';

export const chatAPI = {
  getChatRooms: () => client.get('/chat/rooms'),
  getMessages: (roomId, params) => client.get(`/chat/rooms/${roomId}/messages`, { params }),
  sendMessage: (roomId, data) => client.post(`/chat/rooms/${roomId}/messages`, data),
};
