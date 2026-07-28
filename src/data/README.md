# data — Conteúdo estático tipado

Conteúdo versionado em código, usado principalmente pelas páginas públicas e pela estratégia GEO/SEO.

## Estrutura

| Arquivo | Responsabilidade |
|---|---|
| `projects.ts` | Portfólio (slug, descrição, stack, links) |
| `projectImages.ts` | Mapeamento de imagens dos projetos, incluindo assets locais |
| `caseStudies.ts` | Estudos de caso detalhados |
| `contentClusters.ts` | Clusters temáticos de conteúdo |
| `geoContent.ts` | Conteúdo das páginas GEO (respostas, soluções, cidades) |
| `entityGraph.ts` | Entidades e relações para JSON-LD |

## Regras

- Sem dependência de React; apenas dados e tipos.
- Toda entrada deve ser tipada — nada de `any`.
- Imagens referenciadas devem existir em `src/assets`; a resolução trata prefixos como `local:`.
- Conteúdo já migrado para o CMS (tabelas `site_page_*`, `services_cms`, `blog_posts`) **não** deve ser duplicado aqui.

## Pontos de atenção

Convivência entre conteúdo estático e CMS é dívida registrada — ver [TD-005](../../docs/technical-debt/README.md).
