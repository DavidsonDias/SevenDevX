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
