import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { Toaster } from 'sonner';
import { BrandProvider } from './components/ui/BrandProvider';
import { AuthProvider } from './context/AuthContext';
import './styles/global.css';

const rootElement = document.getElementById('root');

if (!rootElement) {
  throw new Error('Root element not found');
}

ReactDOM.createRoot(rootElement).render(
  <React.StrictMode>
    <BrandProvider>
      <AuthProvider>
        <>
          <App />
          <Toaster position="top-center" richColors closeButton />
        </>
      </AuthProvider>
    </BrandProvider>
  </React.StrictMode>
);
