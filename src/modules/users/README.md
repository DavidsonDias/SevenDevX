# Users Module

## Objetivo

Administração de usuários do SevenOS: perfil, papéis, MFA e sessões.

## Estrutura

| Arquivo | Responsabilidade |
|---|---|
| `UserDetailsModal.tsx` | Visão detalhada do usuário com ações administrativas |

## Data flow

```text
admin_list_users (RPC) → lista
admin_set_role / admin_remove_role → user_roles (auditado)
admin_list_mfa_status → situação de MFA (sem expor segredo)
admin_revoke_session → admin_sessions
admin-delete-user (Edge Function) → remoção definitiva
```

## Tabelas

`profiles` · `user_roles` · `user_mfa` · `admin_sessions`

## Superfícies

`/admin/users` · `/admin/sessions` · `/admin/security/mfa`

## Pontos de atenção

- Papéis vivem **somente** em `user_roles`. Nunca gravar papel em `profiles`.
- Concessão e remoção de papel exigem papel admin e são auditadas.
- Segredos TOTP nunca são retornados a outro usuário, nem a administradores.
- Exclusão de usuário é irreversível e afeta dados relacionados.
