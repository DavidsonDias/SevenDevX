# Documentation Changelog

Registro das alterações relevantes da documentação (não do produto).

## [1.1.0] — 2026-07-29

### Added
- Onda 6 (Audit): cabeçalhos Level 1/2 aplicados a **234 arquivos** restantes de `src/` (componentes, hooks, páginas públicas/GEO/admin, módulos, `core/branding`, `lib`, `utils`, `data`, `i18n`), incluindo `@route` nas páginas e nota de `@security` nas telas administrativas.
- READMEs de diretório em `src/components/auth`, `src/components/layout`, `src/components/security`, `src/components/services`, `src/components/admin/finance`, `src/components/admin/integrations`, `src/core/branding`, `src/pages/admin`, `src/pages/geo` e `src/integrations`.
- `scripts/apply-headers.mjs` — ferramenta idempotente de aplicação de cabeçalhos (nunca sobrescreve cabeçalho existente, nunca altera código).

### Changed
- `scripts/docs-check.mjs` passa a exigir `@file` em **todo** arquivo `.ts/.tsx` de `src/` (exceto `components/ui/`, código gerado e `.d.ts`) e cobre os novos diretórios com README obrigatório.
- Cabeçalho do service worker (`src/sw.ts`) normalizado com `@file`/`@module`, preservando o histórico de versões já existente no arquivo.

### Notes
- Nenhuma alteração de comportamento, rota, schema, API ou dependência.

## [1.0.0] — 2026-07-28

### Added
- **SevenDevX Enterprise Code Documentation Standard v1.0** (`docs/code-standards/`): cabeçalhos adaptativos (Level 1/2/3), TSDoc, comentários, README por diretório, convenções de nomenclatura e checklist.
- Portal de documentação `docs/README.md`.
- `docs/architecture/`: system overview, module map, data flow, autenticação, banco, integrações, IA, PWA e segurança.
- `docs/database/`: tabelas, RLS, RPCs, triggers e migrations.
- `docs/security/`: autorização, RLS, secrets, segurança de Edge Functions, audit log e checklist.
- `docs/adr/`: ADR-001 a ADR-004.
- `docs/technical-debt/README.md` com o registro inicial de dívidas observadas.
- READMEs de diretório em `src/` e `supabase/functions/`.
- Script `npm run docs:check` (warnings, não bloqueia build).
- Cabeçalhos Level 3 aplicados aos arquivos core de auth/roteamento/PWA.

### Notes
- Nenhuma alteração de comportamento, rota, schema ou dependência foi feita nesta onda.
