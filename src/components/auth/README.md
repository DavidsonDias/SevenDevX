# components/auth — Guardas de navegação

Componentes que controlam o acesso a rotas no cliente.

## Estrutura

| Arquivo | Responsabilidade |
|---|---|
| `ProtectedRoute.tsx` | Bloqueia rotas por sessão e papel (`requiredRole`), redirecionando para `/auth` |

## Regras

- Guarda de cliente é **conveniência de UX**, não segurança. A autoridade é RLS no banco e a validação de JWT nas Edge Functions.
- Papéis são lidos via RPC `has_role`; nunca a partir de storage local.
- Estados de carregamento devem evitar "piscar" conteúdo protegido antes da resolução da sessão.

## Documentação relacionada

[AUTHENTICATION](../../../docs/architecture/AUTHENTICATION.md) · [AUTHORIZATION](../../../docs/security/AUTHORIZATION.md) · [ADR-003](../../../docs/adr/ADR-003-supabase-auth.md)
