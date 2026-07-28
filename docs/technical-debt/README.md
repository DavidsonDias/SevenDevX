# Technical Debt Register

Registro de problemas observados **sem alterar o comportamento do sistema**. Cada item deve ter área, severidade e recomendação.

## Registro

| ID | Área | Problema | Severidade | Recomendação |
|---|---|---|---|---|
| TD-001 | Build / Performance | O chunk principal de produção ultrapassa 4 MB, exigindo elevar `maximumFileSizeToCacheInBytes` do Workbox para 12 MB para o build não falhar. | High | Code-splitting agressivo por rota admin e revisão de imports de bibliotecas pesadas (charts, editores, dnd). |
| TD-002 | Rotas | `src/pages/Index.tsx` e `src/pages/Home.tsx` coexistem como entradas de página inicial. | Low | Confirmar qual é canônico e remover o não utilizado. |
| TD-003 | Documentação | Arquivos legados na raiz (`READEE.md`, `READMEE.md`, `RELATORIO_ANALISE_TECNICA.md`, `TECHNICAL_REPORT.md`) duplicam informação do README. | Medium | Consolidar em `/docs` e remover duplicatas. |
| TD-004 | Componentes | `TechIcon.tsx`, `TechIconCDN.tsx` e `TagIcon.tsx` resolvem ícones por caminhos distintos. | Medium | Unificar sob o renderer canônico descrito no [ADR-001](../adr/ADR-001-logo-renderer.md). |
| TD-005 | Dados de conteúdo | Conteúdo vive em duas fontes: arquivos estáticos (`src/data/*.ts`) e tabelas CMS (`site_page_*`, `services_cms`). | Medium | Definir a fonte de verdade por seção e documentar; migrar o restante para CMS. |
| TD-006 | Testes | Não há suíte de testes automatizados no repositório. | High | Introduzir testes de unidade para hooks financeiros e RPCs críticas antes de novas features de cálculo. |
| TD-007 | Observabilidade | Não há verificação automática de links quebrados na documentação além de `docs:check` (warning). | Low | Promover a checagem para CI quando a base estiver estável. |
| TD-008 | Backend | Grande número de Edge Functions (46) com blocos de autenticação e CORS repetidos. | Medium | Extrair helper compartilhado de auth/CORS mantendo o contrato atual. |

## Como registrar um novo item

1. Não corrija silenciosamente durante uma task de documentação.
2. Adicione uma linha com próximo ID livre.
3. Severidade: `Low` / `Medium` / `High` / `Critical`.
4. Referencie o arquivo real envolvido.
5. Ao resolver, mova o item para a seção abaixo.

## Resolvidos

_Nenhum item resolvido até o momento._
