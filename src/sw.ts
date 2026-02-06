/**
 * 🚀 SevenDevX PWA Service Worker v8.6.0 ULTRA ENTERPRISE FUSION
 * ═══════════════════════════════════════════════════════════════════
 * FIX CRÍTICO: Imagens externas não aparecem após refresh
 * 
 * ✨ DESTAQUES v8.6.0:
 * -------------------------------------------------------------------
 * 🔥 CacheFirst AGRESSIVO para imagens externas (zero falhas)
 * 🔥 Remoção de StaleWhileRevalidate (causava race condition)
 * 🔥 Fallback inline para imagens quebradas
 * 🔥 Precache forçado de ícones críticos no install
 * 🔥 Match pattern universal para todos os CDNs
 * 🔥 Debug logging completo para troubleshooting
 * 🔥 Force update em activate (garantia de cache limpo)
 * -------------------------------------------------------------------
 * 🐛 BUGS CORRIGIDOS v8.6.0:
 * -------------------------------------------------------------------
 * ❌ Imagens CDN não persistem após F5 (SWR race condition)
 * ❌ Ícones aparecem como "?" após primeiro load
 * ❌ Cache miss em imagens já baixadas
 * ❌ SW não intercepta requisições de imagens externas
 * -------------------------------------------------------------------
 */

/// <reference lib="webworker" />
/* eslint-disable no-restricted-globals */

import { precacheAndRoute, cleanupOutdatedCaches } from "workbox-precaching";
import { registerRoute, setDefaultHandler, setCatchHandler } from "workbox-routing";
import {
  NetworkFirst,
  StaleWhileRevalidate,
  CacheFirst,
  NetworkOnly,
} from "workbox-strategies";
import { ExpirationPlugin } from "workbox-expiration";
import { CacheableResponsePlugin } from "workbox-cacheable-response";

declare const self: ServiceWorkerGlobalScope;

/* ═══════════════════════════════════════════════════════════════════
   📌 CONFIGURAÇÕES GLOBAIS
   ═══════════════════════════════════════════════════════════════════ */
const VERSION = "8.6.0";
const LOG_PREFIX = `[SevenDevX SW v${VERSION}]`;
const DEBUG = true; // Ativar logs detalhados

const CACHE_PREFIX = "sevendevx";
const CACHE_SUFFIX = `-v${VERSION.replace(/\./g, "-")}`;

const CACHE_NAMES = {
  static: `${CACHE_PREFIX}-static${CACHE_SUFFIX}`,
  pages: `${CACHE_PREFIX}-html${CACHE_SUFFIX}`,
  images: `${CACHE_PREFIX}-images${CACHE_SUFFIX}`,
  external_images: `${CACHE_PREFIX}-images-ext${CACHE_SUFFIX}`,
  fonts_google: `${CACHE_PREFIX}-fonts-google${CACHE_SUFFIX}`,
  fonts_local: `${CACHE_PREFIX}-fonts-local${CACHE_SUFFIX}`,
  avatars: `${CACHE_PREFIX}-avatars${CACHE_SUFFIX}`,
  api: `${CACHE_PREFIX}-api${CACHE_SUFFIX}`,
  fallback: `${CACHE_PREFIX}-fallback${CACHE_SUFFIX}`,
};

const FALLBACK_HTML = "/offline.html";
const FALLBACK_IMG = "/icons/icon-512x512.png";

// SVG inline fallback para quando imagem falhar
const FALLBACK_SVG = `image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100'%3E%3Crect fill='%23333' width='100' height='100'/%3E%3Ctext fill='%23fff' x='50%25' y='50%25' text-anchor='middle' dy='.3em' font-family='sans-serif' font-size='14'%3E?%3C/text%3E%3C/svg%3E`;

const cacheable = new CacheableResponsePlugin({ statuses: [0, 200] });

/* ═══════════════════════════════════════════════════════════════════
   🧠 QUOTA MONITORING
   ═══════════════════════════════════════════════════════════════════ */
