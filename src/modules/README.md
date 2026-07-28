# modules — Funcionalidades de domínio (SevenOS)

Diferente de `src/components`, aqui vivem componentes **acoplados a um domínio** do SevenOS.

## Responsabilidade

Encapsular a experiência completa de um domínio (UI + orquestração), consumindo hooks de dados e Edge Functions.

## Estrutura

| Módulo | Responsabilidade |
|---|---|
| [`integrations/`](integrations/README.md) | Providers externos, configuração, testes e logs |
| [`automations/`](automations/README.md) | Construção e documentação de automações |
| [`webhooks/`](webhooks/README.md) | Depuração e inspeção de webhooks |
| [`notifications/`](notifications/README.md) | Central de notificações |
| [`onboarding/`](onboarding/README.md) | Checklist e tour guiado |
| [`system-health/`](system-health/README.md) | Saúde, atividade em tempo real e recomendações |
| [`users/`](users/README.md) | Detalhes e gestão de usuários |
| [`branding/`](branding/README.md) | Edição de logos e identidade |
| [`layout/`](layout/README.md) | Navegação flutuante e mobile do SevenOS |

## Regras

- Um módulo não importa componentes internos de outro módulo; a integração acontece por hooks, rotas ou eventos.
- Componentes genéricos que surgirem aqui devem ser promovidos a `src/components`.
- Cada módulo mantém seu README atualizado com tabelas e Edge Functions envolvidas.

## Documentação relacionada

[MODULE_MAP](../../docs/architecture/MODULE_MAP.md) · [DATA_FLOW](../../docs/architecture/DATA_FLOW.md)
