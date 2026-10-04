# Matriz de compatibilidade

| COMPONENTE | EVIDÊNCIA | COMPATIBILIDADE | AÇÃO | RISCO | BLOQUEADOR | VALIDAÇÃO |
|---|---|---|---|---|---|---|
| Projeto sem remix | docs oficiais Lovable atuais | COMPATÍVEL | Export→Remove→Connect→Import, somente após gates | remoção irreversível | não para autorizar preparação | revalidar docs antes da execução |
| PostgreSQL/schema public | 80 tabelas, PG 17.6 | COMPATÍVEL | dump oficial, não replay cego | drift 72/69 migrations | dump/ensaio pendentes | catálogos e checksums |
| Destino externo | não fornecido | NÃO VERIFICADO | inventariar antes de qualquer import | conflito/preexistência | sim para execução | executar preflight no destino |
| Auth/users UUID | 3 users, FKs/RLS | MIGRAR MANUALMENTE | fluxo oficial preservando IDs | lockout/duplicação | sim para corte | UUID/identidades/login |
| Sessões ativas | docs indicam não transferência | RECONFIGURAR | forçar reautenticação planejada | logout geral | não | login/refresh |
| Roles | `user_roles` + `has_role` | COMPATÍVEL | preservar tabela/função/grants | elevação de privilégio | sim se divergente | testes RBAC |
| Profiles | zero registros | COMPATÍVEL | não sintetizar dados | inconsistência artificial | não | count=0 e fluxos funcionais |
| MFA | zero fatores | COMPATÍVEL | preservar configuração e testar | falsa sensação de cobertura | não | enroll/verify isolado |
| Storage | 8 buckets, públicos/privados | MIGRAR MANUALMENTE | objeto a objeto + checksums | perda/ACL incorreta | sim para corte | manifesto/checksum |
| Signed URLs | buckets privados | RECONFIGURAR | regenerar no destino | links expirados | não | acesso autorizado/anon negado |
| Edge Functions | 50 no repo | MIGRAR MANUALMENTE | deploy e config individual | drift deploy/config | sim para corte | inventário implantado + smoke |
| Secrets | nomes inventariados | MIGRAR MANUALMENTE | provisionar fora do repo | indisponibilidade/vazamento | sim para funções | presença, nunca valor |
| Lovable AI Gateway | uso em múltiplas funções | NÃO VERIFICADO | confirmar uso com backend externo | IA indisponível/custo | sim para módulos IA | smoke controlado |
| RLS/grants | 131 policies reais | COMPATÍVEL | preservar ou endurecer | exposição de dados | sim | diff policies/grants |
| SECURITY DEFINER | 40 reais | COMPATÍVEL | preservar owner/search_path/EXECUTE | bypass RLS | sim | diff + testes negativos |
| Realtime | 10 tabelas | RECONFIGURAR | recriar publication | eventos ausentes/indevidos | não | subscribe autorizado |
| pg_cron | 13 jobs ativos | RECONFIGURAR | lista canônica, URLs/secrets novos | duplicação | sim para corte | cron status/histórico |
| Webhooks/filas | dispatch/retry/DLQ/WhatsApp | RECONFIGURAR | endpoints, HMAC, idempotência | duplicação/perda | sim para corte | payload simulado |
| OAuth integrações | PKCE custom | RECONFIGURAR | secrets e callbacks novos | callback inválido | não | start/callback isolado |
| SMTP/e-mail | Resend + Auth | RECONFIGURAR | domínio/templates/redirects | envio indevido | sim para ativação | sandbox |
| Stripe | teste/secret, sem receiver dedicado | NÃO VERIFICADO | confirmar se há uso produtivo | eventos perdidos | não se inativo | ambiente teste |
| Vercel/frontend | React/Vite/PWA | COMPATÍVEL | trocar env apenas no corte | cache/SW antigo | não | rotas/PWA/cache |
| Lovable preview | broker/tagger dev | COMPATÍVEL | manter Lovable como ambiente dev | sessão preview | não | preview após conexão |
| Backups existentes | tenant + buckets export | NÃO VERIFICADO | validar conteúdo e restore | falsa segurança | sim para corte | ensaio restaurável |