async function monitorQuota() {
  if (!("storage" in navigator)) return;

  try {
    const { usage, quota } = await navigator.storage.estimate();
    const percent = ((usage! / quota!) * 100).toFixed(1);

    if (DEBUG) {
      console.log(`${LOG_PREFIX} Quota: ${percent}% usado (${(usage! / 1048576).toFixed(1)}MB / ${(quota! / 1048576).toFixed(1)}MB)`);
    }

    if (Number(percent) > 78) {
      self.clients.matchAll().then((clients) => {
        clients.forEach((c) =>
          c.postMessage({
            type: "QUOTA_WARNING",
            usage,
            quota,
            percent,
          })
        );
      });
    }
  } catch (e) {
    console.warn(`${LOG_PREFIX} ⚠️ Erro ao verificar quota:`, e);
  }
}

/* ═══════════════════════════════════════════════════════════════════
   📦 PRECACHE & CLEANUP
   ═══════════════════════════════════════════════════════════════════ */
precacheAndRoute(self.__WB_MANIFEST || []);
cleanupOutdatedCaches();

if (DEBUG) console.log(`${LOG_PREFIX} Iniciando registro de rotas...`);

/* ═══════════════════════════════════════════════════════════════════
   🔐 SUPABASE AUTH (NetworkOnly - NEVER cache auth requests!)
   ═══════════════════════════════════════════════════════════════════ */
registerRoute(
  ({ url, request }) => {
    const isSupabase = url.hostname.includes("supabase.co");
    const isAuthPath = url.pathname.includes("/auth/");
    const isPostOrPut = request.method === "POST" || request.method === "PUT" || request.method === "DELETE" || request.method === "PATCH";
    return isSupabase && (isAuthPath || isPostOrPut);
  },
  new NetworkOnly(),
  "POST"
);

// Also handle GET requests to auth endpoints
registerRoute(
  ({ url }) => {
    const isSupabase = url.hostname.includes("supabase.co");
    const isAuthPath = url.pathname.includes("/auth/");
    return isSupabase && isAuthPath;
  },
  new NetworkOnly(),
  "GET"
);

/* ═══════════════════════════════════════════════════════════════════
   🔍 TRACKING (NetworkOnly)
   ═══════════════════════════════════════════════════════════════════ */
registerRoute(
  ({ url }) =>
    /(google-analytics|googletagmanager|doubleclick|facebook\.com\/tr|clarity)/.test(
      url.hostname + url.pathname
    ),
  new NetworkOnly(),
  "GET"
);

/* ═══════════════════════════════════════════════════════════════════
   👤 DICEBEAR (CacheFirst)
   ═══════════════════════════════════════════════════════════════════ */
registerRoute(
  ({ url }) => url.origin === "https://api.dicebear.com",
  new CacheFirst({
    cacheName: CACHE_NAMES.avatars,
    plugins: [
      cacheable,
      new ExpirationPlugin({
        maxEntries: 200,
        maxAgeSeconds: 365 * 86400,
        purgeOnQuotaError: true,
      }),
    ],
  }),
  "GET"
);

/* ═══════════════════════════════════════════════════════════════════
   🔤 GOOGLE FONTS (StaleWhileRevalidate)
   ═══════════════════════════════════════════════════════════════════ */
registerRoute(
  ({ url }) =>
    url.origin === "https://fonts.googleapis.com" ||
    url.origin === "https://fonts.gstatic.com",
  new StaleWhileRevalidate({
    cacheName: CACHE_NAMES.fonts_google,
    plugins: [
      cacheable,
      new ExpirationPlugin({
        maxEntries: 20,
        maxAgeSeconds: 365 * 86400,
      }),
    ],
  }),
  "GET"
);

/* ═══════════════════════════════════════════════════════════════════
   🔤 FONTES LOCAIS (CacheFirst)
   ═══════════════════════════════════════════════════════════════════ */
registerRoute(
  ({ request, url }) =>
    request.destination === "font" || url.pathname.startsWith("/fonts/"),
  new CacheFirst({
    cacheName: CACHE_NAMES.fonts_local,
    plugins: [
      cacheable,
      new ExpirationPlugin({
        maxEntries: 40,
        maxAgeSeconds: 365 * 86400,
      }),
    ],
  }),
  "GET"
);

/* ═══════════════════════════════════════════════════════════════════
   🔌 SUPABASE API (NetworkFirst)
   ═══════════════════════════════════════════════════════════════════ */
registerRoute(
  ({ url }) => url.hostname.includes("supabase.co"),
  new NetworkFirst({
    cacheName: CACHE_NAMES.api,
    networkTimeoutSeconds: 5,
    plugins: [
      cacheable,
      new ExpirationPlugin({
        maxEntries: 100,
        maxAgeSeconds: 5 * 60,
      }),
    ],
  }),
  "GET"
);

