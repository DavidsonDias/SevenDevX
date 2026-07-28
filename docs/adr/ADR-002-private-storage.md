# ADR-002 — Bucket `attachments` privado com URLs assinadas

## Status

Accepted

## Context

Anexos incluem documentos de projeto, contratos e materiais de clientes. Um bucket público exporia esses arquivos a qualquer pessoa que descobrisse a URL, sem trilha de acesso.

## Decision

O bucket `attachments` é privado. Todo acesso a arquivo ocorre por `createSignedUrl` com expiração. `getPublicUrl` é proibido para esse bucket.

## Consequences

### Positive
- Documentos de clientes não ficam acessíveis por URL adivinhada.
- Expiração limita compartilhamento acidental.

### Negative
- URLs não podem ser cacheadas indefinidamente pelo browser nem pelo Service Worker.
- Pré-visualizações exigem geração de URL sob demanda (`FilePreview.tsx`, `useAttachments.ts`).
