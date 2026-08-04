/**
 * 🚀 registerServiceWorker.ts — SevenDevX Enterprise Platform
 * ═══════════════════════════════════════════════════════════════════════
 *
 * @file src/utils/registerServiceWorker.ts
 * @module Utils
 * @layer Infrastructure / Utils
 * @status Active
 *
 * @description
 * Registro do service worker com guarda para ambientes de preview.
 *
 * ┌─────────────────────────────────────────────────────────────────────┐
 * │ ✅ RESPONSABILIDADES PRINCIPAIS                                      │
 * └─────────────────────────────────────────────────────────────────────┘
 *
 * ✅ Exporta `registerServiceWorker`
 *
 * ┌─────────────────────────────────────────────────────────────────────┐
 * │ 🔐 SEGURANÇA                                                        │
 * └─────────────────────────────────────────────────────────────────────┘
 *
 * 🔒 Validações de frontend são de UX — a autoridade é o banco (RLS)
 *
 * ┌─────────────────────────────────────────────────────────────────────┐
 * │ 🔧 MANUTENÇÃO                                                       │
 * └─────────────────────────────────────────────────────────────────────┘
 *
 * ✅ Atualizar este cabeçalho quando a responsabilidade do arquivo mudar
 * ✅ Manter regras de negócio próximas da implementação
 * ✅ Registrar decisões arquiteturais relevantes em ADR
 *
 * ┌─────────────────────────────────────────────────────────────────────┐
 * │ 🔗 DOCUMENTAÇÃO RELACIONADA                                         │
 * └─────────────────────────────────────────────────────────────────────┘
 *
 * @see src/utils/README.md
 * @see docs/architecture/MODULE_MAP.md
 * @see docs/code-standards/CODE_ANATOMY.md
 *
 * @updated 2026-08-02
 * @license Proprietary — SevenDevX
 * ═══════════════════════════════════════════════════════════════════════
 */


// ============================================================================
// 🧠 BUSINESS LOGIC
// ============================================================================

export const registerServiceWorker = () => {
  if (!('serviceWorker' in navigator)) {
    console.warn('⚠️ SW não suportado neste navegador.');
    return;
  }

  // Block in iframes and preview hosts
  const isInIframe = (() => {
    try { return window.self !== window.top; } catch { return true; }
  })();
  const isPreviewHost =
    window.location.hostname.includes("id-preview--") ||
    window.location.hostname.includes("lovableproject.com") ||
    window.location.hostname.includes("lovable.app");

  if (isInIframe || isPreviewHost) {
    console.warn('🚫 Service Worker bloqueado — contexto de preview/iframe.');
    return;
  }

  const isLocalhost = ['localhost', '127.0.0.1'].includes(location.hostname);
  if (!import.meta.env.PROD && !isLocalhost) {
    console.warn('🚫 Service Worker bloqueado — ativado apenas em produção.');
    return;
  }

  /**
   * ⏳ 3. Delay para registrar SOMENTE depois do carregamento da página
   */
  window.addEventListener('load', () => {
    const swUrl = '/sw.js';

    /**
     * 🛡️ Fail-Safe Timeout
     * Se algo travar no registro ou update, evitamos SW zumbi.
     */
    const timeout = setTimeout(() => {
      console.warn('⚠️ Timeout ao registrar Service Worker.');
    }, 8000);

    /**
     * 🚀 4. Processo principal de registro
     */
    navigator.serviceWorker
      .register(swUrl)
      .then((registration) => {
        clearTimeout(timeout);

        console.log(
          `%c✔ Service Worker registrado com sucesso`,
          'color:#4ade80; font-weight:bold;',
          registration.scope
        );

        // ───────────────────────────────────────────────
        // 🔄 5. Detecta quando uma nova versão do SW está disponível
        // ───────────────────────────────────────────────
        registration.onupdatefound = () => {
          const newSW = registration.installing;

          console.log(
            '%c🔄 Novo Service Worker detectado…',
            'color:#38bdf8; font-weight:bold;'
          );

          newSW?.addEventListener('statechange', () => {
            if (newSW.state === 'installed') {
              // Se já existe um SW controlando a página → update disponível
              if (navigator.serviceWorker.controller) {
                console.log(
                  '%c🆕 Nova versão disponível! Atualize a página.',
                  'color:#facc15; font-weight:bold;'
                );
              } else {
                console.log(
                  '%c🎉 PWA instalado e totalmente offline-ready!',
                  'color:#22c55e; font-weight:bold;'
                );
              }
            }
          });
        };
      })

      /**
       * ❌ 6. Tratamento de erro elegante
       */
      .catch((error) => {
        clearTimeout(timeout);
        console.error(
          '%c❌ Falha ao registrar Service Worker:',
          'color:#ef4444; font-weight:bold;',
          error
        );
      });
  });
};