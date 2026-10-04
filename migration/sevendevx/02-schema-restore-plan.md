# Plano de restauração do schema

## Fonte canônica

1. Export oficial do Lovable Cloud, guardado fora da instância de origem.
2. Dump PostgreSQL oficial do banco real, em formato custom e com manifesto/versões.
3. Catálogo da origem capturado por `01-preflight-readonly.sql`.
4. As 72 migrations locais servem para rastreabilidade e análise, **não** para replay cego: o banco registra 69 versões e há divergências de timestamps/artefatos.

## Estratégia única

- Criar destino vazio e isolado, compatível com PostgreSQL 17 e extensões auditadas.
- Restaurar primeiro roles/extensões suportadas e schema gerenciado conforme o procedimento oficial de export/import.
- Restaurar schema e dados no ensaio isolado usando as opções suportadas pelo export oficial; não criar manualmente objetos internos de `auth`, `storage` ou `realtime` fora do fluxo oficial.
- Aplicar somente patches diferenciais revisados, idempotentes e explicados; não gerar um segundo schema paralelo.
- Comparar PK/FK/checks/uniques/defaults/identities/sequences, 183 índices, 88 triggers, 78 funções, 131 policies e grants.
- Recriar publicação Realtime e jobs apenas depois do banco validado, inicialmente desativados.

## Triggers e constraints

Não usar `session_replication_role=replica` nem desabilitar tudo indiscriminadamente. No ensaio, identificar triggers que produzem efeitos derivados, notificações, auditoria, eventos, automações e versionamento. Preferir restauração oficial que preserve ordem e dados. Qualquer trigger temporariamente suspenso terá lista nominal, justificativa, janela, comando de reativação e validação de equivalência.

## Gates obrigatórios

- Dump gerado, checksum registrado e restauração sem erro em destino descartável.
- Zero objetos críticos ausentes; diferenças justificadas.
- `08-validation-readonly.sql` sem órfãos, IDs divergentes ou sequences atrasadas.
- RLS/grants não menos restritivos que a origem.
- Sem jobs, webhooks, e-mails ou APIs externas ativos durante ensaio.

Nenhum comando de restauração foi executado nesta fase.
