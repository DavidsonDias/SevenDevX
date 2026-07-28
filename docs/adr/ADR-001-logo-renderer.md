# ADR-001 — Renderização centralizada de logos e identidade de marca

## Status

Accepted

## Context

Logos de tecnologias, providers e da própria marca eram renderizados por implementações distintas (SVG local, URL remota, ícone genérico, cor sólida como fallback). Isso gerou casos em que o card de tecnologia mostrava apenas a cor, sem o ícone, e divergência visual entre admin e site público.

## Decision

Centralizar a resolução visual em uma cadeia única:

```text
tech_registry / branding_assets (fonte de dados)
  ↓ useRegistry / useLogoOverrides
TechIcon · TechIconCDN · ProviderLogo (renderers)
  ↓
TechShowcase · ProjectPickerModal · TechPickerModal · Site Creation CMS · Marketplace
```

Cores derivadas passam pelo Brand Palette Engine (`src/core/branding/palette-engine`).

## Consequences

### Positive
- Identidade visual consistente entre admin e site público.
- Um único ponto para corrigir fallback de ícone.
- Overrides de logo aplicáveis globalmente.

### Negative
- Consumidores antigos precisam migrar para os renderers canônicos.
- Dependência de CDN para alguns logos exige fallback explícito.
