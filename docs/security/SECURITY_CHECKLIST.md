# Security Checklist

## Nova tabela

- [ ] `GRANT` explícito na mesma migration
- [ ] RLS habilitado
- [ ] Política por papel, com `WITH CHECK` em escrita
- [ ] `anon` só se o conteúdo for realmente público
- [ ] Sem PII acessível a `anon`
- [ ] Documentada em [database/TABLES](../database/TABLES.md)

## Nova função de banco

- [ ] `SECURITY DEFINER` apenas quando necessário
- [ ] `set search_path = public`
- [ ] `EXECUTE` revogado de `PUBLIC`/`anon`/`authenticated` se for trigger-only
- [ ] Revalida `has_role` se for administrativa

## Nova Edge Function

- [ ] Trata `OPTIONS` + CORS
- [ ] Verifica JWT
- [ ] Verifica papel quando administrativa
- [ ] Jobs protegidos por token, nunca abertos
- [ ] Webhooks de terceiros com verificação de assinatura
- [ ] Input validado
- [ ] Erros do provider propagados com status/corpo
- [ ] Nenhum segredo em log ou resposta

## Nova tela

- [ ] Rota admin envolvida em `ProtectedRoute requiredRole="admin"`
- [ ] Nenhuma decisão de permissão baseada em storage do browser
- [ ] Arquivos privados via URL assinada
- [ ] Mensagens de erro sem detalhe interno sensível

## Revisão periódica

- [ ] Nenhum papel fora de `user_roles`
- [ ] Nenhuma função `SECURITY DEFINER` executável por `anon`
- [ ] Bucket `attachments` continua privado
- [ ] Segredos rotacionados com redeploy das funções dependentes
