# Code Anatomy — SevenDevX

Ordem recomendada das seções dentro de um arquivo. Use **somente** as seções que existem de fato no arquivo; um componente simples não precisa de dez divisores.

```txt
FILE HEADER          → @file, @module, @description (Onda 1–6, já aplicado)
IMPORTS              → externos → internos → tipos
TYPES & CONTRACTS    → props, DTOs, unions de domínio
CONFIGURATION        → constantes nomeadas, limites, chaves de cache
BUSINESS RULES       → regras de produto explicadas em prosa
STATE & DATA FLOW    → estados, queries, mapa de fluxo
HOOKS & SIDE EFFECTS → effects, subscriptions, timers, storage
INTERNAL COMPONENTS  → componentes locais do arquivo
MAIN COMPONENT       → export principal
EXPORTS              → re-exports e helpers públicos
```

## Divisores

```ts
// ============================================================================
// 🧩 TYPES & CONTRACTS
// ============================================================================
```

Emojis canônicos: 📦 imports · 🧩 types · ⚙️ config · 🧠 business rules · 🔄 state/data flow · 🪝 hooks/side effects · 🎨 internal components · 🏗️ main · 📤 exports · 🔐 security · 🪟 modal · 🃏 card.

## Densidade documental

| Nível | Quando | O que documentar |
| --- | --- | --- |
| **Simple** | componente de apresentação, helper de 1 linha | cabeçalho `@file` apenas |
| **Standard** | componente com props públicas, hook simples | TSDoc nas APIs + 2–3 divisores |
| **Complex** | fluxo com state, queries, fallbacks | state, business rules, side effects, data flow |
| **Critical** | auth, RBAC, financeiro, contratos, edge functions | tudo acima + `SECURITY`, failure modes, observabilidade |

## Exemplos

### Simple

```ts
/** Formata centavos em BRL para exibição. */
export const formatBRL = (cents: number) => ...
```

### Standard

```ts
// ============================================================================
// 🧩 TYPES & CONTRACTS
// ============================================================================

/** Contrato do card de projeto destacado. */
interface ProjectCardProps {
  /** Projeto renderizado. */
  project: Project;
  /** Abre o modal com o projeto selecionado. */
  onOpen: (project: Project) => void;
}
```

### Complex

```ts
/**
 * DATA FLOW
 *
 * Supabase → useProjects → usePrimaryProject / useSecondaryFeaturedProjects
 *          → FeaturedProjects → FeaturedModal
 */
```

### Critical

```ts
// ============================================================================
// 🔐 AUTHORIZATION
// ============================================================================

/**
 * SECURITY
 *
 * O JWT é validado antes de qualquer leitura de secret ou chamada externa.
 * O frontend nunca recebe o valor bruto do secret — somente metadata mascarada.
 */
```

## Regras

- Não duplicar o cabeçalho existente do arquivo.
- Não comentar JSX óbvio (`{/* Título */}`); comentar blocos conceituais.
- Não inventar métricas (bundle, Lighthouse, cobertura de browsers).
- Extrair constantes/interfaces apenas quando for semanticamente neutro e melhorar manutenção.

Ver também: [Comment Decision Guide](./COMMENT_DECISION_GUIDE.md) · [TSDoc Standard](./TSDOC_STANDARD.md) · [File Headers](./FILE_HEADERS.md)

---

## Ordem canônica validada

`npm run docs:sections:check` valida presença, unicidade, preenchimento e ordem:

```txt
FILE HEADER → IMPORTS → TYPES & CONTRACTS → CONSTANTS & CONFIGURATION
→ BUSINESS RULES & INVARIANTS → VALIDATION → STATE → HOOKS & SIDE EFFECTS
→ BUSINESS LOGIC → INTERNAL COMPONENTS → MAIN COMPONENT → REQUEST HANDLER → EXPORTS
```

A ordem é adaptativa: seções inexistentes não são exigidas. São reportados como erro: seções duplicadas, seções vazias (divisor sem conteúdo), seções fora de ordem e `import` posicionado depois da lógica.

## Regras de negócio próximas da implementação

Arquivos críticos (financeiro, contratos, auth, RBAC, integrações, webhooks, automações, uploads privados, Edge Functions, RLS, secrets) devem conter:

```ts
// ============================================================================
// 🔒 BUSINESS RULES & INVARIANTS
// ============================================================================
```

Somente invariantes comprovadas pelo código — nunca regras genéricas.
