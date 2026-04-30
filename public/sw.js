/**
 * 🧹 SevenDevX Service Worker — KILL SWITCH (v999)
 * =====================================================================
 * Este Service Worker antigo foi substituído pelo SW gerado pelo Vite PWA.
 * Sua única função agora é se autodestruir e limpar todos os caches
 * antigos para que dispositivos que registraram o SW v3.x antes voltem
 * a carregar a versão atualizada do site (sem servir HTML obsoleto).
 *
 * Por que isso é necessário?
 * - Versões anteriores deste arquivo aplicavam Network First com fallback
 *   para HTML em cache. Quando o build mudou (novos hashes em /assets),
 *   o HTML em cache passou a referenciar bundles inexistentes,
 *   resultando em erros de runtime e na tela "Algo deu errado" em
 *   navegadores móveis (iOS Safari/Chrome, Firefox Android).
 * =====================================================================
 */

self.addEventListener('install', (event) => {
  // Ativa imediatamente sem esperar
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    (async () => {
      try {
        // 1. Limpa TODOS os caches antigos
        const keys = await caches.keys();
        await Promise.all(keys.map((key) => caches.delete(key)));

        // 2. Assume controle de todas as abas abertas
        await self.clients.claim();

        // 3. Desregistra a si mesmo
        await self.registration.unregister();

        // 4. Recarrega todas as abas controladas para baixar a versão nova
        const clientList = await self.clients.matchAll({ type: 'window' });
        clientList.forEach((client) => {
          try {
            client.navigate(client.url);
          } catch (_) {
            // Alguns browsers não permitem navigate; ignora silenciosamente
          }
        });
      } catch (err) {
        // Falha silenciosa: mesmo que algo dê errado, o SW será sobrescrito
        // pela próxima visita.
      }
    })()
  );
});

// Bypass total: nunca intercepta requests
self.addEventListener('fetch', () => {
  // noop — deixa o browser tratar normalmente
});
