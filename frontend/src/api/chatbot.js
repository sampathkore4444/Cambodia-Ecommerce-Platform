import client from './client';

export const chatbotAPI = {
  chat: (data) => client.post('/chatbot/chat', data, { timeout: 60000 }),
};
