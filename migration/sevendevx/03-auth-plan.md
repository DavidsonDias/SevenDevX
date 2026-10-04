# Plano de Auth e identidade

## Estado auditado

3 usuários, todos com identidade de e-mail confirmada e histórico de login; 2 vínculos administrativos; `profiles=0`; `user_mfa=0`; nenhum fator MFA. Roles residem exclusivamente em `user_roles` e são avaliadas por `has_role()`.

## Preservação obrigatória

- Migrar `auth.users`, identidades e metadados pelo fluxo oficial, preservando literalmente `auth.users.id` e timestamps.
- Preservar FKs para `profiles`, `user_roles`, conteúdo autoral e campos owner/user/created_by/assigned_to.
- Não recriar usuários por signup, não gerar UUIDs novos, não mover roles para profiles/claims.
- Preservar hash de senha somente pelo mecanismo oficial; nunca exportá-lo para documentação.
- Revalidar `handle_new_user`, RPCs administrativas, `auth.uid()` em RLS e grants de `has_role`.

## Configuração manual no destino

URLs do site, redirects, confirmação de e-mail, recovery, templates, SMTP, CAPTCHA/rate limits, duração de JWT, refresh, provedores sociais e credenciais OAuth. Estado atual detalhado destes itens: **NÃO VERIFICADO**. Não reduzir controles para obter compatibilidade.

## Sessões e primeiro acesso

Sessões ativas não devem ser presumidas como migráveis. Planejar reautenticação após o corte. Administradores: validar login, role no servidor, MFA quando aplicável e acesso ao painel. Usuários comuns: login e isolamento. Recovery: testar em ambiente isolado com caixa controlada; não disparar redefinições reais nesta fase nem em massa. Contas sem perfil continuam válidas; não criar perfis artificiais.

## Aceite

Conjunto de UUIDs, identidades e vínculos idêntico; nenhum usuário duplicado; roles equivalentes; login/logout/refresh/recovery testados; admin não derivado do cliente; policies com `auth.uid()` preservadas; e-mails externos somente após autorização.
