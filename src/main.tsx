/**
 * 🚀 main.tsx — SevenDevX Enterprise Platform
 * ═══════════════════════════════════════════════════════════════════════
 *
 * @file main.tsx
 * @module App/Bootstrap
 *
 * @description
 * Ponto de entrada da aplicação. Instala a guarda de storage do browser,
 * neutraliza o Service Worker em contextos de preview/iframe e monta a
 * árvore React.
 *
 * @responsibilities
 *   - Importar a guarda de storage antes de qualquer código de app
 *   - Desregistrar Service Workers em iframe e hosts de preview
 *   - Renderizar <App /> em StrictMode
 *
 * @security
 *   Nenhuma credencial é manipulada aqui.
 *
 * @performance
 *   Manter este arquivo mínimo: tudo que roda antes do primeiro render
 *   atrasa o LCP.
 *
 * @see src/utils/browserStorageGuard.ts · docs/architecture/PWA_ARCHITECTURE.md
 * ═══════════════════════════════════════════════════════════════════════
 */

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
