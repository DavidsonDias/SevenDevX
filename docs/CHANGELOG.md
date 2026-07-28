# Documentation Changelog

Registro das alterações relevantes da documentação (não do produto).

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
