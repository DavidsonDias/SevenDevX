# components/services — Blocos da página de serviços

Seções reutilizadas pela página `/services` e por landings públicas.

## Estrutura

| Arquivo | Responsabilidade |
|---|---|
| `FAQSection.tsx` | FAQ alimentado por `faq_items`, com JSON-LD `FAQPage` |
| `ProcessSection.tsx` | Linha do tempo do processo de trabalho |

## Regras

- Conteúdo vem do CMS (`faq_items`, `services_cms`) — não duplicar texto no código.
- Apenas uma `FAQPage` estruturada por documento para não conflitar no schema.
- Animações seguem a física de mola global (Framer Motion).

## Documentação relacionada

[MODULE_MAP](../../../docs/architecture/MODULE_MAP.md) · [TABLES](../../../docs/database/TABLES.md)
