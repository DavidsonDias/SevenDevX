# ADR-003 — Autenticação e papéis via Supabase Auth + `user_roles`

## Status

Accepted

## Context

O SevenOS precisa de autenticação com sessão persistente e de um modelo de papéis que não permita escalonamento de privilégio pelo cliente. Havia risco de armazenar papel no perfil do usuário ou em storage local.

## Decision

- Supabase Auth como provedor de sessão, exposto por um único contexto: `useAuthContext` (`src/contexts/AuthContext.tsx`).
- Papéis exclusivamente na tabela `user_roles` com enum `app_role`.
- Verificação por `public.has_role()` (`SECURITY DEFINER`, `search_path = public`), usada tanto no cliente (UI) quanto em políticas RLS e Edge Functions.
- `ProtectedRoute` protege apenas a navegação; a autorização efetiva é RLS.

## Consequences

### Positive
- Sem recursão de RLS ao consultar papéis.
- Escalonamento de privilégio pelo cliente é inviável.
- Uma única fonte de verdade de sessão.

### Negative
- Toda checagem de papel custa uma RPC (mitigada por cache no contexto).
- O hook legado `useAuth.ts` foi removido; consumidores antigos precisaram migrar.
