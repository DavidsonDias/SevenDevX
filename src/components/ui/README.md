# components/ui — Design System

Primitivos de interface. Base em **shadcn/ui** (Radix + Tailwind) mais componentes visuais próprios da SevenDevX.

## Responsabilidade

Fornecer blocos genéricos, acessíveis e temáveis. Nenhum componente aqui conhece regra de negócio, rota ou tabela.

## Estrutura

| Grupo | Arquivos |
|---|---|
| Base shadcn/Radix | `button`, `card`, `dialog`, `drawer`, `sheet`, `table`, `tabs`, `form`, `input`, `select`, `command`, `popover`, `tooltip`, `toast`, `sonner`, `sidebar`, entre outros |
| Visual SevenDevX | `BorderBeam.tsx`, `BrandHalo.tsx`, `AppLoaderOrbital.tsx`, `AppLoaderOrbitalLogo.tsx` |
| Ícones | `LucideIconRender.tsx` — renderiza ícone Lucide por nome (usado pelos pickers do admin) |
| Marca | `logo/LogoRenderer.tsx` + `logo/index.ts` — renderer canônico de logo |

## Regras

- Arquivos gerados pelo shadcn seguem o upstream: **não** adicionar cabeçalho enterprise nem reescrever a API deles; customizações vão por variantes e tokens.
- Cores sempre por token semântico (`bg-background`, `text-foreground`, `border-border`).
- Componentes controlados expõem `value`/`onValueChange`; não guardar estado de domínio internamente.
- Acessibilidade do Radix não deve ser removida (labels, roles, foco).

## Documentação relacionada

[ADR-001 — renderização de logos](../../../docs/adr/ADR-001-logo-renderer.md)