/* ═══════════════════════════════════════════════════════════════════
   🖼️ IMAGENS EXTERNAS — CACHEFIRST AGRESSIVO (FIX v8.6.0)
   ═══════════════════════════════════════════════════════════════════
   ✅ Estratégia mudada de SWR para CacheFirst
   ✅ Garantia de que imagens nunca "desaparecem"
   ✅ Match pattern universal para QUALQUER CDN externo
   ═══════════════════════════════════════════════════════════════════ */
registerRoute(
  ({ request, url }) => {
    const isImage = request.destination === "image";
    const isExternal = url.origin !== self.location.origin;
    const isAllowedCDN = [
      "cdn.jsdelivr.net",
      "raw.githubusercontent.com",
      "unpkg.com",
      "images.unsplash.com",
      "source.unsplash.com",
      "plus.unsplash.com",
      "cdn.simpleicons.org",
      "devicon.dev",
      "cdn.worldvectorlogo.com",
      "vitejs.dev",
      "svgur.com",
    ].some(domain => url.hostname.includes(domain));

    const hasImageExt = /\.(svg|png|jpg|jpeg|webp|gif|ico)(\?|$)/i.test(url.pathname);

    const match = isImage && isExternal && (isAllowedCDN || hasImageExt);
    if (DEBUG && match) {
      console.log(`${LOG_PREFIX} 🖼️ Interceptando imagem externa:`, url.href);
    }
    return match;
  },
  new CacheFirst({
    cacheName: CACHE_NAMES.external_images,
    plugins: [
      cacheable,
      new ExpirationPlugin({
        maxEntries: 1000,
        maxAgeSeconds: 180 * 86400, // 180 dias
        purgeOnQuotaError: true,
      }),
    ],
  }),
  "GET"
);

/* ═══════════════════════════════════════════════════════════════════
   🖼️ IMAGENS LOCAIS (CacheFirst)
   ═══════════════════════════════════════════════════════════════════ */
registerRoute(
  ({ request, url }) => {
    const match = request.destination === "image" && url.origin === self.location.origin;
    if (DEBUG && match) {
      console.log(`${LOG_PREFIX} 🖼️ Cacheando imagem local:`, url.pathname);
    }
    return match;
  },
  new CacheFirst({
    cacheName: CACHE_NAMES.images,
    plugins: [
      cacheable,
      new ExpirationPlugin({
        maxEntries: 800,
        maxAgeSeconds: 120 * 86400,
      }),
    ],
  }),
  "GET"
);

/* ═══════════════════════════════════════════════════════════════════
   📦 JS & CSS (CacheFirst)
   ═══════════════════════════════════════════════════════════════════ */
registerRoute(
  ({ request }) =>
    request.destination === "script" || request.destination === "style",
  new CacheFirst({
    cacheName: CACHE_NAMES.static,
    plugins: [
      cacheable,
      new ExpirationPlugin({
        maxEntries: 200,
        maxAgeSeconds: 60 * 86400,
      }),
    ],
  }),
  "GET"
);

/* ═══════════════════════════════════════════════════════════════════
   🌐 HTML / Navegação (NetworkFirst)
   ═══════════════════════════════════════════════════════════════════ */
registerRoute(
  ({ request }) => request.mode === "navigate",
  new NetworkFirst({
    cacheName: CACHE_NAMES.pages,
    networkTimeoutSeconds: 5,
    plugins: [
      cacheable,
      new ExpirationPlugin({
        maxEntries: 80,
        maxAgeSeconds: 7 * 86400,
      }),
    ],
  }),
  "GET"
);

/* ═══════════════════════════════════════════════════════════════════
   DEFAULT HANDLER
   ═══════════════════════════════════════════════════════════════════ */
setDefaultHandler(
  new NetworkFirst({
    cacheName: CACHE_NAMES.fallback,
    networkTimeoutSeconds: 3,
    plugins: [cacheable],
  })
);

/* ═══════════════════════════════════════════════════════════════════
   OFFLINE FALLBACK
   ═══════════════════════════════════════════════════════════════════ */
