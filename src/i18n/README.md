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

## Artigos completos — 2026-10-28

Os 13 artigos de Answers e Conhecimento têm versões completas EN/ES: título, resumo, corpo, FAQ e palavras-chave. `editorial/resolve.ts` verifica completude e revisão do original; tradução ausente ou desatualizada retorna o artigo inteiro em português. O idioma dos metadados acompanha o conteúdo efetivamente exibido.

Os títulos compartilhados ficam em um índice pequeno; o corpo dos artigos permanece no carregamento da rota. A referência antiga à Lovable no artigo sobre IA foi substituída por uma arquitetura de referência com processamento OpenAI no servidor.

Essa cobertura não inclui automaticamente artigos do Blog/CMS, cases ou descrições extensas de projetos. Valores e prazos continuam estimativas do conteúdo comercial e dependem da proposta; tradução não comprova resultados ou depoimentos.

Validação adicional: `node --test scripts/editorial-i18n.test.mjs` confere os 13 artigos, revisões, fallback integral, estrutura, títulos compartilhados e preservação dos identificadores.


## Blog, cases e projetos — 2026-10-28

Os 12 artigos publicados do Blog têm adaptações editoriais completas EN/ES, com exemplos de código preservados literalmente. As traduções revisam a redação de promessas absolutas e deixam estimativas ou resultados relatados em contexto; não são certificação dos indicadores. O fingerprint abrange título, resumo e conteúdo: qualquer mudança no CMS retorna o artigo inteiro ao português até revisão. Os títulos/resumos para listagens ficam separados do corpo carregado pela rota.

Os 10 cases têm versões completas com revisão do original e metadados no idioma efetivamente mostrado. Os textos dos 26 projetos públicos atuais têm cobertura EN/ES; a página de detalhe usa fallback integral quando uma descrição não é conhecida. Nomes, identificadores, links, datas e dados originais não são reescritos no banco.

O Blog renderiza tabelas e listas com GFM, mantém exemplos de código, trata respostas fora de ordem e impede exibir o artigo anterior após falha de navegação. Links legados /contact no Markdown levam à seção pública /#contact. Conteúdo HTML bruto continua sem execução.

Limites: novos conteúdos exigem tradução revisada. CT031 contém o marcador TESTE no cadastro público e precisa de texto final do proprietário. Resultados numéricos, depoimentos e promessas de saúde/privacidade/performance do conteúdo original continuam sujeitos à comprovação editorial; não foram certificados por testes de software. As fixtures de teste contêm somente textos que já estavam publicados.


## Public route and section coverage (2026-10-28)

The public-route dictionary now covers the 116-provider catalogue (plus its custom fallback), 39 technology descriptions, all programmatic service/industry descriptions, current CMS process steps, shared PWA/install/offline messages, diagnostic form labels and OAuth feedback. Lazy-loaded technology and portfolio showcases must apply `copy` inside each card/modal, not only in their parent page. Category IDs, provider IDs, URLs, prices and customer-entered values remain unchanged. Named messages use `message(template, values)`; interpolated values are not translated recursively.

Verification: 133 continuity/localization tests; TypeScript; production build and PWA artifact check; browser section checks on 16 public routes in both English and Spanish, plus home, integrations, solution/city/case details, authentication, reset and OAuth failure presentation. Technology modal and chat welcome were checked without submitting leads, sending chat messages, or changing accounts. Browser evidence is retained locally under `evidence/route-i18n-browser.json`.

Limits: new or edited CMS/editorial content requires reviewed translations and retains its source text when absent; the test catalogue is not a guarantee for future content. Public case metrics and commercial claims were preserved, not independently verified. The public content map also contains pre-existing links to unpublished articles; no articles were fabricated in this translation change. Private SevenOS screens are outside this public-site translation scope.
