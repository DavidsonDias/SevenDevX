# components/admin/integrations — Integrações no contexto do projeto

## Estrutura

| Arquivo | Responsabilidade |
|---|---|
| `ProjectIntegrationsBlock.tsx` | Providers vinculados ao projeto, estado da conexão e atalho para teste |

## Regras

- Nenhum segredo trafega pelo cliente: configuração e testes ocorrem em Edge Functions.
- Credenciais são sempre exibidas mascaradas.
- O logo do provider vem do renderer global, nunca de URLs improvisadas.

## Documentação relacionada

[INTEGRATIONS](../../../../docs/architecture/INTEGRATIONS.md) · [ADR-001](../../../../docs/adr/ADR-001-logo-renderer.md)
