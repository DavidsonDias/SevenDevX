# lib — Bibliotecas de domínio

Funções utilitárias com regra de negócio ou integração técnica, sem dependência de UI.

## Estrutura

| Arquivo | Responsabilidade |
|---|---|
| `utils.ts` | `cn()` — composição de classes Tailwind |
| `money.ts` | Formatação e cálculo monetário |
| `colorExtract.ts` | Extração de cor de imagem (suporte ao motor de marca) |
| `contractBuilder.ts` | Montagem de contratos a partir de dados do projeto |
| `storage.ts` | Acesso ao Storage do backend (bucket privado, URLs assinadas) |

## Regras

- Funções puras sempre que possível; efeitos concentrados em `storage.ts`.
- Valores monetários não devem ser manipulados como float solto na UI — usar `money.ts`.
- `storage.ts` nunca usa `getPublicUrl` para o bucket `attachments` (ver [ADR-002](../../docs/adr/ADR-002-private-storage.md)).
- Nada aqui importa React.

## Convenções

`camelCase.ts`, exports nomeados, tipos junto da função.
