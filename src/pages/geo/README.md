# pages/geo — Páginas GEO/SEO

Páginas voltadas a busca orgânica e a citação por assistentes de IA (Generative Engine Optimization).

## Estrutura

| Página | Rota |
|---|---|
| `AIHub.tsx` | `/ai` |
| `WhySevenDevX.tsx` | `/why-sevendevx` |
| `GeoArticle.tsx` | `/answers`, `/answers/:slug`, `/knowledge-base`, `/knowledge-base/:slug` |
| `SolutionPage.tsx` | `/solucoes`, `/solucoes/:slug` |
| `CaseStudies.tsx` | `/cases`, `/cases/:slug` |
| `ContentClusters.tsx` | `/clusters` |
| `LocalSeoPage.tsx` | `/local/:city` |
| `CriacaoSitesProfissionais.tsx` | `/criacao-de-sites-profissionais` |

## Regras

- Metadados sempre por `SEOHead`: title < 60, description < 160, canonical explícito.
- Um único `<h1>` por página e hierarquia de headings coerente.
- JSON-LD gerado a partir do conteúdo realmente renderizado — nunca declarar seções ocultas.
- Conteúdo estático vive em `src/data`; a landing de criação de sites é CMS-driven (`site_page_*`).
- Ao alterar slug, registrar redirecionamento e atualizar `public/sitemap.xml`.

## Documentação relacionada

[SEO/GEO no README raiz](../../../README.md) · [MODULE_MAP](../../../docs/architecture/MODULE_MAP.md)
