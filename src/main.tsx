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
  const cacheResetKey = "sevendevx-preview-cache-reset-v2";
  Promise.all([
    navigator.serviceWorker?.getRegistrations().then((registrations) =>
      Promise.all(registrations.map((r) => r.unregister()))
    ),
    "caches" in window ? caches.keys().then((keys) => Promise.all(keys.map((k) => caches.delete(k)))) : Promise.resolve(),
  ]).then(() => {
    if (navigator.serviceWorker?.controller && sessionStorage.getItem(cacheResetKey) !== "1") {
      sessionStorage.setItem(cacheResetKey, "1");
      window.location.reload();
    }
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
