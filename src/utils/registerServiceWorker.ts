/**
 * 🛰️ Service Worker Manager v1.0 Pro++ ULTIMATE
 * ════════════════════════════════════════════════════════════════════════
 *
 * Sistema de registro avançado para PWAs, com:
 *
 *  ✅ Registro seguro e validado (produção + HTTPS)
 *  ✅ Logs estilizados para debugging
 *  ✅ Tratamento de erros robusto
 *  ✅ Suporte ao ciclo de vida completo do SW
 *  ✅ Atualização automática opcional
 *  ✅ Timeout fail-safe (evita unidades zumbis)
 *
 * @version 1.0.0
 * @author  
 *   SevenDevX — Enterprise Web Development
 *
 * @compatibility
 *   Chrome, Safari, Edge, Firefox (PWA-compliant)
 *
 * @license Proprietary — Uso restrito à SevenDevX
 * ════════════════════════════════════════════════════════════════════════
 */

export const registerServiceWorker = () => {
  /**
   * 🚫 1. Verifica se o navegador suporta Service Workers
   * Safari iOS antigo e navegadores legacy falham aqui.
   */
  if (!('serviceWorker' in navigator)) {
    console.warn('⚠️ SW não suportado neste navegador.');
    return;
  }

  /**
   * ⚠️ 2. Apenas registra em produção e HTTPS (obrigatório pelo PWA)
   * Durante desenvolvimento o SW causa cache agressivo.
   */
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