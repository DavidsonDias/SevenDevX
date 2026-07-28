# Security Documentation

Documentação dos controles de segurança do SevenDevX/SevenOS.

| Documento | Conteúdo |
|---|---|
| [AUTHORIZATION.md](AUTHORIZATION.md) | Papéis, guardas e superfícies protegidas |
| [RLS.md](RLS.md) | Aplicação prática de RLS |
| [SECRETS.md](SECRETS.md) | Gestão de segredos e variáveis |
| [EDGE_FUNCTION_SECURITY.md](EDGE_FUNCTION_SECURITY.md) | Padrão de proteção das funções |
| [AUDIT_LOG.md](AUDIT_LOG.md) | Trilha de auditoria |
| [SECURITY_CHECKLIST.md](SECURITY_CHECKLIST.md) | Checklist de revisão |

## Regra absoluta

Nenhum segredo, chave, token, credencial ou identificador de projeto é documentado aqui. Documentamos **onde** o segredo é usado, nunca **qual** é o valor.

## Modelo resumido

```text
Browser (JWT anon/authenticated)
  → RLS decide leitura/escrita
Edge Function (JWT + has_role)
  → service role / API externa
```

Ver também [architecture/SECURITY](../architecture/SECURITY.md).
