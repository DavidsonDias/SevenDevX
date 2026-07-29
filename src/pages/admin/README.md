# pages/admin — Telas do SevenOS

Cada arquivo corresponde a uma rota `/admin/*` declarada em `src/app/Router.tsx`.

## Responsabilidade

Orquestrar hooks e componentes de domínio. Regra de negócio pesada pertence a `src/hooks` e `src/modules`; a página apenas compõe, trata estados e dispara ações.

## Regras

- Toda rota é envolvida por `ProtectedRoute requiredRole="admin"` — conveniência de UX; a autoridade é RLS.
- Layout sempre via `AdminPageShell` (header auto-hide, breadcrumb e slots globais).
- Ações destrutivas exigem confirmação explícita e ficam registradas em `audit_log`.
- Sem chamadas diretas ao backend quando já existe hook para o domínio.
- Páginas pesadas permanecem sob lazy loading no Router.

## Mapa de rotas

O mapa completo de módulo → rota → tabelas → Edge Functions está em [MODULE_MAP](../../../docs/architecture/MODULE_MAP.md).

## Documentação relacionada

[AUTHORIZATION](../../../docs/security/AUTHORIZATION.md) · [RLS](../../../docs/database/RLS.md) · [AUDIT_LOG](../../../docs/security/AUDIT_LOG.md)
