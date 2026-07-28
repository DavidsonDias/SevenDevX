# SevenDevX Enterprise Code Documentation Standard

**Versão:** v1.0

Padrão oficial de documentação de código do ecossistema SevenDevX (site público + SevenOS).

---

## Objetivo

Transformar o código-fonte em uma base **autoexplicativa, navegável e auditável**, onde qualquer engenheiro consiga entender propósito, arquitetura e riscos de um arquivo sem depender do autor original.

## Regra principal

A documentação explica **por que** o código existe, **como** ele se encaixa no sistema e **quais cuidados** existem — não o que cada linha faz.

```ts
// ❌ Ruim
// incrementa contador
counter++;

// ✅ Bom
/**
 * Incrementa a tentativa atual do processo de retry.
 * O contador é usado pela RetryPolicy para decidir o envio ao dead-letter (webhook_dlq).
 */
counter++;
```

---

## Componentes do padrão

| Documento | Escopo |
|---|---|
| [FILE_HEADERS.md](FILE_HEADERS.md) | Cabeçalhos adaptativos (Level 1/2/3) |
| [TSDOC_STANDARD.md](TSDOC_STANDARD.md) | Documentação de funções, hooks, services e tipos |
| [COMMENTS_STANDARD.md](COMMENTS_STANDARD.md) | Comentários inline e seções internas |
| [README_STANDARD.md](README_STANDARD.md) | README por diretório/módulo |
| [ARCHITECTURE_DOCUMENTATION.md](ARCHITECTURE_DOCUMENTATION.md) | Diagramas, data flow e source of truth |
| [NAMING_CONVENTIONS.md](NAMING_CONVENTIONS.md) | Nomenclatura de arquivos, símbolos e rotas |
| [DOCUMENTATION_CHECKLIST.md](DOCUMENTATION_CHECKLIST.md) | Checklist de PR e Definition of Done |

---

## Princípios inegociáveis

1. **Documentação não pode mentir.** Nada de Lighthouse score, bundle size, cobertura ou "testado em X" sem medição real. Use `Target: LCP < 2.5s`.
2. **Documentação não altera comportamento.** Problemas encontrados vão para [/docs/technical-debt](../technical-debt/README.md), não para refatorações silenciosas.
3. **Sem redundância.** Comentar `const name = user.name;` é ruído.
4. **Sem legado.** Antes de escrever, leia a implementação atual e remova referências a arquiteturas antigas.
5. **Versão só quando faz sentido.** Prefira `@since` / `@updated` a inflar `@version` por comentário alterado.

---

## Regra de ouro

A documentação de um arquivo deve responder rapidamente:

- O que é este arquivo?
- Por que ele existe?
- Onde ele é utilizado?
- A qual módulo pertence?
- Quais dependências possui?
- Quais efeitos colaterais provoca?
- Existe requisito de segurança?
- Existe cuidado de performance?
- Como modificá-lo com segurança?
