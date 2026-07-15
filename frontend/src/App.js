import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from 'react-query';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { LanguageProvider } from './context/LanguageContext';
import Toast from './components/common/Toast/Toast';
import ErrorBoundary from './components/common/ErrorBoundary/ErrorBoundary';
import MainLayout from './components/layout/MainLayout/MainLayout';
import ChatbotWidget from './components/chatbot/ChatbotWidget';
import AppRoutes from './routes';
import './styles/globals.css';
import './styles/responsive.css';

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: 1, refetchOnWindowFocus: false } }
});

export default function App() {
  return (
    <BrowserRouter>
      <QueryClientProvider client={queryClient}>
        <LanguageProvider>
          <AuthProvider>
            <CartProvider>
              <MainLayout>
                <ErrorBoundary>
                  <AppRoutes />
                </ErrorBoundary>
              </MainLayout>
              <Toast />
              <ChatbotWidget />
            </CartProvider>
          </AuthProvider>
        </LanguageProvider>
      </QueryClientProvider>
    </BrowserRouter>
  );
}
