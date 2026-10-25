# SevenDevX — Auditoria PWA / Android — 25-10-2026

## Estado
Correção preparada para prévia. Sem autorização de publicação em produção nesta tarefa. Não se declara a faixa nativa do Galaxy S24 Ultra corrigida antes de validar a versão corrigida instalada no aparelho.

## Diagnóstico comprovado
Em produção, antes desta correção, o HTML possuía dois links de manifesto, nesta ordem:
1. `/manifest.json`: `theme_color: #ffffff`, fundo preto, Cache-Control `public, max-age=86400`.
2. `/manifest.webmanifest`: `theme_color: #000000`, fundo preto, revalidação imediata.

O primeiro vinha de public/manifest.json e era referenciado manualmente no HTML. O segundo era injetado pelo VitePWA. Os dois representavam a mesma aplicação com metadados conflitantes. Essa é uma causa de configuração real para a instalação receber branco e para a correção anterior no Vite não alcançar o manifesto legado; não é prova de qual manifesto o pacote já instalado no telefone efetivamente reteve.

Todos os dez caminhos de ícones declarados no manifesto gerado estavam ausentes. Os quatro assets legados com extensão .png eram JPEGs de 1920x1920, incompatíveis com o formato e as dimensões declaradas. Não foram removidos, pois podem ter outros consumidores. Screenshots anunciados apenas pelo manifesto gerado também não existiam.

## Comparação somente leitura
| Componente | SevenDevX antes | DavidsonDias_Portfolio | PsicoOne |
|---|---|---|---|
| Fonte | Estático + Vite gerado conflitantes | public/manifest.json único | public/manifest.json, Vite manifest:false |
| theme_color HTML/manifest | preto no HTML; branco/preto nos manifests | #00d4ff em ambos | #3B82F6 em ambos |
| background_color manifesto | preto | preto | branco |
| display | standalone | standalone com overrides desktop | standalone |
| start_url / scope / id | /; estático sem scope/id explícitos | /?utm_source=pwa; /; / | /; /; id omitido |
| orientation | somente gerado any | any | any |
| viewport | viewport-fit=cover | sem cover | sem cover |
| status iOS | black-translucent, agora centralizado no HTML | black-translucent | default |
| CSS | dark fixo e fundos pretos | paleta escura/ciano, classe de tema | vários temas com color-scheme |

A correspondência de cores nos projetos de referência é compatível com theme_color consistente; não demonstra transparência nativa nem exclui diferenças de navegador/instalação. display_override do Portfólio não controla a cor inferior do Android e não foi copiado. Nenhum repositório de referência foi modificado. NutriSmart foi usado como referência visual, sem repositório fornecido.

