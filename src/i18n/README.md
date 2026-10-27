# i18n — Internacionalização

Idioma da interface pública em **pt-BR** (padrão), **en** e **es**.

## Estrutura

| Arquivo | Responsabilidade |
|---|---|
| `LanguageContext.tsx` | Contexto de idioma, detecção do navegador, persistência e atributo `lang` do documento |
| `translations.ts` | Dicionário tipado das três línguas |
| `publicCopy.ts` | Índice de frases completas: reaproveita o dicionário tipado e preserva conteúdo editorial desconhecido |
| `publicCommercialCopy.ts` / `publicProjectCopy.ts` | Traduções revisadas de interface comercial e resumos de projetos |
| `usePublicCopy.ts` | Adaptação de apresentação para componentes e conteúdo legado do CMS |

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
- `copy(value)` traduz somente frases completas conhecidas. Não altera objetos, IDs, URLs, registros do CMS, caches ou partes de mensagens do usuário.
- Traduções de conteúdo legado são compatíveis por frase completa; ao editar o original, revisar também suas versões EN/ES. Conteúdo sem tradução revisada permanece no original.
- Não usar substituição de DOM, tradução por fragmentos ou chamadas externas automáticas para traduzir dados de clientes.
- Preços continuam em reais; as versões internacionais não fazem conversão de moeda.
- A preferência de idioma não cria versões indexáveis separadas. Não publicar `hreflang` apontando três idiomas para a mesma URL.

## Cobertura e limites editoriais — 2026-10-27

As rotas públicas usam a tradução de apresentação para menus, rodapé, telas comerciais, títulos, resumos conhecidos e mensagens auxiliares. A tradução existente em `translations.ts` continua sendo a fonte principal.

Artigos longos, cases, descrições extensas e novos textos cadastrados podem ainda não ter versões revisadas. O fallback é o original em português, sem inventar conteúdo nem sobrescrever o banco. Essa compatibilidade não equivale a uma certificação de que todos os artigos e registros estão traduzidos.

O case George Fiuza foi alinhado à barbearia do portfólio. Seu slug antigo foi preservado para links existentes. Métricas e prazos sem confirmação daquele registro não foram reaproveitados.

Depoimentos fixos, selos de verificação, percentuais de resultados e promessas de desempenho presentes no conteúdo legado ainda dependem de comprovação editorial do proprietário. Os testes de interface não comprovam tais afirmações.

## Validação

- `node --test scripts/public-i18n.test.mjs`: pares EN/ES, reaproveitamento do dicionário, fallback, imutabilidade, preservação de URLs/IDs e metadados.
- Conferir troca PT → EN → ES → PT e recarga em Home, Serviços, Loja, Projetos e Criação de Sites.
- Em cada rota, conferir apenas um canonical e uma descrição após montagem do Helmet. O HTML inicial mantém seus metadados de fallback para ambientes sem JavaScript.
- Conferir formulários sem enviar mensagens reais e preservar `viewport-fit=cover` do PWA.

## Escopo

O painel administrativo (SevenOS) é de uso interno e opera em pt-BR; a tradução cobre o site público.
