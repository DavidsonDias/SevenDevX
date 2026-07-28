# Row Level Security

## Modelo

Toda tabela de aplicação tem RLS habilitado. Os perfis de acesso usados no projeto:

| Perfil | Descrição | Exemplo |
|---|---|---|
| **Admin-only** | Somente `has_role(auth.uid(),'admin')` | `system_settings`, `audit_log`, `transactions` |
| **Owner** | Linha pertence a `auth.uid()` | `user_mfa`, `notification_preferences`, `onboarding_progress` |
| **Público read** | `SELECT` para `anon` + `authenticated` | `services_cms`, `blog_posts` publicados, `site_page_*`, `tech_registry`, `projects` publicados |
| **Público insert** | `INSERT` restrito para captação de lead | `contacts` (formulário/diagnóstico) |
| **Interno autenticado** | Qualquer usuário autenticado da equipe | tabelas operacionais internas |

## GRANT é obrigatório

RLS **não** substitui privilégio. Toda tabela nova precisa de:

```sql
GRANT SELECT, INSERT, UPDATE, DELETE ON public.<table> TO authenticated;
GRANT ALL ON public.<table> TO service_role;
-- somente se houver política de leitura anônima:
GRANT SELECT ON public.<table> TO anon;
```

> Falha histórica recorrente: conteúdo editado no admin aparecia apenas para o usuário logado. Causa: faltava `GRANT SELECT ... TO anon` (ou `USAGE` no schema) mesmo com política de leitura pública. Ao criar conteúdo público, valide **deslogado**.

## Função canônica de papel

```sql
create or replace function public.has_role(_user_id uuid, _role app_role)
returns boolean
language sql stable security definer set search_path = public
as $$ select exists (select 1 from public.user_roles where user_id = _user_id and role = _role) $$;
```

Usada em políticas para evitar recursão de RLS sobre `user_roles`.

## Anti-padrões proibidos

- Papel armazenado em `profiles` ou em claim editável.
- Política que consulta a própria tabela protegida sem função `SECURITY DEFINER`.
- `GRANT` amplo para `anon` em tabela com PII.
- Tabela sem política (a menos que o acesso deva ser exclusivo de `service_role`).

## Validação

Após alterar políticas de conteúdo público, confirme com uma sessão anônima (sem token) que a leitura funciona e que nenhuma coluna sensível vazou.
