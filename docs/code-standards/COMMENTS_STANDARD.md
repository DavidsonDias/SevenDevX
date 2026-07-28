# Comentários — Padrão

## Quando comentar

Comente **decisões, restrições e armadilhas**:

- Workarounds de browser/plataforma (ex.: guarda de Service Worker em iframe)
- Regras de negócio não óbvias (pesos de forecast, SLA de incidentes)
- Requisitos de segurança (por que uma chamada usa RPC em vez de `select`)
- Ordem de operações sensível (ex.: registrar listener de auth **antes** de `getSession`)

## Quando não comentar

- Linhas autoexplicativas
- Repetir o nome da função em prosa
- Comentários "TODO" sem dono nem contexto — registre em [technical-debt](../technical-debt/README.md)

## Seções internas

Arquivos grandes (> ~200 linhas) podem usar separadores. **Não** usar em arquivos pequenos.

```ts
// ============================================================================
// 📦 IMPORTS
// ============================================================================

// ============================================================================
// 🧩 TYPES
// ============================================================================

// ============================================================================
// ⚙️ CONFIGURATION
// ============================================================================

// ============================================================================
// 🧠 BUSINESS LOGIC
// ============================================================================

// ============================================================================
// 🎨 COMPONENT
// ============================================================================

// ============================================================================
// 📤 EXPORTS
// ============================================================================
```

## Idioma

Português (pt-BR) para descrições; termos técnicos e tags TSDoc em inglês.

## Proibido

- Expor segredos, tokens, URLs de projeto ou chaves em comentários.
- Comentar código morto — remover.
