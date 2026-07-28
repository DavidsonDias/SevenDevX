# Database Documentation

Documentação do banco Postgres gerenciado do SevenOS.

| Documento | Conteúdo |
|---|---|
| [TABLES.md](TABLES.md) | Tabelas por domínio, finalidade e módulo consumidor |
| [RLS.md](RLS.md) | Modelo de políticas e GRANTs |
| [RPC_FUNCTIONS.md](RPC_FUNCTIONS.md) | Funções chamadas via `supabase.rpc()` |
| [TRIGGERS.md](TRIGGERS.md) | Automação no banco |
| [MIGRATIONS.md](MIGRATIONS.md) | Processo e convenções |

## Acesso

Somente pelo cliente gerado (`src/integrations/supabase/client.ts` — arquivo auto-gerado, **não editar**) e por Edge Functions.

Tipos vivem em `src/integrations/supabase/types.ts` (auto-gerado). Nunca editar manualmente; regenere via migration.

## Regras de ouro

1. `CREATE TABLE` → `GRANT` → `ENABLE RLS` → `CREATE POLICY`, sempre na mesma migration.
2. Sem política = tabela inacessível (comportamento desejado por padrão).
3. `anon` só recebe `SELECT` em conteúdo público.
4. Agregação pesada vira RPC.
