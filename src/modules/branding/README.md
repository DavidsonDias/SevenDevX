# Branding Module

## Objetivo

Edição e curadoria da identidade visual usada pelo SevenOS e pelo site.

## Estrutura

| Arquivo | Responsabilidade |
|---|---|
| `LogoEditorModal.tsx` | Edição/ajuste de logo e geração de variações |

## Relação com o core

O motor de marca vive em [`src/core/branding`](../../core/README.md): `brandKit.ts` e `palette-engine/` (extração de paleta, tokens e marcas conhecidas). Este módulo é a camada de interface sobre esse motor.

## Data flow

```text
Upload / URL de logo
  → brand-scan (Edge Function) ou extração local
  → palette-engine (paleta + tokens)
  → branding_assets / logo_variations
  → LogoRenderer (renderização canônica)
```

## Tabelas

`branding_assets` · `logo_variations`

## Edge Functions

`brand-scan` · `logo-variations-ai`

## Superfícies

`/admin/brand-studio` · `/admin/logo-lab` · `/admin/logo-library`

## Pontos de atenção

- A renderização final de logo é responsabilidade do renderer canônico — ver [ADR-001](../../../docs/adr/ADR-001-logo-renderer.md).
- Assets grandes em base64 impactam export/backup; validar tamanho antes de persistir.
- Cores extraídas alimentam tokens; não hardcodar hex em componentes.
