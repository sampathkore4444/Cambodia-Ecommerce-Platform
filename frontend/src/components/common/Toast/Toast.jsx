import React from 'react';
import toast, { Toaster } from 'react-hot-toast';

export default function Toast() {
  return <Toaster position="top-center" toastOptions={{ duration: 3000, style: { fontFamily: 'var(--font-family)', fontSize: '14px', borderRadius: '8px', padding: '12px 16px' }, success: { style: { background: '#E8F5E9', color: '#2e7d32' } }, error: { style: { background: '#FFEBEE', color: '#c62828' } } }} />;
}
