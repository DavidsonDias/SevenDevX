# components/layout — Estrutura visual

Primitivas de layout usadas por páginas públicas e administrativas.

## Estrutura

| Arquivo | Responsabilidade |
|---|---|
| `Container.tsx` | Largura máxima e gutters responsivos padronizados |
| `Section.tsx` | Bloco vertical com espaçamento fluido entre seções |

## Regras

- Sem regra de negócio e sem acesso a dados.
- Nunca usar `w-screen` ou `100vw` — o padrão mobile-first do projeto exige `w-full` com `overflow-x-hidden`.
- Espaçamentos derivam de tokens Tailwind; evitar valores mágicos.

## Documentação relacionada

[SYSTEM_OVERVIEW](../../../docs/architecture/SYSTEM_OVERVIEW.md)
