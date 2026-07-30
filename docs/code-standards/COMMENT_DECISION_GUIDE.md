# Comment Decision Guide — SevenDevX

## Devo comentar isso?

```txt
É óbvio pelo código?                    → NÃO
Repete literalmente o código?           → NÃO
Explica regra de negócio?               → SIM
Explica motivo arquitetural?            → SIM
Explica workaround / débito temporário? → SIM
Explica boundary de segurança?          → SIM
Explica side effect não óbvio?          → SIM
Explica fallback ou ordem de resolução? → SIM
Explica decisão de performance?         → SIM (com motivo plausível)
Explica acessibilidade não trivial?     → SIM
```

## Antes e depois

```ts
// ❌ Busca projetos.
const { data } = usePrimaryProject();

// ✅
/**
 * O banco é a única fonte de verdade da vitrine:
 * `featured_level = primary` define o projeto principal da seção.
 */
const { data } = usePrimaryProject();
```

```tsx
{/* ❌ Botão */}
{/* ✅ PRIMARY PROJECT — featured_level="primary" */}
```

## Onde cada informação mora

| Informação | Local |
| --- | --- |
| Arquitetura ampla | `/docs` |
| Comportamento do módulo | `README.md` do diretório |
| Contrato de API | TSDoc na função/hook/componente |
| Motivo de uma decisão local | comentário junto ao código |

Não duplicar o mesmo conteúdo em mais de um nível — duplicação é a principal causa de documentação stale.

## Marcadores padronizados

```ts
// TODO(SEVEN-123): descrição objetiva do que falta.
// FIXME(SEVEN-456): comportamento incorreto conhecido.
// SECURITY(SEVEN-789): risco identificado e mitigação pendente.
// PERF(SEVEN-321): otimização pendente com impacto esperado.
```

Proibido: `// arrumar depois`, `// gambiarra`, `// não mexer`.

## Proteção contra documentação stale

Ao alterar arquitetura, data flow, contrato público, rota, tabela, Edge Function, provider ou modelo de segurança, verifique se também precisa atualizar:

```txt
README do diretório
TSDoc do símbolo alterado
ADR (se a decisão mudou)
docs/architecture/*
docs/database/*
docs/security/*
```

Ver também: [Code Anatomy](./CODE_ANATOMY.md) · [Comments Standard](./COMMENTS_STANDARD.md)
