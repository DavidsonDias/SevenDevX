# SevenOS — validação de continuidade

Base: main f59e2249076a3cfb52b860875c4a75b7dcde9ced. Trabalho isolado em codex/sevenos-session-continuity. Cópias locais da migração preservadas. Nenhum AGENTS.md foi encontrado nos checkouts/ancestrais relevantes; ADRs existentes de Auth e React Query foram respeitados.

## Evidência local executada

- TypeScript: aprovado.
- Build Vite/Workbox: aprovado; warnings existentes de chunks grandes e bases Browserslist/baseline antigas. Nenhuma atualização de dependência foi incluída.
- 242 testes locais: aprovados, incluindo oito de continuidade de Auth, sete de MFA nativo e quatro de escopo/serialização/registro de edições e atualização PWA, mais seis de predicados de versão/conflito nos hooks reais de salvamento.
- Os dois testes PostgreSQL exclusivos do CI foram recusados pelo guard do próprio teste no computador local; não houve conexão alternativa com produção. Rodar somente nos respectivos jobs isolados quando seu escopo mudar.
- ESLint: os arquivos novos de produção e os componentes centrais modificados passaram. Comparação dos arquivos alterados: 61 erros antigos versus 60 atuais, sem novos erros de produção. Arquivos legados ainda têm dívida de any/fast-refresh; não se declara lint global verde.
- Navegador com SDK sintético, sem sessão real/backend: token refresh e SIGNED_IN repetido preservaram montagem 1 e texto digitado; falha temporária de rede preservou o editor e mostrou recuperação local; retorno da rede removeu o aviso.
- IndexedDB/WebCrypto reais no navegador: gravação/leitura, isolamento de usuário, isolamento de organização, recusa de credenciais e limpeza após logout aprovados.
- Expiração simulada bloqueou a rota; reentrada recuperou o rascunho mediante escolha. Troca de conta exibiu um editor vazio, sem conteúdo da conta anterior. Cancelar a confirmação de saída manteve rota e texto.
- Remontagem por atualização de desenvolvimento exibiu recuperação explícita e restaurou o texto salvo.
- Menu em 390×844: rolagem longa preservou fechamento/cabeçalho e rodapé acessíveis. Fechamento devolveu foco ao acionador. Evidência local: evidence/menu-mobile.png.

## Reprodução local sem dados reais

Instalar dependências pelo lockfile. Executar `node node_modules/vite/bin/vite.js --config vite.continuity.config.ts` e abrir `http://127.0.0.1:5184/admin/continuity-check`.

O SDK substituto existe somente nessa configuração de QA, vinculada a loopback. O build de produção usa a configuração normal e o cliente Supabase real. Não configurar tokens ou contas reais no fixture.

## Prévia autenticada — 24/10/2026

Login administrativo concluído pelo proprietário na prévia 5e1ce585 (mesmo código funcional das revisões seguintes de documentação/CI). Clientes leu os quatro registros existentes; um formulário novo com dados sintéticos persistiu rascunho local, confirmou saída pelo histórico e recuperou os dois campos após voltar. O rascunho foi descartado, sem clicar Salvar ou criar cliente.

Portfólio carregou conteúdo existente, preservou a alteração temporária ao mudar de área e recuperou-a explicitamente depois de navegar para fora e retornar. Descartar repôs o nome original e limpou o aviso. Não foi feita publicação nem escrita no registro real. O menu navegou entre módulos e fechou corretamente.

## Aceite ainda necessário

- Refresh real após suspensão e logout entre abas; login e navegação protegida da prévia já foram observados.
- Android/iOS instalados: minimizar, bloquear/desbloquear, processo encerrado, teclado, safe areas e paisagem.
- Atualização real entre duas versões de service worker: edição suja impede reload; outra aba nunca recarrega automaticamente.
- Salvamento concorrente contra um banco de teste: hooks reais foram exercitados com respostas simuladas (incluindo zero linhas), não com alteração de registros de produção.

Viewport responsivo e eventos sintéticos não comprovam ciclo de vida de dispositivo físico. Não considerar estes itens executados por inferência.


## Offline queue read failures — 2026-10-26

Regression tests in scripts/offline-queue-read.test.mjs cover unavailable IndexedDB, denied opening, aborted transactions, failed requests and successful reads. The old implementation failed three of five scenarios because async Promise executors lost rejected openDB errors, and aborted transactions had no settlement handler. Awaiting openDB before constructing the request Promise and handling abort/error preserves the existing safe return values without changing retries, enqueue, deletion or sending rules. Tests use in-memory IndexedDB doubles and explicitly assert zero writes and zero network requests. They do not drain a real user's queue or certify every browser implementation.

The new scenarios run in the continuity CI job. Local eligible suite: 248 passed; global lint reduced from 804 to 802 errors, with 32 warnings unchanged. Remaining lint debt is not suppressed.
