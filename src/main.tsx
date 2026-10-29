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

import './utils/browserStorageGuard';
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

// Let the already-rendered mobile home paint before evaluating the whole app.
// Other routes and desktop begin loading immediately. CSS remains in this
// small entry so the first-paint island never depends on application loading.
const startApplication = () => import('./mountApp').then(() => {});
const paintedMobileHome = location.pathname === '/' && window.innerWidth < 768 &&
  !!document.getElementById('public-first-paint-shell');
const applicationReady = paintedMobileHome
  ? new Promise<void>((resolve, reject) => {
      requestAnimationFrame(() => requestAnimationFrame(() => { startApplication().then(resolve, reject); }));
    })
  : startApplication();
// The PWA cache installer waits for these essential modules rather than
// competing with application startup after the earlier window.load event.
(window as Window & { sevendevxApplicationReady?: Promise<void> }).sevendevxApplicationReady = applicationReady;
