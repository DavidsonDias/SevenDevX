/**
 * 🚀 SevenDevX Service Worker – PWA Híbrido v3.1.1 (Enterprise Edition)
 * =====================================================================
 * 
 * @file Service Worker principal com estratégias de cache otimizadas
 * @version 3.1.1
 * @author SevenDevX Team
 * @license MIT
 * 
 * @description
 * Service Worker enterprise-grade com suporte completo a:
 * - Cache estratégico por tipo de recurso (HTML, CSS, JS, images, fonts)
 * - Trimming automático para evitar quota exceeded errors
 * - Opaque responses (CORS, CDNs externos como Google Fonts)
 * - Range requests (vídeos/áudio com <video> e <audio> tags)
 * - Fallbacks offline (HTML + imagem)
 * - Update instantâneo via SKIP_WAITING
 * 
 * @requires ES2020+
 * @requires Cache API
 * @requires Fetch API
 * 
 * Estratégias implementadas:
 * - Network First (navegação HTML, timeout 3s)
 * - Cache First (CSS, JS, fonts, images)
 * - Stale While Revalidate (APIs Supabase)
 * =====================================================================
 */

/* =========================================================================
   📦 CONFIGURAÇÃO DE CACHES
   ======================================================================= */

/**
 * Versão atual do cache (incrementar em cada deploy)
 * @type {string}
 * @constant
 */
const CACHE_VERSION = 'sevendevx-v3.1.1';

/**
 * Nomes dos caches segmentados por tipo de recurso
 * @type {Object.<string, string>}
 */
const STATIC_CACHE = `${CACHE_VERSION}-static`;
const HTML_CACHE = `${CACHE_VERSION}-html`;
const IMAGE_CACHE = `${CACHE_VERSION}-images`;
const FONT_CACHE = `${CACHE_VERSION}-fonts`;
const OFFLINE_CACHE = `${CACHE_VERSION}-offline`;

/**
 * Assets críticos para pré-cache (instalação do SW)
 * @type {Array<string>}
 * @description Inclua aqui assets com hash gerados pelo Vite build
 */
const ASSETS_TO_CACHE = [
  '/',
  '/index.html',
  '/manifest.json',
  // Ícones padrão (192px e 512px são obrigatórios para PWA)
  '/icons/icon-72x72.png',
  '/icons/icon-96x96.png',
  '/icons/icon-128x128.png',
  '/icons/icon-144x144.png',
  '/icons/icon-152x152.png',
  '/icons/icon-192x192.png',
  '/icons/icon-384x384.png',
  '/icons/icon-512x512.png',
  // Ícones maskable (Android adaptive icons)
  '/icons/icon-maskable-192x192.png',
  '/icons/icon-maskable-512x512.png',
  // Fallback offline
  '/offline.html',
];

/**
 * Páginas e recursos de fallback quando offline
 * @type {Object.<string, string>}
 */
const FALLBACK_HTML = '/offline.html';
const FALLBACK_IMAGE = '/icons/icon-512x512.png';

/**
 * Timeout para estratégia Network-First (em milissegundos)
 * @type {number}
 * @default 3000
 * @description Após 3s sem resposta da rede, retorna versão cacheada
 */
const NETWORK_TIMEOUT = 3000;

/**
 * Limites máximos de entradas por cache
 * @type {Object.<string, number>}
 * @description Previne quota exceeded errors em dispositivos móveis
 * 
 * Ajuste conforme seu projeto:
 * - IMAGE_CACHE: ~30-40 imagens para site institucional
 * - STATIC_CACHE: chunks JS/CSS do Vite build
 * - FONT_CACHE: Inter, Poppins, etc.
 * - HTML_CACHE: páginas visitadas pelo usuário
 */
const CACHE_LIMITS = {
  [IMAGE_CACHE]: 80,    // Imagens (webp, png, jpg, svg)
  [STATIC_CACHE]: 60,   // JS, CSS com hash
  [FONT_CACHE]: 20,     // Fontes web (woff2, ttf)
  [HTML_CACHE]: 30,     // Páginas HTML navegadas
};

