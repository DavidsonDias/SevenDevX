# PWA Architecture

## Componentes

| Arquivo | Papel |
|---|---|
| `src/sw.ts` | Service Worker (injectManifest / Workbox), estratégias de cache e Background Sync |
| `vite.config.ts` | Configuração do plugin PWA, manifesto e limites de precache |
| `src/main.tsx` | Guarda que desregistra SW em iframe e hosts de preview |
| `src/utils/registerServiceWorker.ts` | Registro controlado do SW |
| `src/utils/offlineQueue.ts` | Fila IndexedDB de operações offline |
| `src/components/OfflineIndicator.tsx` | Estado de conectividade na UI |
| `src/components/PWAUpdatePrompt.tsx` | Aviso e aplicação de atualização |
| `src/components/AppInstallerButton.tsx` | Instalação (com detecção de app já instalado) |
| `public/manifest.json`, `public/offline.html` | Manifesto e fallback offline |

## Estratégias

```text
Documentos/rotas   → fallback para offline.html quando sem rede
Assets estáticos   → cache-first
Chamadas Supabase  → NetworkOnly (nunca servir dado de API do cache)
Mutações offline   → IndexedDB + Background Sync (drenagem ao reconectar)
```

> Regra fixa: requisições ao backend **não** são cacheadas pelo SW; dados obsoletos em ERP causam decisão errada.

## Precache

Vídeos e mídias pesadas são excluídos do precache; o limite `maximumFileSizeToCacheInBytes` está elevado para acomodar o chunk principal em build de produção e desenvolvimento (sem isso o build do Workbox falha).

## Preview / iframe

Em hosts de preview (`id-preview--`, `lovableproject.com`, `lovable.app`) e dentro de iframe, o SW é desregistrado no bootstrap para evitar cache preso durante o desenvolvimento.

## Instalação

A detecção considera `display-mode: standalone`, `navigator.standalone` (iOS) e o evento `beforeinstallprompt`, evitando reexibir o convite em dispositivo já instalado.

## Targets

```txt
Target: navegação básica do site público disponível offline
Target: nenhuma resposta de API servida a partir do cache
```

## Continuidade de edições

A instalação do worker não chama skipWaiting automaticamente. A ativação antecipada exige aprovação, verifica edições locais e consulta abas responsivas; controllerchange não recarrega abas sem aprovação própria. O registro de rascunhos é separado da fila offline de requisições. Consulte [ADR-005](../adr/ADR-005-sevenos-session-continuity.md) e [validação](../SEVENOS-CONTINUITY-VALIDATION.md).


## System bars and safe-area surfaces (2026-10-25)

The HTML shell owns PWA metadata; SEOHead does not inject duplicate status/theme tags. The manifest and HTML keep a black theme/background and a dark color scheme. iOS uses black-translucent to allow the home hero to paint behind its status bar where supported. AppViewport marks `/` as `home` and all other paths as `solid`, without changing navigation or authentication.

In standalone display, exposed bottom safe-area pixels are painted black. The top exposed safe area is black on non-home routes and transparent to home content on `/`. Header controls retain their safe-area padding. These overlays have no pointer events and do not change page content padding or hide OS indicators.

This is progressive enhancement, not native system-bar control. Android/browser versions that keep system bars outside the web viewport use the black theme fallback. There is no cross-browser PWA API to independently force the native top bar transparent and the bottom bar black. Do not use a colored theme-color or forced fullscreen to simulate support. Physical Android/iOS testing remains required; desktop screenshots do not prove native status/navigation bar colors.

References: https://developer.chrome.com/docs/css-ui/edge-to-edge and https://developer.apple.com/library/archive/documentation/AppleApplications/Reference/SafariHTMLRef/Articles/MetaTags.html
