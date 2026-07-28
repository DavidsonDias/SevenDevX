# core — Engines transversais

Lógica de domínio independente de UI, reutilizada por múltiplos módulos.

## Estrutura

| Diretório/Arquivo | Responsabilidade |
|---|---|
| `branding/brandKit.ts` | Composição do kit de marca (tokens, ativos e metadados) |
| `branding/palette-engine/index.ts` | Ponto de entrada do motor de paleta |
| `branding/palette-engine/extractPalette.ts` | Extração de cores dominantes a partir de imagem/logo |
| `branding/palette-engine/knownBrands.ts` | Cores oficiais de marcas conhecidas (evita extração imprecisa) |
| `branding/palette-engine/tokens.ts` | Conversão da paleta em tokens de design |

## Data flow

```text
Logo/imagem → extractPalette (ou knownBrands) → tokens → brandKit
            → consumidores: Brand Studio, Logo Lab, ProviderLogo, marketplace
```

## Regras

- Sem dependência de React ou de componentes: funções puras e testáveis.
- Sem acesso direto ao backend; quem persiste é o módulo/hook consumidor.
- Marca conhecida tem precedência sobre extração automática.
- Saída sempre em tokens semânticos, nunca hex fixo em componente.

## Documentação relacionada

[ADR-001](../../docs/adr/ADR-001-logo-renderer.md)
