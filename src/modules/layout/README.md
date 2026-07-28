# Layout Module (SevenOS)

## Objetivo

Navegação flutuante e mobile do painel administrativo.

## Estrutura

| Arquivo | Responsabilidade |
|---|---|
| `GlobalFAB.tsx` | Botão de ação flutuante global |
| `RadialActionMenu.tsx` | Menu radial de ações rápidas |
| `MobileBottomNav.tsx` | Navegação inferior focada no fluxo diário (Home, Projetos, FAB, Contatos, Pipeline) |

## Regras

- Mobile-first: usar `w-full overflow-x-hidden`; nunca `w-screen` ou `100vw`.
- Elementos flutuantes não podem cobrir ações primárias nem o teclado virtual.
- Visibilidade condicionada à sessão e ao papel do usuário.
- Animações com Framer Motion, respeitando `prefers-reduced-motion`.

## Relacionados

O layout estrutural das páginas admin fica em `src/components/admin/AdminPageShell.tsx` (header com auto-hide) e `AdminMenu.tsx`.
