# Automations Module

## Objetivo

Permitir que a equipe defina regras que reagem a eventos do SevenOS sem escrever código.

## Estrutura

| Arquivo | Responsabilidade |
|---|---|
| `AutomationFlowBuilder.tsx` | Construção visual de gatilho → condição → ação |
| `automationTemplates.ts` | Modelos prontos de automação |
| `AutomationGuideDrawer.tsx` | Documentação in-app do funcionamento |

## Data flow

```text
Mutação de negócio → events
                   → automation-runner (job agendado)
                   → automations (regras ativas)
                   → execução da ação
                   → automation_runs (log de execução)
```

Entrega externa é delegada ao módulo de [webhooks](../webhooks/README.md).

## Tabelas

`automations` · `automation_runs` · `events`

## Edge Functions

`automation-runner`

## Superfícies

`/admin/automations` · `/admin/automations/runs`

## Pontos de atenção

- Automação nunca executa de forma síncrona dentro de trigger de banco — o barramento `events` desacopla.
- Toda execução é registrada em `automation_runs`, inclusive falhas, para diagnóstico.
- Alterar um template não altera automações já criadas a partir dele.
