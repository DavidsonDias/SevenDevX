# SevenDevX Engineering Documentation

Portal central da documentação técnica do **SevenDevX** (site público) e do **SevenOS** (ERP/CRM interno).

> Esta documentação descreve **o comportamento real do código** presente neste repositório.
> Nenhuma métrica de performance, cobertura de testes ou compatibilidade é declarada sem medição — apenas *targets* quando aplicável.

---

## 🧭 Navegação

### Standards
- [SevenDevX Enterprise Code Documentation Standard](code-standards/README.md)
- [Cabeçalhos de arquivo](code-standards/FILE_HEADERS.md)
- [TSDoc](code-standards/TSDOC_STANDARD.md)
- [Comentários](code-standards/COMMENTS_STANDARD.md)
- [README por diretório](code-standards/README_STANDARD.md)
- [Documentação de arquitetura](code-standards/ARCHITECTURE_DOCUMENTATION.md)
- [Convenções de nomenclatura](code-standards/NAMING_CONVENTIONS.md)
- [Checklist](code-standards/DOCUMENTATION_CHECKLIST.md)

### Architecture
- [Visão geral do sistema](architecture/SYSTEM_OVERVIEW.md)
- [Mapa de módulos](architecture/MODULE_MAP.md)
- [Fluxo de dados](architecture/DATA_FLOW.md)
- [Autenticação](architecture/AUTHENTICATION.md)
- [Banco de dados (arquitetura)](architecture/DATABASE.md)
- [Integrações](architecture/INTEGRATIONS.md)
- [Arquitetura de IA](architecture/AI_ARCHITECTURE.md)
- [PWA](architecture/PWA_ARCHITECTURE.md)
- [Segurança (arquitetura)](architecture/SECURITY.md)

### Database
- [Overview](database/README.md)
- [Tabelas](database/TABLES.md)
- [RLS](database/RLS.md)
- [Funções RPC](database/RPC_FUNCTIONS.md)
- [Triggers](database/TRIGGERS.md)
- [Migrations](database/MIGRATIONS.md)

### Security
- [Overview](security/README.md)
- [Autorização](security/AUTHORIZATION.md)
- [RLS](security/RLS.md)
- [Secrets](security/SECRETS.md)
- [Edge Function Security](security/EDGE_FUNCTION_SECURITY.md)
- [Audit Log](security/AUDIT_LOG.md)
- [Checklist](security/SECURITY_CHECKLIST.md)

### Decisões e dívidas
- [ADRs](adr/)
- [Technical Debt Register](technical-debt/README.md)
- [Changelog da documentação](CHANGELOG.md)

---

## 🔍 Verificação

```bash
npm run docs:check
```

Emite **warnings** (não bloqueia build) para arquivos críticos sem cabeçalho, diretórios relevantes sem `README.md` e links Markdown quebrados.

---

## 🗺️ Onde encontrar o quê

| Pergunta | Documento |
|---|---|
| Como o sistema é composto? | [SYSTEM_OVERVIEW](architecture/SYSTEM_OVERVIEW.md) |
| Qual módulo cuida de X? | [MODULE_MAP](architecture/MODULE_MAP.md) |
| Quem pode ler/escrever cada tabela? | [database/RLS](database/RLS.md) |
| Como uma Edge Function é protegida? | [security/EDGE_FUNCTION_SECURITY](security/EDGE_FUNCTION_SECURITY.md) |
| Como documentar um arquivo novo? | [code-standards/FILE_HEADERS](code-standards/FILE_HEADERS.md) |
