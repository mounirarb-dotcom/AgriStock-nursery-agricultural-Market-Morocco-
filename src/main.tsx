import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import { ErrorBoundary } from './components/ErrorBoundary';
import './index.css';

// Google Maps Platform runtime quota & error-catching logic
(window as any).gm_authFailure = () => {
  window.dispatchEvent(new CustomEvent('gmp-quota-exceeded'));
};

// Catch external script load failures (such as Google Maps blocked/offline)
if (typeof window !== 'undefined') {
  window.addEventListener('error', (event) => {
    const errorMsg = event.message || (event.error && event.error.message) || '';
    if (
      errorMsg.includes('Google Maps') ||
      errorMsg.includes('maps.googleapis.com') ||
      (event.filename && event.filename.includes('maps.googleapis.com'))
    ) {
      console.warn('[AgriStock] Google Maps external script prevented crash:', errorMsg);
      event.preventDefault();
    }
  });

  window.addEventListener('unhandledrejection', (event) => {
    const reason = event.reason?.message || String(event.reason || '');
    if (reason.includes('Google Maps') || reason.includes('maps.googleapis.com')) {
      console.warn('[AgriStock] Unhandled maps promise caught gracefully:', reason);
      event.preventDefault();
    }
  });
}

const origError = console.error;
console.error = (...args: unknown[]) => {
  origError.apply(console, args);
  const msg = args.map((a) => String(a)).join(' ');
  if (msg.includes('OverQuotaMapError') || msg.includes('QuotaExceededError')) {
    window.dispatchEvent(new CustomEvent('gmp-quota-exceeded'));
  }
};

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </StrictMode>,
);