/* =========================================================================
   🛠️ UTILITY FUNCTIONS
   ======================================================================= */

/**
 * Remove entradas antigas do cache quando excede o limite
 * @async
 * @param {string} cacheName - Nome do cache a ser trimado
 * @param {number} maxItems - Número máximo de entradas permitidas
 * @returns {Promise<void>}
 * 
 * @description
 * Implementa FIFO (First In, First Out): remove as entradas mais antigas
 * primeiro. Essencial para prevenir QuotaExceededError em iOS Safari.
 * 
 * @example
 * await trimCache('sevendevx-v3.1.1-images', 80);
 */
async function trimCache(cacheName, maxItems) {
  if (!maxItems) return;
  
  const cache = await caches.open(cacheName);
  const keys = await cache.keys();
  
  if (keys.length <= maxItems) return;
  
  const removeCount = keys.length - maxItems;
  console.log(`🗑️ Trimming ${removeCount} entries from ${cacheName}`);
  
  for (let i = 0; i < removeCount; i++) {
    await cache.delete(keys[i]);
  }
}

/**
 * Cacheia resposta de forma segura com validação
 * @async
 * @param {string} cacheName - Nome do cache de destino
 * @param {Request} request - Request a ser cacheada
 * @param {Response} response - Response a ser armazenada
 * @returns {Promise<void>}
 * 
 * @description
 * Valida response antes de cachear:
 * - response.ok = true (status 200-299)
 * - response.type = 'opaque' (recursos CORS no-cors)
 * 
 * Opaque responses são críticos para CDNs externos como Google Fonts.
 * 
 * @throws {Error} Se cache.put() falhar (não interrompe execução)
 * 
 * @example
 * await safeCachePut('static-cache', request, response);
 */
async function safeCachePut(cacheName, request, response) {
  // Só cacheia responses válidas ou opaque (CORS)
  if (!response || (!response.ok && response.type !== 'opaque')) return;
  
  try {
    const cache = await caches.open(cacheName);
    await cache.put(request, response.clone());
    await trimCache(cacheName, CACHE_LIMITS[cacheName]);
  } catch (err) {
    // Falha no cache não deve quebrar a resposta ao usuário
    console.warn('[SW] safeCachePut failed:', err.message);
  }
}

/**
 * Cacheia em background sem bloquear resposta
 * @param {Request} req - Request a ser cacheada
 * @param {string} cacheName - Nome do cache de destino
 * @param {Response} res - Response a ser armazenada
 * @returns {void}
 * 
 * @description
 * Fire-and-forget: inicia cache em background sem await.
 * Usado em Network-First para não atrasar resposta ao usuário.
 * 
 * @example
 * eventualCachePut(request, 'html-cache', response);
 */
function eventualCachePut(req, cacheName, res) {
  caches.open(cacheName).then(cache => {
    try {
      cache.put(req, res.clone())
        .then(() => trimCache(cacheName, CACHE_LIMITS[cacheName]))
        .catch(() => {}); // swallow errors silently
    } catch (e) {
      // ignore
    }
  });
}

/* =========================================================================
   🎯 CACHE STRATEGIES
   ======================================================================= */

/**
 * Network First com timeout e fallback offline
 * @async
 * @param {Request} req - Request HTTP
 * @param {string} cacheName - Cache para armazenar response
 * @param {string} fallbackUrl - URL de fallback se offline
 * @returns {Promise<Response>}
 * 
 * @description
 * Prioriza rede, mas retorna cache se:
 * - Network demora mais que NETWORK_TIMEOUT
 * - Network falha (offline)
 * 
 * Ideal para: Navegação HTML (conteúdo dinâmico)
 * 
 * @example
 * event.respondWith(networkFirstWithTimeout(req, HTML_CACHE, '/offline.html'));
 */
