# components — Componentes de interface

Componentes reutilizáveis do site público e do SevenOS.

## Responsabilidade

Camada de apresentação. Não contém regra de negócio nem acesso direto ao backend — dados chegam por props ou por hooks de `src/hooks`.

## Estrutura

| Diretório/Arquivo | Responsabilidade |
|---|---|
| [`ui/`](ui/README.md) | Design System (shadcn/Radix) e primitivos SevenDevX |
| [`admin/`](admin/README.md) | Componentes do SevenOS |
| `layout/` | Estruturais (`Container`, `Section`) |
| `auth/` | `ProtectedRoute` — guarda de navegação |
| `security/` | `Blocker` — bloqueio de interação |
| `services/` | Blocos da página de serviços (`FAQSection`, `ProcessSection`) |
| `Header.tsx` / `Footer.tsx` | Navegação pública e rodapé |
| `Hero.tsx` | Seção principal da home (vídeo otimizado, LCP) |
| `SEOHead.tsx`, `BreadcrumbSchema.tsx`, `EntityGraphSchema.tsx`, `GeoKnowledgeGraph.tsx` | Metadados, JSON-LD e sinais GEO |
| `ProjectCard3D.tsx`, `PortfolioCarousel3D.tsx`, `TestimonialsCarousel3D.tsx`, `ServiceCard3D.tsx` | Interações 3D com tilt |
| `TechIcon.tsx`, `TechIconCDN.tsx`, `TagIcon.tsx`, `TechShowcase.tsx`, `TechModal.tsx`, `TechPreview.tsx` | Exibição de tecnologias e tags |
| `Contact.tsx`, `ContactMultiStep.tsx`, `DiagnosticoModal.tsx`, `OrcamentoModal.tsx`, `OrcamentoButton.tsx`, `ExitIntentPopup.tsx` | Fluxos de conversão |
| `AIChatbot.tsx`, `WhatsAppButton.tsx` | Canais de atendimento |
| `AppInstallerButton.tsx`, `PWAUpdatePrompt.tsx`, `OfflineIndicator.tsx` | Experiência PWA |
| `PageTransition.tsx`, `ScrollToTop.tsx`, `SectionDivider.tsx`, `SkeletonLoader.tsx`, `GlassCard.tsx` | Transição, layout e estados |
| `LanguageSwitcher.tsx` | Troca de idioma |

## Regras

- Componentes globais permanecem desacoplados de regra de negócio; lógica de domínio do SevenOS fica em `src/modules`.
- Sem cores hardcoded: usar tokens semânticos do design system.
- Efeitos 3D e parallax devem ser desativados em mobile.
- Modais usam `useScrollLock` para bloquear scroll com compensação de scrollbar.
- Imagens precisam de `alt`; interações precisam de foco visível (WCAG 2.1 AA como alvo).

## Convenções

`PascalCase.tsx`, um componente principal por arquivo, props tipadas explicitamente.

## Dependências relacionadas

TailwindCSS · Framer Motion · shadcn/ui (Radix) · lucide-react
