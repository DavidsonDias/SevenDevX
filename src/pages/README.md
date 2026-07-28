# pages — Páginas da aplicação

Cada arquivo corresponde a uma rota declarada em `src/app/Router.tsx`.

## Estrutura

### Público

| Página | Rota |
|---|---|
| `Index.tsx` / `Home.tsx` | `/` |
| `About.tsx` | `/about` |
| `Services.tsx` | `/services` |
| `Projects.tsx`, `ProjectDetail.tsx`, `ProjectsHub.tsx` | `/projects`, `/projects/:slug`, `/projects-hub` |
| `Blog.tsx`, `BlogPost.tsx` | `/blog`, `/blog/:slug` |
| `Store.tsx` | `/store` |
| `Fornecedores.tsx` | `/fornecedores` |
| `IntegrationsMarketplace.tsx` | `/integracoes` |
| `PrivacyPolicy.tsx` | `/privacy-policy` |
| `Auth.tsx` | `/auth` |
| `OAuthCallback.tsx` | `/oauth/callback` |
| `NotFound.tsx` | `*` |

### GEO / SEO (`geo/`)

| Página | Rota |
|---|---|
| `AIHub.tsx` | `/ai` |
| `WhySevenDevX.tsx` | `/why-sevendevx` |
| `GeoArticle.tsx` | `/answers`, `/knowledge-base` |
| `SolutionPage.tsx` | `/solucoes`, `/solucoes/:slug` |
| `CaseStudies.tsx` | `/cases`, `/cases/:slug` |
| `ContentClusters.tsx` | `/clusters` |
| `LocalSeoPage.tsx` | `/local/:city` |
| `CriacaoSitesProfissionais.tsx` | `/criacao-de-sites-profissionais` |

### Autenticado

`Profile.tsx` → `/profile`

### Admin (`admin/`)

`AdminDashboard.tsx` (`/admin`) e as telas de domínio (`ProjectsAdmin`, `PipelineAdmin`, `ClientsAdmin`, `FinanceAdmin`, `CashflowAdmin`, `ForecastAdmin`, `IntegrationsAdmin`, `WebhooksAdmin`, `AutomationsAdmin`, `SecurityAdmin`, `SystemHealthAdmin`, `BackupAdmin`, `RestoreAdmin`, `BlogAdmin`, `ServicesAdmin`, `SiteCreationAdmin`, `BrandStudioAdmin`, entre outras). Mapa completo em [MODULE_MAP](../../docs/architecture/MODULE_MAP.md).

## Regras

- Páginas públicas definem metadados via `SEOHead` (title < 60, description < 160, H1 único, JSON-LD quando aplicável).
- Páginas admin são envolvidas por `ProtectedRoute requiredRole="admin"` e usam `AdminPageShell`.
- Páginas orquestram; a lógica pesada fica em hooks e módulos.
- Páginas pesadas permanecem sob lazy loading.

## Pontos de atenção

`Index.tsx` e `Home.tsx` coexistem — ver [TD-002](../../docs/technical-debt/README.md).
