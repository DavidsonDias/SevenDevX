# ADR-005 — Continuidade de sessão e edições SevenOS

Status: implementado; validação local em 24/10/2026. Aceite em dispositivo físico pendente.

## Decisão

- Manter um único AuthProvider. Separar admissão inicial de revalidação silenciosa, sem remontar editores na renovação da mesma sessão. A identidade inclui o session_id; claims decodificadas servem apenas à continuidade visual.
- Confirmar admin pela RPC has_role. Respostas antigas não autorizam outra sessão. Remoção confirmada do papel bloqueia a rota; falha temporária mantém a interface previamente admitida, com retry. RLS e Edge Functions continuam sendo a autoridade.
- Usar MFA nativo Supabase. A mesma sessão pode ser revalidada sem trocar a árvore; uma exigência confirmada de AAL2 oculta o editor até confirmação, preservando seu estado.
- Rascunhos são opt-in, criptografados em IndexedDB com AES-GCM e chave não exportável, vinculados a usuário/organização/módulo/registro. Expiração: 24h; até 20 registros por usuário e 128KiB por rascunho. A limpeza oportunista ocorre ao salvar outro rascunho; um rascunho expirado nunca é restaurado.
- Criptografia local não protege contra XSS da mesma origem nem constitui autorização. Credenciais são recusadas. Não usar a fila offline de requisições para rascunhos.
- Cobertura inicial: dados de contato de Clientes (sem notas/faturamento) e conteúdo editorial de Portfólio Davidson. Outros editores preservam estado em memória durante refresh, mas não ganham persistência local implicitamente.
- Restaurar é uma escolha explícita. O servidor nunca recebe o rascunho automaticamente. Escritas destes dois editores usam o updated_at já existente para recusar atualização concorrente.
- Links, voltar/avançar do histórico do aplicativo, smart-back e logout consultam o registro de edições; beforeunload é usado quando suportado. Navegações programáticas novas precisam integrar o mesmo guard.
- Atualizações PWA aguardam aprovação; nenhuma outra aba recebe comando de reload. BroadcastChannel consulta abas responsivas antes da ativação, transportando apenas um booleano. Abas suspensas pelo SO podem não responder; seu reload continua proibido automaticamente.
- Menu usa Dialog existente: cabeçalho/fechamento fixos, corpo rolável, foco preso, Escape e bloqueio de scroll. Não há nova biblioteca nem alteração de módulos/permissões.

## Limites operacionais

O sistema operacional pode encerrar o processo antes de concluir uma gravação IndexedDB. Debounce de 400ms e flush ao ocultar reduzem o risco, sem garantia de recuperação do último caractere. Limpeza de dados do navegador, quota ou modo privado também podem indisponibilizar rascunhos; o editor informa falha local.

Metadados de rota/rolagem são locais e isolados por conta; não armazenam tokens, pesquisa livre ou conteúdo do formulário. A URL atual prevalece em recarregamentos e inicializações standalone: `/` abre o site público, e uma URL `/admin/...` mantém seu destino sujeito à autenticação existente. A retomada automática de uma rota administrativa antiga na raiz foi removida. Logout remove o contexto da conta.

## Rollback

Reverter o commit do frontend e publicar nova versão. Nenhuma migration, policy, secret, função remota ou dado existente foi alterado. Manter os backups e os checkouts anteriores. O banco IndexedDB separado pode permanecer sem ser usado; não executar limpeza de produção como parte de rollback.