async function networkFirstWithTimeout(req, cacheName, fallbackUrl) {
  try {
    const networkPromise = fetch(req).then(res => {
      if (res && (res.ok || res.type === 'opaque')) {
        eventualCachePut(req, cacheName, res);
      }
      return res;
    });

    const timeoutPromise = new Promise(async (resolve) => {
      setTimeout(async () => {
        const cached = await caches.match(req);
        resolve(cached || caches.match(fallbackUrl));
      }, NETWORK_TIMEOUT);
    });

    const winner = await Promise.race([networkPromise, timeoutPromise]);
    return winner || (await caches.match(fallbackUrl));
  } catch (err) {
    const cached = await caches.match(req);
    return cached || (await caches.match(fallbackUrl));
  }
}

/**
 * Network First sem timeout
 * @async
 * @param {Request} req - Request HTTP
 * @param {string} cacheName - Cache para armazenar response
 * @returns {Promise<Response>}
 * 
 * @description
 * Sempre tenta rede primeiro, cacheia resultado.
 * Se offline, retorna versão cacheada ou 503.
 * 
 * Ideal para: APIs, recursos dinâmicos sem timeout crítico
 * 
 * @example
 * event.respondWith(networkFirst(req, STATIC_CACHE));
 */
async function networkFirst(req, cacheName) {
  try {
    const res = await fetch(req);
    if (res && (res.ok || res.type === 'opaque')) {
      eventualCachePut(req, cacheName, res);
    }
    return res;
  } catch (err) {
    const cached = await caches.match(req);
    return cached || new Response('Offline', { 
      status: 503, 
      statusText: 'Service Unavailable' 
    });
  }
}

/**
 * Cache First (para assets com hash no nome)
 * @async
 * @param {Request} req - Request HTTP
 * @param {string} cacheName - Cache para buscar/armazenar
 * @returns {Promise<Response>}
 * 
 * @description
 * Retorna cache imediatamente se existir.
 * Só busca rede se não tiver em cache.
 * 
 * Ideal para: JS/CSS/fonts com hash (nunca mudam na mesma URL)
 * 
 * @example
 * event.respondWith(cacheFirst(req, FONT_CACHE));
 */
async function cacheFirst(req, cacheName) {
  const cached = await caches.match(req);
  if (cached) return cached;

  try {
    const res = await fetch(req);
    if (res && (res.ok || res.type === 'opaque')) {
      await safeCachePut(cacheName, req, res);
    }
    return res;
  } catch (err) {
    return new Response('Recurso indisponível', { status: 503 });
  }
}

/**
 * Cache First com fallback de imagem
 * @async
 * @param {Request} req - Request HTTP
 * @param {string} cacheName - Cache para buscar/armazenar
 * @param {string} fallbackUrl - URL da imagem de fallback
 * @returns {Promise<Response>}
 * 
 * @description
 * Igual a Cache First, mas retorna imagem placeholder se falhar.
 * 
 * Ideal para: Imagens (melhor UX que erro 503)
 * 
 * @example
 * event.respondWith(cacheFirstWithFallback(req, IMAGE_CACHE, '/logo.png'));
 */
async function cacheFirstWithFallback(req, cacheName, fallbackUrl) {
  const cached = await caches.match(req);
  if (cached) return cached;

  try {
    const res = await fetch(req);
    if (res && (res.ok || res.type === 'opaque')) {
      await safeCachePut(cacheName, req, res);
    }
    return res;
  } catch (err) {
    return caches.match(fallbackUrl);
  }
}

/**
 * Stale While Revalidate
 * @async
 * @param {Request} req - Request HTTP
 * @param {string} cacheName - Cache para buscar/atualizar
 * @returns {Promise<Response>}
 * 
 * @description
 * Retorna cache imediatamente (se existir) e atualiza em background.
 * Se não tiver cache, aguarda rede.
 * 
 * Ideal para: APIs onde dados levemente desatualizados são aceitáveis
 * 
 * @example
 * event.respondWith(staleWhileRevalidate(req, STATIC_CACHE));
 */
async function staleWhileRevalidate(req, cacheName) {
  const cached = await caches.match(req);
  
  const networkFetch = fetch(req)
    .then(async res => {
      if (res && (res.ok || res.type === 'opaque')) {
        await safeCachePut(cacheName, req, res);
      }
      return res;
    })
    .catch(() => cached);

  return cached || networkFetch;
}

