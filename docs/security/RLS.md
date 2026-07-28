# RLS na prática

Complemento operacional de [database/RLS](../database/RLS.md).

## Como escrever uma política

1. Defina o papel alvo (`to anon`, `to authenticated`).
2. Escreva `USING` para leitura e `WITH CHECK` para escrita — não omita `WITH CHECK` em `INSERT`/`UPDATE`.
3. Use `has_role(auth.uid(), 'admin')` para acesso administrativo.
4. Use `auth.uid() = user_id` para dados do próprio usuário.

```sql
CREATE POLICY "usuario le proprio registro"
  ON public.notification_preferences FOR SELECT TO authenticated
  USING (auth.uid() = user_id);
```

## Conteúdo público

```sql
CREATE POLICY "leitura publica de servicos"
  ON public.services_cms FOR SELECT TO anon, authenticated
  USING (true);

GRANT SELECT ON public.services_cms TO anon;
```

Sempre valide **deslogado** após publicar.

## Captação de leads

`contacts` aceita `INSERT` de visitante para formulários e diagnóstico, mas **não** permite `SELECT` anônimo — evita varredura de PII. Consultas pontuais usam a RPC `contact_id_by_email`.

## Erros comuns e sintomas

| Sintoma | Causa provável |
|---|---|
| Conteúdo aparece logado, some deslogado | Falta `GRANT SELECT ... TO anon` |
| `permission denied for table` | GRANT ausente (RLS não é suficiente) |
| Resultado vazio sem erro | Política existe mas `USING` não casa |
| Recursão infinita em política | Consulta à própria tabela sem `SECURITY DEFINER` |

## Revisão periódica

- Tabelas com PII não devem ter política `anon`.
- Toda tabela nova precisa aparecer em [TABLES.md](../database/TABLES.md).
