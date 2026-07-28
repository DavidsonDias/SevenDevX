# Migrations

## Local

`supabase/migrations/` — arquivos `<timestamp>_<hash>.sql`, aplicados em ordem cronológica e **imutáveis** após aplicados.

## Regras

1. Nunca editar uma migration já aplicada; crie outra.
2. Estrutura obrigatória ao criar tabela:

```sql
CREATE TABLE public.exemplo (...);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.exemplo TO authenticated;
GRANT ALL ON public.exemplo TO service_role;
-- GRANT SELECT ON public.exemplo TO anon;  -- só se houver leitura pública

ALTER TABLE public.exemplo ENABLE ROW LEVEL SECURITY;

CREATE POLICY "admins manage exemplo"
  ON public.exemplo FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));
```

3. Schemas gerenciados (`auth`, `storage`, `realtime`, `supabase_functions`, `vault`) não são alterados.
4. Funções `SECURITY DEFINER` sempre com `set search_path = public`.
5. Após a migration, os tipos em `src/integrations/supabase/types.ts` são regenerados automaticamente — não editar à mão.

## Checklist de migration

- [ ] GRANTs presentes para cada tabela nova
- [ ] RLS habilitado
- [ ] Políticas cobrindo todos os papéis previstos
- [ ] `EXECUTE` revogado em funções trigger-only
- [ ] Índices para colunas usadas em filtro/ordenação frequente
- [ ] `docs/database/TABLES.md` atualizado
