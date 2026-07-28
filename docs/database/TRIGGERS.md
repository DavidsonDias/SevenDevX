# Triggers

Automação executada dentro do banco. Todas as funções de trigger são `SECURITY DEFINER` com `search_path = public` e **sem** `EXECUTE` para `PUBLIC`, `anon` ou `authenticated`.

## Categorias em uso

| Categoria | Efeito | Tabelas alvo |
|---|---|---|
| **Auditoria** | Grava INSERT/UPDATE/DELETE em `audit_log` com autor e diff | Tabelas de negócio (projetos, clientes, finanças, configurações) |
| **Timestamps** | Mantém `updated_at` | Tabelas com ciclo de edição |
| **Provisionamento de usuário** | Cria `profiles` ao registrar usuário e concede papel admin ao primeiro usuário | `auth.users` → `profiles`, `user_roles` |
| **Pipeline** | Registra mudança de estágio em `pipeline_stage_log` | `projects` |
| **Notificações** | Emite notificação a administradores em novos leads/eventos críticos | `contacts`, `incidents` |
| **Eventos** | Publica em `events` para o motor de automações | Tabelas com gatilhos configurados |

## Cuidados

1. Trigger nunca chama API externa de forma síncrona — publique um evento e deixe a Edge Function processar.
2. Trigger de auditoria não deve gravar campos sensíveis em claro.
3. Ao criar trigger, revogue explicitamente o `EXECUTE` da função para roles do cliente.
4. Evite triggers em cascata que reescrevam a mesma tabela (risco de recursão).

> Para o SQL exato de cada trigger, consulte as migrations em `supabase/migrations/`. Este documento descreve intenção e contrato, não duplica DDL.
