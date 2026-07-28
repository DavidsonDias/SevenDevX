# Documentation Checklist

## Ao criar/alterar um arquivo

- [ ] Cabeçalho no nível correto (Level 1 / 2 / 3)
- [ ] `@module` coerente com o [MODULE_MAP](../architecture/MODULE_MAP.md)
- [ ] Funções exportadas relevantes com TSDoc
- [ ] Side effects declarados (escrita em DB, storage, realtime, invalidação de cache)
- [ ] Requisitos de segurança declarados quando houver
- [ ] Nenhum segredo em comentário ou doc
- [ ] Nenhum comentário redundante adicionado

## Ao criar um diretório relevante

- [ ] `README.md` seguindo o [README_STANDARD](README_STANDARD.md)
- [ ] Tabela de estrutura lista apenas arquivos existentes
- [ ] Linkado a partir do README pai

## Ao alterar arquitetura

- [ ] `/docs/architecture` atualizado
- [ ] ADR criado quando a decisão for estrutural
- [ ] Referências legacy removidas

## Ao alterar o banco

- [ ] `/docs/database/TABLES.md` atualizado
- [ ] RLS e GRANTs documentados
- [ ] RPC/trigger documentado com `SECURITY DEFINER` e `search_path`

## Definition of Done

- [ ] `npm run docs:check` sem novos warnings
- [ ] Documentação reflete o código real
- [ ] Nenhuma métrica inventada (usar `Target:`)
- [ ] Funcionalidade **não** alterada nesta task
