// src/main.tsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import './utils/browserStorageGuard';
import App from './App';
import './index.css';

// ═══════════════════════════════════════════════════════════════════
// 🛡️ PWA GUARD — Prevent SW in iframe/preview contexts
// ═══════════════════════════════════════════════════════════════════

const isInIframe = (() => {
  try {
    return window.self !== window.top;
  } catch (e) {
    return true;
  }
})();

const isPreviewHost =
  window.location.hostname.includes("id-preview--") ||
  window.location.hostname.includes("lovableproject.com") ||
  window.location.hostname.includes("lovable.app");

if (isPreviewHost || isInIframe) {
  navigator.serviceWorker?.getRegistrations().then((registrations) => {
    registrations.forEach((r) => r.unregister());
  });
}

// ═══════════════════════════════════════════════════════════════════
// 🎨 RENDER REACT APP
// ═══════════════════════════════════════════════════════════════════

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
