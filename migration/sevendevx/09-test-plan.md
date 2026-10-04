# Plano de testes

Todos os testes de escrita usam destino isolado, contas e dados identificados como teste, integrações externas bloqueadas ou em sandbox.

| Área | Teste | Critério |
|---|---|---|
| Auth | login, logout, refresh, nova sessão | sessão válida e encerramento real |
| Auth | cadastro e recovery controlados | UUID/redirect/e-mail conforme configuração, sem disparo real não autorizado |
| OAuth | PKCE start/callback | state válido, callback único, credencial não exposta |
| RBAC | admin, usuário e anônimo | servidor aplica role; sem elevação pelo cliente |
| RLS | leitura/escrita por perfil | mesmo acesso da origem; isolamento preservado |
| Público | formulários, blog, serviços, portfólio e diagnóstico | leitura/gravação autorizada e notificações não duplicadas |
| CRM/projetos | criar/editar/reordenar/pipeline | persistência, FKs, triggers e Realtime corretos |
| Financeiro | transações, margens, forecast | totais equivalentes |
| CMS | projetos, stack, carreira, blog, SEO | conteúdo reflete sem redeploy |
| Storage | upload/download público e privado | MIME, path, policy e signed URL corretos |
| Functions | smoke por função | JWT/CORS/role e resposta; sem efeito externo |
| Webhooks | assinatura, retry e DLQ simulados | HMAC, idempotência e zero duplicação |
| E-mail/push | sandbox/mocks | payload correto, nenhum envio real na Fase 1 |
| IA | respostas em modo controlado | secrets presentes, quota/custo protegido |
| Realtime | mudanças autorizadas | somente canais/tabelas esperados |
| Dashboard | KPIs e listas | totais equivalentes à origem |
| PWA | install/update/offline/cache | não cachear endpoints; atualização segura |
| Performance | rotas críticas | sem regressão material no ensaio |

Executar também segurança: policies/grants, funções `SECURITY DEFINER` com `search_path`, anon sem acesso privado, service role ausente do bundle, headers/CSP e logs sem dados sensíveis. Registrar evidência, horário, ambiente e resultado por teste.
