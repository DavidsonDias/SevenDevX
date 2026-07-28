# utils — Utilitários de plataforma

Funções ligadas ao ambiente de execução (browser, PWA, storage, exportação), sem regra de negócio.

## Estrutura

| Arquivo | Responsabilidade |
|---|---|
| `safeStorage.ts` | Acesso tolerante a `localStorage` quando bloqueado (iframe, modo restrito) |
| `browserStorageGuard.ts` | Guarda importada no bootstrap para evitar exceções de storage |
| `registerServiceWorker.ts` | Registro controlado do Service Worker |
| `offlineQueue.ts` | Fila IndexedDB de operações pendentes; drenada por Background Sync |
| `authErrors.ts` | Tradução de erros de autenticação em mensagens de usuário |
| `pdfExport.ts` | Geração de PDF (relatórios e brand kit) |
| `techData.ts` | Metadados estáticos de tecnologias |
| `theme.ts` / `theme.js` | Utilidades de tema |

## Regras

- Nunca acessar `localStorage`/`sessionStorage` diretamente: usar `safeStorage`.
- Chaves de storage com prefixo `sevendevx:` ou `sevendevx-`.
- Nenhum utilitário aqui deve fazer query de negócio.
- Erros traduzidos não devem revelar detalhe interno do backend.

## Pontos de atenção

- O Service Worker é desregistrado em iframe e hosts de preview (ver `src/main.tsx`).
- Chamadas ao backend não são cacheadas pelo SW — ver [PWA_ARCHITECTURE](../../docs/architecture/PWA_ARCHITECTURE.md).
- `theme.js` e `theme.ts` coexistem; consolidar é candidato a dívida técnica.
