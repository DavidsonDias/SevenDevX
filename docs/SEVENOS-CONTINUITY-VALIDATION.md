# SevenOS — validação de continuidade

Base: main f59e2249076a3cfb52b860875c4a75b7dcde9ced. Trabalho isolado em codex/sevenos-session-continuity. Cópias locais da migração preservadas. Nenhum AGENTS.md foi encontrado nos checkouts/ancestrais relevantes; ADRs existentes de Auth e React Query foram respeitados.

## Evidência local executada

- TypeScript: aprovado.
- Build Vite/Workbox: aprovado; warnings existentes de chunks grandes e bases Browserslist/baseline antigas. Nenhuma atualização de dependência foi incluída.
- 236 testes locais: aprovados, incluindo oito de continuidade de Auth, sete de MFA nativo e quatro de escopo/serialização/registro de edições e atualização PWA.
- Os dois testes PostgreSQL exclusivos do CI foram recusados pelo guard do próprio teste no computador local; não houve conexão alternativa com produção. Rodar somente nos respectivos jobs isolados quando seu escopo mudar.
- ESLint: os arquivos novos de produção e os componentes centrais modificados passaram. Arquivos legados ainda têm dívida de any/fast-refresh; não se declara lint global verde.
- Navegador com SDK sintético, sem sessão real/backend: token refresh e SIGNED_IN repetido preservaram montagem 1 e texto digitado; falha temporária de rede preservou o editor e mostrou recuperação local; retorno da rede removeu o aviso.
- IndexedDB/WebCrypto reais no navegador: gravação/leitura, isolamento de usuário, isolamento de organização, recusa de credenciais e limpeza após logout aprovados.
- Expiração simulada bloqueou a rota; reentrada recuperou o rascunho mediante escolha. Troca de conta exibiu um editor vazio, sem conteúdo da conta anterior. Cancelar a confirmação de saída manteve rota e texto.
- Remontagem por atualização de desenvolvimento exibiu recuperação explícita e restaurou o texto salvo.
- Menu em 390×844: rolagem longa preservou fechamento/cabeçalho e rodapé acessíveis. Fechamento devolveu foco ao acionador. Evidência local: evidence/menu-mobile.png.

## Reprodução local sem dados reais

Instalar dependências pelo lockfile. Executar `node node_modules/vite/bin/vite.js --config vite.continuity.config.ts` e abrir `http://127.0.0.1:5184/admin/continuity-check`.

O SDK substituto existe somente nessa configuração de QA, vinculada a loopback. O build de produção usa a configuração normal e o cliente Supabase real. Não configurar tokens ou contas reais no fixture.

## Aceite ainda necessário

- Login/MFA reais na prévia; refresh, retorno após suspensão e logout entre abas.
- Android/iOS instalados: minimizar, bloquear/desbloquear, processo encerrado, teclado, safe areas e paisagem.
- Atualização real entre duas versões de service worker: edição suja impede reload; outra aba nunca recarrega automaticamente.
- Clientes/Portfólio: confirmar salvamento real e recusa de updated_at concorrente com dados de teste autorizados.

Viewport responsivo e eventos sintéticos não comprovam ciclo de vida de dispositivo físico. Não considerar estes itens executados por inferência.
