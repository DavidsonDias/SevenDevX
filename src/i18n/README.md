# i18n — Internacionalização

Idioma da interface pública em **pt-BR** (padrão), **en** e **es**.

## Estrutura

| Arquivo | Responsabilidade |
|---|---|
| `LanguageContext.tsx` | Contexto de idioma, detecção do navegador, persistência e atributo `lang` do documento |
| `translations.ts` | Dicionário tipado das três línguas |

## Comportamento

```text
getInitialLanguage()
  → safeStorage("sevendevx-language")
  → fallback: navigator.language (es | en | pt)
setLanguage(lang)
  → estado + persistência + document.documentElement.lang
```

## Regras

- Consumir via `useLanguage()`; nunca ler o storage diretamente.
- Toda chave nova deve existir nos três idiomas — a tipagem de `Translations` impede omissão.
- Não concatenar frases: use uma chave completa por mensagem.
- `pt` mapeia para `pt-BR` no atributo `lang` (SEO e acessibilidade).

## Escopo

O painel administrativo (SevenOS) é de uso interno e opera em pt-BR; a tradução cobre o site público.