/**
 * Handler para Range Requests (vídeos/áudio)
 * @async
 * @param {Request} req - Request HTTP com header Range
 * @returns {Promise<Response>}
 * 
 * @description
 * Suporte básico a partial content requests (status 206).
 * Necessário para <video> e <audio> tags que fazem seeks.
 * 
 * Implementação atual: passa request para servidor.
 * Melhoria futura: cachear ranges localmente.
 * 
 * @see {@link https://web.dev/articles/sw-range-requests|Range Requests Guide}
 * 
 * @example
 * if (req.headers.has('range')) {
 *   event.respondWith(handleRangeRequest(req));
 * }
 */
async function handleRangeRequest(req) {
  try {
    const res = await fetch(req);
    // Status 206 = Partial Content (range request bem-sucedido)
    if (res && (res.status === 206 || res.status === 200)) return res;
    
    // 416 = Range Not Satisfiable
    return new Response('Range not supported', { status: 416 });
  } catch (err) {
    return new Response('Range service unavailable', { status: 502 });
  }
}

/* =========================================================================
   📥 INSTALL EVENT — Pré-cache de assets críticos
   ======================================================================= */

/**
 * Evento de instalação do Service Worker
 * @event install
 * @listens ServiceWorkerGlobalScope#install
 * 
 * @description
 * Faz pré-cache de assets essenciais (shell app):
 * - index.html, manifest.json
 * - Ícones PWA (192px, 512px, maskable)
 * - Página offline de fallback
 * 
 * Usa Promise.allSettled para não falhar se alguns assets não existirem.
 * skipWaiting() força atualização imediata do SW.
 */
self.addEventListener('install', (event) => {
  console.log('[SW] Installing v' + CACHE_VERSION);
  
  event.waitUntil(
    (async () => {
      const results = await Promise.allSettled([
        caches.open(STATIC_CACHE).then(cache => cache.addAll(ASSETS_TO_CACHE)),
        caches.open(OFFLINE_CACHE).then(cache => cache.addAll([FALLBACK_HTML, FALLBACK_IMAGE])),
      ]);
      
      // Log de falhas sem interromper instalação
      results.forEach((r, i) => {
        if (r.status === 'rejected') {
          console.warn(`[SW] Install asset group ${i} failed:`, r.reason);
        }
      });
      
      self.skipWaiting();
    })()
  );
});

/* =========================================================================
   🔄 ACTIVATE EVENT — Limpeza de caches antigos
   ======================================================================= */

/**
 * Evento de ativação do Service Worker
 * @event activate
 * @listens ServiceWorkerGlobalScope#activate
 * 
 * @description
 * Executado após instalação bem-sucedida.
 * Remove caches de versões antigas (ex: sevendevx-v3.0-*).
 * clients.claim() assume controle de páginas abertas imediatamente.
 */
self.addEventListener('activate', (event) => {
  console.log('[SW] Activating v' + CACHE_VERSION);
  
  event.waitUntil(
    (async () => {
      const keys = await caches.keys();
      
      // Remove caches antigos do SevenDevX
      await Promise.all(
        keys
          .filter(k => k.startsWith('sevendevx-') && !k.startsWith(CACHE_VERSION))
          .map(k => {
            console.log('[SW] 🗑️ Deleting old cache:', k);
            return caches.delete(k);
          })
      );
      
      // Assume controle de todas as páginas abertas
      await self.clients.claim();
      console.log('[SW] ✅ Activated and claimed clients');
    })()
  );
});

/* =========================================================================
   🌐 FETCH EVENT — Roteamento de requests
   ======================================================================= */

/**
 * Evento de interceptação de requests
 * @event fetch
 * @listens ServiceWorkerGlobalScope#fetch
 * @param {FetchEvent} event - Evento de fetch com request
 * 
 * @description
 * Roteia cada request para a estratégia de cache apropriada:
 * 
 * 1. Range requests → handleRangeRequest (vídeos/áudio)
 * 2. HTML/navegação → Network First com timeout
 * 3. Fontes → Cache First
 * 4. Imagens → Cache First com fallback
 * 5. JS/CSS → Cache First
 * 6. APIs Supabase → Stale While Revalidate
 * 7. Outros → Network First
 * 
 * Ignora:
 * - Métodos não-GET (POST, PUT, DELETE)
 * - chrome-extension:// URLs
 */
