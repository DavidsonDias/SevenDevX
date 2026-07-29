# components/security — Barreiras de interface

Componentes que comunicam restrições de acesso ou pré-requisitos não atendidos.

## Estrutura

| Arquivo | Responsabilidade |
|---|---|
| `Blocker.tsx` | Substitui o conteúdo por um estado explicativo quando falta permissão ou configuração |

## Regras

- Nunca revelar dados sensíveis na mensagem de bloqueio (nomes de tabelas, IDs internos, motivos de RLS).
- O bloqueio é visual: a proteção real ocorre em RLS e nas Edge Functions.

## Documentação relacionada

[SECURITY](../../../docs/security/README.md) · [AUTHORIZATION](../../../docs/security/AUTHORIZATION.md)
