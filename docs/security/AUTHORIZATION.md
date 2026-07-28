# Authorization

## Papéis

Enum `app_role`: `admin`, `moderator`, `user`. Armazenados **exclusivamente** em `user_roles`.

Verificação canônica: `public.has_role(_user_id, _role)` — `SECURITY DEFINER`, `stable`, `search_path = public`.

## Superfícies e como são protegidas

| Superfície | Guarda | Autoridade real |
|---|---|---|
| Rotas `/admin/*` | `ProtectedRoute requiredRole="admin"` | RLS + Edge Functions |
| Rota `/profile` | `ProtectedRoute` (autenticado) | RLS (owner) |
| Leitura de dados | políticas RLS | Postgres |
| Escrita de dados | políticas RLS (`WITH CHECK`) | Postgres |
| Operações privilegiadas | Edge Function com JWT + `has_role` | Postgres/service role |
| Conteúdo público | políticas de leitura anônima + GRANT `anon` | Postgres |

## Regras

1. **Nunca** decidir permissão a partir de `localStorage`, `sessionStorage` ou props do cliente.
2. `isAdmin` do `AuthContext` serve para UI (mostrar/ocultar). Não é controle de acesso.
3. Edge Function administrativa **sempre** revalida: `getUser()` → `rpc('has_role', {_user_id, _role:'admin'})` → 401/403.
4. Elevação de papel só por `admin_set_role`, que exige papel admin e é auditada.
5. Rotas protegidas não recebem redirect direto de OAuth; o retorno é same-origin e a navegação ocorre depois da sessão hidratar.

## Escalonamento de privilégio — vetores vigiados

- Papel gravado em tabela de perfil (**proibido**).
- Política RLS que consulta `user_roles` sem `SECURITY DEFINER` (recursão + bypass).
- Edge Function sem verificação de role acessível por qualquer usuário autenticado.
- Função `SECURITY DEFINER` executável por `anon`.
