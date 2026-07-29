# components/admin/finance — Blocos financeiros

Componentes financeiros embutidos nas telas de projeto do SevenOS.

## Estrutura

| Arquivo | Responsabilidade |
|---|---|
| `ProjectFinanceBlock.tsx` | Orçamento, transações e margem do projeto (RPC `fn_project_margin`) |
| `TimeTrackerWidget.tsx` | Apontamento de horas que alimenta o custo do projeto |

## Regras

- Cálculo monetário sempre via `src/lib/money.ts` — nada de aritmética direta em `number` para exibição.
- Escrita em `transactions`, `project_budgets` e `time_entries` é restrita a admin por RLS.
- Toda alteração é auditada em `audit_log`.

## Documentação relacionada

[MODULE_MAP](../../../../docs/architecture/MODULE_MAP.md) · [RPC_FUNCTIONS](../../../../docs/database/RPC_FUNCTIONS.md)
