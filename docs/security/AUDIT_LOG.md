# Audit Log

## Objetivo

Manter trilha verificável de mutações relevantes no SevenOS.

## Como funciona

```text
Mutação em tabela auditada
  → trigger SECURITY DEFINER
  → INSERT em audit_log (autor, ação, entidade, diff, timestamp)
  → Realtime alimenta o Activity Feed do dashboard
```

## Consumidores

| Superfície | Arquivo/rota |
|---|---|
| Feed de atividades | `src/components/admin/ActivityFeed.tsx` |
| Logs administrativos | `/admin/logs` |
| Diff de alteração | `src/components/admin/AuditDiffModal.tsx` |
| Exportação | RPC `fn_audit_export` (CSV/JSON) |
| Retenção | RPC `fn_audit_cleanup` |

## Regras

1. `audit_log` é **append-only** para a aplicação: sem `UPDATE`/`DELETE` pela UI.
2. Leitura restrita a administradores.
3. Não gravar segredos, tokens ou senhas no diff.
4. PII gravada no diff segue a mesma classificação da tabela de origem.
5. Limpeza acontece por retenção programada, nunca por exclusão manual pontual.

## O que investigar em um incidente

- Quem alterou (`user_id`), quando, em qual entidade.
- Correlacionar com `admin_sessions` (origem/geo) e `incidents`.
