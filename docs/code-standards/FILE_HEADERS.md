# Cabeçalhos de arquivo — Padrão adaptativo

Todo arquivo **relevante** possui cabeçalho. O tamanho do cabeçalho é proporcional à criticidade do arquivo.

Arquivos **não documentados por padrão**: `src/components/ui/*` gerados pelo shadcn (upstream), `src/integrations/supabase/client.ts` e `types.ts` (auto-gerados — nunca editar), assets.

---

## Level 1 — Simple file

Para constants, enums, configs simples, helpers pequenos e tipos triviais.

```ts
/**
 * @file projectStatus.ts
 * @description Status utilizados durante o ciclo de vida dos projetos.
 * @module Projects
 */
```

---

## Level 2 — Standard file

Para componentes, hooks, services, repositories, stores e utilitários relevantes.

```ts
/**
 * 🧩 useProjects.ts — SevenOS
 *
 * @file useProjects.ts
 * @module Projects
 *
 * @description
 * Camada de acesso a `projects` via React Query: listagem, detalhe,
 * criação, atualização de pipeline e invalidação de cache.
 *
 * @responsibilities
 *   - Encapsular queries/mutations Supabase da entidade projeto
 *   - Manter chaves de cache estáveis para invalidação cruzada
 *
 * @dependencies React Query · Supabase Client
 *
 * @sideEffects Invalida `["projects"]` após mutations.
 */
```

---

## Level 3 — Critical / architectural file

Para páginas principais, providers, auth, security, integrações, Edge Functions, engines, PWA, realtime, IA e layouts.

```ts
/**
 * 🚀 AuthContext.tsx — SevenDevX Enterprise Platform
 * ═══════════════════════════════════════════════════════════════════════
 *
 * @file AuthContext.tsx
 * @module Core/Auth
 *
 * @description
 * Fonte única de verdade da sessão autenticada e do papel administrativo.
 *
 * @architecture
 *   Providers
 *      └── AuthProvider
 *          ├── supabase.auth.onAuthStateChange
 *          ├── supabase.auth.getSession
 *          └── rpc has_role('admin')
 *
 * @responsibilities
 *   - Expor user/session/isLoading/isAdmin
 *   - Prover signIn/signUp/signOut/resetPassword
 *
 * @dependencies Supabase Auth · React Context
 *
 * @security
 *   `isAdmin` é sempre derivado da RPC `has_role` (SECURITY DEFINER),
 *   nunca de storage local. Não usar para autorização de dados — RLS decide.
 *
 * @performance
 *   A verificação de role é agendada fora do callback do listener.
 *
 * @see src/components/auth/ProtectedRoute.tsx
 * ═══════════════════════════════════════════════════════════════════════
 */
```

---

## Tags suportadas

| Tag | Uso |
|---|---|
| `@file` | Nome do arquivo |
| `@module` | Módulo lógico (ver [MODULE_MAP](../architecture/MODULE_MAP.md)) |
| `@description` | Propósito em 1–4 linhas |
| `@architecture` | Posição no sistema (ASCII tree) |
| `@responsibilities` | Lista objetiva |
| `@dependencies` | Bibliotecas/serviços relevantes |
| `@security` | Requisitos de auth/RLS/segredos |
| `@performance` | Lazy loading, cache, custo |
| `@accessibility` | Requisitos WCAG aplicáveis |
| `@sideEffects` | Escritas, invalidações, storage, realtime |
| `@see` | Arquivos relacionados |
| `@since` / `@updated` | Datas/versões quando houver valor |
