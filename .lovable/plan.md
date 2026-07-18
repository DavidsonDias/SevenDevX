# Módulo Criação de Sites — SevenOS

Transformar a página `/criacao-de-sites-profissionais` em CMS-driven, preservando 100% o layout, animações e identidade atuais. Reutilizar módulos existentes (Projetos, Tecnologias, FAQ, Contacts) — sem duplicar dados.

## Escopo

Rota admin: `/admin/site-creation` com 13 abas (Visão geral, Hero, Tecnologias, Diferenciais, Projetos, Processo, Comparativo, ROI, FAQ, CTA, Diagnóstico, SEO/GEO, Config).

Cada seção: status, ordem, edição, preview, publicação (draft/published), histórico, ocultar sem excluir, restaurar.

## Arquitetura de dados

Uma tabela mãe `site_page_sections` com JSON por seção + rascunho/publicado. Referências (não cópias) para módulos existentes:

```text
site_page_config           singleton (settings, SEO, GEO, local, diagnóstico)
site_page_sections         hero, tech, differentials, process, comparison, roi, cta (JSONB draft + published)
site_page_metrics          métricas do hero (valor, prefixo, sufixo, fonte auto/manual, ordem)
site_page_differentials    cards (título, desc, ícone lucide, ordem, status, destaque)
site_page_process_steps    etapas (número, título, desc, ícone, prazo, entregáveis)
site_page_comparison_rows  linhas (critério, coluna A, coluna B, ícones, ordem)
site_page_roi_metrics      indicadores (valor, sufixo, título, desc, fonte, url)
site_page_projects         FK -> projects.id (ordem, destaque, is_hero, overrides opcionais)
site_page_tech             FK -> tech_registry.id (ordem, status, velocidade marquee global no config)
site_page_faqs             FK -> faq_items.id (ordem, override_answer opcional)
site_page_versions         snapshots JSON (rollback + histórico por usuário)
site_page_diagnostics      leads do fluxo (FK contacts.id, respostas JSONB, utm, consentimento)
```

Todas com RLS admin-only para escrita; leitura pública apenas do "published" via view `v_site_page_public`.

## Preservação da página

- **Não** recriar `CriacaoSitesProfissionais.tsx`. Refatorar para consumir hook `useSitePageData()` (React Query) que devolve tudo já resolvido (com joins para projects/tech/faqs).
- Fallback: se DB vazio, mantém defaults atuais hardcoded como seed inicial (migration popula tabelas com o conteúdo de hoje).
- Zero mudanças em Hero, mockup PsicoOne, marquee, cards, timeline, tabela, ROI, FAQ, CTA — só troca fonte dos dados.

## Diagnóstico gratuito

- Componente `DiagnosticoModal` reutilizado nos dois CTAs (Hero + CTA final).
- Multi-step (config no admin: campos, ordem, obrigatoriedade).
- Ao enviar: cria `contacts` (source=diagnostico, utm capturado), `site_page_diagnostics`, dispara notificação admin + evento `lead.created` (já existente), sem duplicar por email/telefone.

## SEO/GEO

- Aba edita: title, description, canonical, OG, robots, keywords.
- GEO: resumo, área atendimento, bairros, JSON-LD Service + ProfessionalService + FAQPage + BreadcrumbList gerados dinamicamente a partir das seções visíveis.
- Aviso ao trocar slug + gerar redirect 301 registrado em tabela `redirects`.

## Preview & Publicação

- Toggle Draft/Published por seção.
- Preview isolado em `/admin/site-creation/preview` (mesma página consumindo `?preview=1` que carrega draft).
- Botões: Salvar rascunho, Publicar tudo, Publicar seção, Restaurar versão N, Despublicar.
- Autosave a cada 30s em rascunho.
- Viewports: desktop / notebook / tablet / mobile via iframe.

## Visão geral (dashboard)

Cards: status, projeto principal, contagens (projetos/tech/diferenciais visíveis), diagnósticos totais/mês, taxa conversão (diag/pageviews via analytics_events já existente), SEO score placeholder, última publicação, mudanças pendentes.

## Navegação

Adicionar em `AdminMenu.tsx` grupo Conteúdo → "Criação de Sites" (`/admin/site-creation`).

## Entregáveis (ordem de implementação)

1. **Migration** — 12 tabelas + view pública + RLS + seed com conteúdo atual da página.
2. **Hooks** — `useSitePage*` para cada seção + `useSitePagePublish`.
3. **Refatorar** `CriacaoSitesProfissionais.tsx` para consumir hooks (mantendo JSX/animações).
4. **Admin shell** `/admin/site-creation` com tabs shadcn.
5. **Editores por aba** — forms + drag-and-drop (dnd-kit já no projeto) + seletor de projetos/tech/faq via Combobox.
6. **DiagnosticoModal** + integração com contacts.
7. **Preview iframe multi-device** + publicação/versionamento.
8. **JSON-LD dinâmico** substituindo o estático atual.

## Detalhes técnicos

- Ícones dos diferenciais/processo: `LucideIconPicker` já existente.
- Drag-and-drop: `@dnd-kit/core` (já usado em outros admins).
- Estado: React Query + optimistic updates.
- Sanitização: DOMPurify em campos de texto rico.
- Validação: Zod schemas por seção.
- Realtime opcional: canal `site_page` para preview colaborativo (fase futura).
- Compat: mantém todas as rotas indexadas, canonical, sitemap.
- Tipagem: enum `site_section_kind` + tipos gerados via `supabase gen types`.

## Não incluso (fica para depois)

- A/B testing por seção.
- Multi-idioma da página (i18n).
- Editor WYSIWYG rich-text (usa markdown + preview).

Pronto para implementar. Confirma?