Fontes: [Portfólio](https://github.com/DavidsonDias/DavidsonDias_Portfolio/blob/main/public/manifest.json), [PsicoOne](https://github.com/DavidsonDias/PsicoOne/blob/main/public/manifest.json).

## Implementação mínima
- `public/manifest.json`: fonte única preta, mantém nome, start_url e identidade efetiva `/`; explicita scope/id/orientation/lang. Preserva atalhos SevenOS antes anunciados pelo gerado, com ícones válidos.
- `vite.config.ts`: manifest:false, mantendo injectManifest, SW e segurança de atualização existentes. O link estático do HTML permanece único.
- `public/pwa/`: PNGs versionados 192/512 e máscara 512 gerados da arte existente; máscara com margem para a zona segura. Sem redesenho da marca, sem substituir assets antigos em cache imutável.
- `vercel.json`: alias de /manifest.webmanifest para /manifest.json antes do fallback SPA; os dois endereços revalidam. Não muda redirects de domínio, CSP ou demais rotas.
- `scripts/check-pwa-manifest.mjs`: verifica o HTML efetivamente construído, link único, tema/fundo pretos, identidade estável, assinatura PNG, dimensões e existência de todos os ícones/atalhos, alias legado e cache.
- `package.json`: executa a verificação após vite build, inclusive na CI.

Não foram acrescentados novos hacks de altura/overflow/CSS, bibliotecas, mudanças de autenticação, banco, APIs, integrações ou navegação SevenOS. Os fundos html/body e o esquema dark atuais já são pretos; App.css legado não é importado pela entrada atual. Não há evidência de que seu padding de #root produza a barra nativa branca.

## Comportamento visual e limites reais
A barra superior de notificações, a faixa inferior de gestos, o header HTML e o dock SevenOS são elementos diferentes. CSS só pinta os pixels do viewport que o navegador entrega à página.

Mantidos os tratamentos existentes: home deixa o inset superior exposto ao Hero; demais páginas e admin pintam o inset superior preto; inset inferior exposto fica preto. theme_color e background_color permanecem pretos como fallback nativo. iOS mantém black-translucent, padding seguro e fundo preto fora da home.

Não há amostragem de frames, animação de theme-color, fullscreen forçado ou ocultação de indicadores. Transparência nativa superior no Android depende de edge-to-edge do navegador/versão; não é garantida por theme-color. Instalações existentes podem reter metadados do pacote; atualização do SW não prova atualização do pacote instalado.

Referências primárias: [Chrome edge-to-edge](https://developer.chrome.com/docs/css-ui/edge-to-edge), [Apple status bar](https://developer.apple.com/library/archive/documentation/AppleApplications/Reference/SafariHTMLRef/Articles/MetaTags.html), [Chromium problema histórico de cor inferior](https://issues.chromium.org/issues/40759522).

## Validação executada
- Build completo aprovado, incluindo a verificação de artefato PWA.
- 243 testes locais elegíveis aprovados; os dois testes Postgres isolados e Deno não executados.
- Typecheck: resultado registrado na evidência local/CI.
- Lint global executado: 804 erros e 32 warnings em código preexistente; vite.config.ts e o verificador novo sem mensagens. Não se declara lint global limpo nem se corrige código fora do escopo.
- Artefato: exatamente um link /manifest.json; nenhum segundo manifest.webmanifest gerado; cores pretas e assets válidos.
- Não foram limpos caches, sessões ou dados de usuários. SW não recebeu skipWaiting automático, novo registro ou invalidação agressiva. O public/sw.js antigo é sobrescrito pelo injectManifest no build; não foi reativado.
- Rascunhos, modais, menus e guard de autenticação permanecem cobertos pelos testes existentes. Evidência de navegador/preview é registrada ao final, sem equivaler a teste físico.

## Roteiro manual obrigatório — Galaxy S24 Ultra
Executar separadamente no Chrome e Samsung Internet, anotando versão do navegador, Android/One UI e modo claro/escuro. Não apagar dados de produção, sessões ou rascunhos para executar o teste. Para instalação nova, usar um aparelho/perfil de teste; não desinstalar a cópia de trabalho sem preservar rascunhos.

1. Instalação nova na URL de prévia: verificar identidade, ícone, abertura standalone e cores nativas. Prévia é outra origem, não atualiza a instalação de produção.
2. Abrir pelo ícone e confirmar que a home pública permanece pública.
3. Home: vídeo/poster, indicadores superiores legíveis; registrar se há transparência real ou fallback preto.
4. Abrir Sobre, Serviços e Projetos: topo e base pretos, sem quebra de scroll/layout.
5. Entrar no SevenOS com conta autorizada: dashboard, projetos, CRM, contatos, configurações e autenticação; confirmar ambas as barras e o dock inalterado.
6. Abrir menu/modal e um formulário; focar campos com teclado, cancelar sem gravar; testar toque nos controles próximos às bordas.
7. Alternar claro/escuro do sistema e reabrir: o aplicativo continua escuro; registrar cor real da faixa de gestos.
8. Girar retrato/paisagem: notch/câmera, safe areas, botões e scroll acessíveis.
9. Após publicação autorizada, ativar a atualização sem edições abertas; confirmar manifesto único preto na origem final e a atualização efetiva do pacote instalado. SW atualizado sozinho não basta como prova.
10. Minimizar/retornar, recarregar home e rota SevenOS: manter a URL, sem redirecionamento público→admin e sem perda de dados não salvos nas coberturas existentes.

Critério físico: registrar captura e resultado por navegador/mode/rota. Se a faixa continuar branca com manifesto preto comprovadamente aplicado à instalação, a hipótese restante é o comportamento nativo do host; investigar a versão específica sem declarar CSS como solução nativa. Transparência superior sem suporte deve usar fallback preto.

## Rollback
Reverter este commit/PR e reconstruir. Não houve migration, alteração de segredo ou limpeza de armazenamento. Backups e assets anteriores preservados. Produção permanece no deploy anterior até autorização específica.
