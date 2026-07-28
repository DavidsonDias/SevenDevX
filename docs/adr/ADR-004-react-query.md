# ADR-004 — React Query como camada de acesso a dados

## Status

Accepted

## Context

O SevenOS possui dezenas de telas administrativas que compartilham as mesmas entidades (projetos, clientes, finanças). Estado manual com `useEffect` levava a refetch duplicado, dados divergentes entre telas e tratamento de erro inconsistente.

## Decision

Todo acesso a dados passa por hooks em `src/hooks/*` baseados em TanStack React Query, com configuração global em `src/app/Providers.tsx`:

- `staleTime` 5 min · `gcTime` 10 min
- `retry` 3 com backoff exponencial (máx. 30s)
- `refetchOnWindowFocus: false` · `refetchOnReconnect: true`
- Chaves com escopo no primeiro elemento (`["projects"]`, `["projects", id]`)

Agregações pesadas são resolvidas por RPC no banco, não por composição no cliente.

## Consequences

### Positive
- Cache compartilhado entre telas e invalidação previsível após mutations.
- Menos código de loading/error por tela.
- Retry uniforme em rede instável.

### Negative
- Dados podem ficar até 5 minutos obsoletos sem invalidação explícita — mutations precisam invalidar as chaves corretas.
- `refetchOnWindowFocus` desativado exige invalidação manual em fluxos multiaba.