setCatchHandler(async ({ request }) => {
  if (request.mode === "navigate") {
    const cached = await caches.match(FALLBACK_HTML);
    if (cached) return cached;
  }
  if (request.destination === "image") {
    const cached = await caches.match(FALLBACK_IMG);
    if (cached) return cached;
    // Fallback SVG inline se não houver cache
    return new Response(
      decodeURIComponent(FALLBACK_SVG.split(',')[1]),
      { headers: { "Content-Type": "image/svg+xml" } }
    );
  }
  return Response.error();
});

/* ═══════════════════════════════════════════════════════════════════
   INSTALL
   ═══════════════════════════════════════════════════════════════════ */
self.addEventListener("install", (event) => {
  console.log(`${LOG_PREFIX} 📥 Instalando...`);
  event.waitUntil(
    (async () => {
      const cache = await caches.open(CACHE_NAMES.static);
      await Promise.allSettled([
        cache.add(FALLBACK_HTML).catch(() => console.warn(`${LOG_PREFIX} ⚠️ offline.html não encontrado`)),
        cache.add(FALLBACK_IMG).catch(() => console.warn(`${LOG_PREFIX} ⚠️ fallback icon não encontrado`)),
      ]);
      await self.skipWaiting();
      console.log(`${LOG_PREFIX} ✅ Instalação concluída`);
    })()
  );
});

/* ═══════════════════════════════════════════════════════════════════
   ACTIVATE
   ═══════════════════════════════════════════════════════════════════ */
self.addEventListener("activate", (event) => {
  console.log(`${LOG_PREFIX} 🔄 Ativando...`);

  const allowed = Object.values(CACHE_NAMES).concat([
    "workbox-precache-v2",
    "workbox-precache-v2-temp",
  ]);

  event.waitUntil(
    Promise.all([
      // Limpar caches antigos
      caches.keys().then((keys) =>
        Promise.all(
          keys
            .filter((k) => k.startsWith("sevendevx-") && !allowed.includes(k))
            .map((k) => {
              console.log(`${LOG_PREFIX} 🗑️ Deletando cache antigo: ${k}`);
              return caches.delete(k);
            })
        )
      ),
      // Monitorar quota
      monitorQuota(),
      // Claim todos os clientes imediatamente
      self.clients.claim(),
    ]).then(() => {
      console.log(`${LOG_PREFIX} ✅ Ativado com sucesso!`);
      // Notificar clientes sobre nova versão
      self.clients.matchAll().then((clients) => {
        clients.forEach((client) =>
          client.postMessage({
            type: "SW_UPDATED",
            version: VERSION,
          })
        );
      });
    })
  );
});

/* ═══════════════════════════════════════════════════════════════════
   FETCH (DEBUG)
   ═══════════════════════════════════════════════════════════════════ */
if (DEBUG) {
  self.addEventListener("fetch", (event) => {
    if (event.request.destination === "image") {
      const url = new URL(event.request.url);
      if (url.origin !== self.location.origin) {
        console.log(`${LOG_PREFIX} 🌐 FETCH imagem externa:`, url.href);
      }
    }
  });
}

/* ═══════════════════════════════════════════════════════════════════
   MENSAGENS DO CLIENTE
   ═══════════════════════════════════════════════════════════════════ */
self.addEventListener("message", (event) => {
  const data = event.data;

  if (data?.type === "SKIP_WAITING") {
    console.log(`${LOG_PREFIX} ⏭️ Skip waiting solicitado`);
    self.skipWaiting();
  }

  if (data?.type === "GET_VERSION") {
    event.ports?.[0]?.postMessage({ version: VERSION });
  }

  if (data?.type === "CHECK_QUOTA") {
    event.waitUntil(
      (async () => {
        const { usage, quota } = await navigator.storage.estimate();
        event.ports?.[0]?.postMessage({
          usage: usage! / 1048576,
          quota: quota! / 1048576,
          percent: (usage! / quota!) * 100,
        });
      })()
    );
  }

  if (data?.type === "CLEAR_CACHE") {
    event.waitUntil(
      (async () => {
        const keys = await caches.keys();
        await Promise.all(keys.map((k) => caches.delete(k)));
        console.log(`${LOG_PREFIX} 🧹 Todos os caches limpos`);
        event.ports?.[0]?.postMessage({ cleared: true });
      })()
    );
  }
});

console.log(`${LOG_PREFIX} 🚀 CARREGADO — CacheFirst Agressivo para Imagens Externas`);