self.addEventListener('fetch', (event) => {
  const req = event.request;
  const url = new URL(req.url);

  // Ignora non-GET e extensões
  if (req.method !== 'GET' || url.protocol === 'chrome-extension:') return;

  // Range requests (vídeos/áudio com seeks)
  if (req.headers.has('range')) {
    event.respondWith(handleRangeRequest(req));
    return;
  }

  // 1) HTML — Network First com timeout 3s
  if (req.mode === 'navigate' || req.destination === 'document') {
    event.respondWith(networkFirstWithTimeout(req, HTML_CACHE, FALLBACK_HTML));
    return;
  }

  // 2) FONTES — Cache First (nunca mudam por URL)
  if (req.destination === 'font' || /\.(woff2?|ttf|eot|otf)$/i.test(url.pathname)) {
    event.respondWith(cacheFirst(req, FONT_CACHE));
    return;
  }

  // 3) IMAGENS — Cache First com fallback
  if (req.destination === 'image' || /\.(png|jpg|jpeg|svg|webp|gif|ico)$/i.test(url.pathname)) {
    event.respondWith(cacheFirstWithFallback(req, IMAGE_CACHE, FALLBACK_IMAGE));
    return;
  }

  // 4) CSS / JS — Cache First (hash no nome garante atualização)
  if (req.destination === 'script' || req.destination === 'style' || 
      /\.(js|css)$/i.test(url.pathname)) {
    event.respondWith(cacheFirst(req, STATIC_CACHE));
    return;
  }

  // 5) APIs Supabase — Stale While Revalidate
  if (url.hostname.includes('supabase.co')) {
    event.respondWith(staleWhileRevalidate(req, STATIC_CACHE));
    return;
  }

  // 6) Fallback geral → Network First sem timeout
  event.respondWith(networkFirst(req, STATIC_CACHE));
});

/* =========================================================================
   💬 MESSAGE EVENT — Comunicação com página
   ======================================================================= */

/**
 * Evento de mensagens da página para o SW
 * @event message
 * @listens ServiceWorkerGlobalScope#message
 * @param {ExtendableMessageEvent} event - Evento de mensagem
 * 
 * @description
 * Handlers disponíveis:
 * 
 * - SKIP_WAITING: força update imediato do SW
 * - CACHE_STATUS: retorna lista de caches ativos (debug)
 * 
 * @example
 * // No console do navegador:
 * navigator.serviceWorker.controller.postMessage({ type: 'SKIP_WAITING' });
 * 
 * // Com MessageChannel para resposta:
 * const channel = new MessageChannel();
 * channel.port1.onmessage = (e) => console.log(e.data);
 * navigator.serviceWorker.controller.postMessage(
 *   { type: 'CACHE_STATUS' }, 
 *   [channel.port2]
 * );
 */
self.addEventListener('message', (event) => {
  if (!event.data) return;

  // Force update imediato
  if (event.data.type === 'SKIP_WAITING') {
    console.log('[SW] SKIP_WAITING triggered');
    self.skipWaiting();
  }

  // Debug: lista caches ativos
  if (event.data.type === 'CACHE_STATUS') {
    caches.keys().then(names => {
      const status = {
        caches: names,
        version: CACHE_VERSION,
        limits: CACHE_LIMITS,
      };
      
      // Responde via MessagePort se fornecido
      if (event.ports && event.ports[0]) {
        event.ports[0].postMessage(status);
      } else {
        console.log('[SW] Cache Status:', status);
      }
    });
  }
});

/* =========================================================================
   📚 REFERÊNCIAS
   ======================================================================= */

/**
 * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API|Service Worker API - MDN}
 * @see {@link https://web.dev/articles/service-worker-caching-and-http-caching|Caching Strategies - web.dev}
 * @see {@link https://developer.chrome.com/docs/workbox/caching-strategies-overview|Workbox Strategies}
 * @see {@link https://w3c.github.io/ServiceWorker/|W3C Service Workers Spec}
 */