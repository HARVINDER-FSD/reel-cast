import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';
import App from './App.jsx';
import useAuthStore from './store/authStore.js';
import 'bootstrap/dist/css/bootstrap.min.css';
import './styles/globals.css';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 1000 * 60 * 5,
      refetchOnWindowFocus: false,
    },
    mutations: { retry: 0 },
  },
});

// Listen for forced logout events (token refresh failure)
window.addEventListener('auth:logout', () => {
  useAuthStore.getState().clearAuth();
});

// Hydrate session on load (verify stored token is still valid)
useAuthStore.getState().hydrate();

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <QueryClientProvider client={queryClient}>
        <App />
        <Toaster
          position="bottom-right"
          toastOptions={{
            duration: 3000,
            style: {
              fontFamily: 'Inter, sans-serif',
              fontSize: '0.85rem',
              borderRadius: '10px',
              background: '#1A1A2E',
              color: '#fff',
            },
            success: { iconTheme: { primary: '#00C896', secondary: '#fff' } },
            error:   { iconTheme: { primary: '#FF4757', secondary: '#fff' } },
          }}
        />
      </QueryClientProvider>
    </BrowserRouter>
  </React.StrictMode>
);
