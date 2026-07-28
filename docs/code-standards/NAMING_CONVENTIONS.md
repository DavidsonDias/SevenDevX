# Convenções de nomenclatura

## Arquivos

| Tipo | Padrão | Exemplo |
|---|---|---|
| Componente React | `PascalCase.tsx` | `ProjectCard3D.tsx` |
| Página | `PascalCase.tsx` | `AdminDashboard.tsx` |
| Página admin | `<Domínio>Admin.tsx` | `CashflowAdmin.tsx` |
| Hook | `useCamelCase.ts` | `useProjects.ts` |
| Utilitário / lib | `camelCase.ts` | `safeStorage.ts` |
| Dados estáticos | `camelCase.ts` | `projects.ts` |
| Edge Function | `kebab-case/index.ts` | `whatsapp-webhook/index.ts` |
| Migration | timestamp gerado | `20260724165543_*.sql` |

## Símbolos

- Componentes e tipos: `PascalCase`
- Funções, variáveis, props: `camelCase`
- Constantes de módulo: `SCREAMING_SNAKE_CASE`
- Booleanos: prefixo `is` / `has` / `can`

## Banco de dados

- Tabelas: `snake_case` plural (`project_budgets`)
- Funções RPC de negócio: prefixo `fn_` (`fn_cashflow_forecast`)
- Funções administrativas: prefixo `admin_` (`admin_set_role`)
- Enums: singular (`app_role`)

## Rotas

- Público: kebab-case em pt-BR quando for landing de SEO (`/criacao-de-sites-profissionais`)
- Admin: `/admin/<dominio>` e sub-rotas `/admin/<dominio>/<recurso>`

## Chaves de cache (React Query)

Array com escopo primeiro: `["projects"]`, `["projects", id]`, `["pipeline_forecast"]`.

## Storage do browser

Prefixo `sevendevx:` ou `sevendevx-` (ex.: `sevendevx:nav-history`, `sevendevx-language`).
