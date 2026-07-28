# README por diretório — Padrão

## Onde criar

✅ Criar em: `src/`, `src/app`, `src/components`, `src/components/ui`, `src/components/admin`, `src/contexts`, `src/core`, `src/data`, `src/hooks`, `src/i18n`, `src/lib`, `src/modules` (e cada módulo), `src/pages`, `src/utils`, `supabase/functions`.

❌ Não criar em: pastas de assets, ícones, pastas com um único arquivo trivial.

## Template

```md
# <Nome>

Frase única descrevendo o diretório.

## Responsabilidade

O que este diretório resolve e o que ele **não** resolve.

## Estrutura

| Diretório/Arquivo | Responsabilidade |
|---|---|
| `x.tsx` | ... |

## Regras

- Restrições arquiteturais aplicáveis.

## Convenções

Componentes `PascalCase.tsx` · Hooks `useCamelCase.ts` · Utilities `camelCase.ts`

## Dependências relacionadas

- ...
```

## Para módulos

READMEs de módulo (`src/modules/*`) adicionam:

- **Objetivo**
- **Recursos**
- **Arquitetura** (ASCII/Mermaid)
- **Data flow**
- **Tabelas e Edge Functions relacionadas**
- **Pontos de atenção**

## Regra de veracidade

Só liste arquivos, providers, tabelas e rotas que **existem**. Ao mover/remover código, atualize o README no mesmo commit.
