# core/branding — Motor de identidade visual

Lógica pura (sem React) que sustenta o Brand Studio, o Logo Lab e o realce dinâmico de providers.

## Estrutura

| Arquivo/Dir | Responsabilidade |
|---|---|
| `brandKit.ts` | Montagem do brand kit exportável (paleta, tokens e variações) |
| `palette-engine/extractPalette.ts` | Extração da paleta dominante de uma imagem |
| `palette-engine/knownBrands.ts` | Paletas conhecidas — evita resultado incorreto em logos monocromáticos |
| `palette-engine/tokens.ts` | Conversão da paleta em design tokens CSS |
| `palette-engine/index.ts` | Superfície pública do motor |

## Fluxo

```text
Imagem da marca
  ↓ extractPalette
Paleta dominante  ──(override)── knownBrands
  ↓ tokens
CSS custom properties
  ↓ brandKit
Brand kit exportável (ZIP)
```

## Regras

- Camada pura: sem hooks, sem Supabase, sem DOM além de `canvas` para leitura de pixels.
- `knownBrands` tem precedência sobre a extração automática.
- Tokens gerados devem manter contraste legível em tema claro e escuro.

## Documentação relacionada

[ADR-001](../../../docs/adr/ADR-001-logo-renderer.md) · [MODULE_MAP](../../../docs/architecture/MODULE_MAP.md)
