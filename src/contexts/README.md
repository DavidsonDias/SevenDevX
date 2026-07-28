# contexts — Contextos globais

## Responsabilidade

Estado global que não pertence ao cache de dados do React Query.

## Estrutura

| Arquivo | Responsabilidade |
|---|---|
| `AuthContext.tsx` | **Fonte única de verdade** de sessão, usuário e papel administrativo |

## Regras

- Consumir sempre via `useAuthContext()`. O hook legado `useAuth.ts` foi removido do projeto.
- `isAdmin` vem exclusivamente da RPC `has_role` — nunca de storage local.
- `isAdmin` controla exibição de UI, **não** autorização de dados (isso é RLS).
- O listener `onAuthStateChange` é registrado antes de `getSession()`; a checagem de papel roda fora do callback para evitar deadlock do cliente Supabase.

## Documentação relacionada

[AUTHENTICATION](../../docs/architecture/AUTHENTICATION.md) · [AUTHORIZATION](../../docs/security/AUTHORIZATION.md) · [ADR-003](../../docs/adr/ADR-003-supabase-auth.md)
