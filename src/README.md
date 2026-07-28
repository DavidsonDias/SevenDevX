# src — Código-fonte

Aplicação React (Vite + TypeScript) que entrega **duas superfícies**: o site público **SevenDevX** e o ERP/CRM interno **SevenOS** (`/admin/*`).

## Responsabilidade

Concentrar todo o código de frontend. Regras que exigem segredo, privilégio elevado ou integração externa **não** vivem aqui — vivem em `supabase/functions`.

## Estrutura

| Diretório/Arquivo | Responsabilidade |
|---|---|
| `main.tsx` | Bootstrap, guarda de Service Worker em iframe/preview |
| `App.tsx` | Composição raiz da aplicação |
| [`app/`](app/README.md) | Providers globais e roteamento |
| [`components/`](components/README.md) | Componentes de UI reutilizáveis |
| [`contexts/`](contexts/README.md) | Contextos globais (auth) |
| [`core/`](core/README.md) | Engines de domínio transversal (branding) |
| [`data/`](data/README.md) | Conteúdo estático tipado |
| [`hooks/`](hooks/README.md) | Camada de acesso a dados e comportamento reutilizável |
| [`i18n/`](i18n/README.md) | Idioma e traduções (pt/en/es) |
| `integrations/supabase/` | Cliente e tipos **auto-gerados** — nunca editar |
| [`lib/`](lib/README.md) | Bibliotecas utilitárias de domínio |
| [`modules/`](modules/README.md) | Funcionalidades de domínio do SevenOS |
| [`pages/`](pages/README.md) | Páginas públicas, GEO e administrativas |
| [`utils/`](utils/README.md) | Utilitários de plataforma e browser |
| `assets/` | Imagens, ícones e vídeos |
| `sw.ts` | Service Worker (PWA) |
| `index.css`, `fonts.css`, `App.css` | Design tokens e estilos globais |

## Regras

- Cores, gradientes e sombras vêm de **tokens semânticos** em `index.css`; não usar utilitários fixos como `text-white` ou `bg-[#...]`.
- Componentes de apresentação não fazem query direta ao backend — usar hooks.
- Autorização real é RLS; guardas de rota são apenas UX.
- Mobile-first: `w-full overflow-x-hidden`; nunca `w-screen`/`100vw`.
- Animação com Framer Motion.

## Convenções

Componentes `PascalCase.tsx` · Hooks `useCamelCase.ts` · Utilities `camelCase.ts`. Ver [NAMING_CONVENTIONS](../docs/code-standards/NAMING_CONVENTIONS.md).

## Documentação relacionada

[Portal de docs](../docs/README.md) · [System Overview](../docs/architecture/SYSTEM_OVERVIEW.md) · [Module Map](../docs/architecture/MODULE_MAP.md)
