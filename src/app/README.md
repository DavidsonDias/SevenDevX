# app — Composição da aplicação

Camada de composição raiz: providers globais e tabela de rotas.

## Responsabilidade

Montar o ambiente de execução do React (cache, auth, idioma, tooltips, toasts, schema SEO) e mapear URLs para páginas. Não contém regra de negócio.

## Estrutura

| Arquivo | Responsabilidade |
|---|---|
| `Providers.tsx` | React Query, `AuthProvider`, `LanguageProvider`, `TooltipProvider`, toasters e componentes de schema GEO |
| `Router.tsx` | Definição de rotas públicas, GEO, autenticadas e administrativas |

## Configuração de cache (React Query)

`staleTime` 5 min · `gcTime` 10 min · `retry` 3 com backoff exponencial (máx. 30s) · sem refetch no foco · refetch ao reconectar. Ver [ADR-004](../../docs/adr/ADR-004-react-query.md).

## Regras

- Ordem dos providers importa: `AuthProvider` envolve `LanguageProvider` e a UI, garantindo sessão disponível a toda a árvore.
- Rotas `/admin/*` são envolvidas por `ProtectedRoute requiredRole="admin"`.
- Páginas pesadas devem permanecer sob lazy loading.
- Nenhuma query de dados aqui.

## Dependências relacionadas

React Router · TanStack React Query · Radix Tooltip · Sonner
