# integrations — Clientes de serviços externos

Camada de acesso a serviços externos gerados ou mantidos fora da lógica de aplicação.

## Estrutura

| Diretório | Responsabilidade |
|---|---|
| `supabase/` | Cliente e tipos gerados automaticamente (`client.ts`, `types.ts`) |

## Regras

- **Arquivos gerados não são editados manualmente**: `supabase/client.ts` e `supabase/types.ts` são sobrescritos pela plataforma.
- Importar sempre como `import { supabase } from "@/integrations/supabase/client"`.
- Nenhuma regra de negócio aqui: consultas pertencem a hooks (`src/hooks`) e módulos.
- Chaves publicáveis vêm de variáveis `VITE_*`; segredos nunca chegam ao cliente.

## Documentação relacionada

[ADR-003](../../docs/adr/ADR-003-supabase-auth.md) · [DATABASE](../../docs/architecture/DATABASE.md) · [SECRETS](../../docs/security/SECRETS.md)
