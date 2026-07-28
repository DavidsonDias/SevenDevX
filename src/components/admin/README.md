# components/admin — Componentes do SevenOS

Componentes específicos do painel administrativo.

## Responsabilidade

Compor as telas de `/admin/*`: shell, navegação, blocos de dados e modais operacionais. Consomem hooks de `src/hooks`; não chamam o backend diretamente quando existe hook.

## Estrutura

| Arquivo/Dir | Responsabilidade |
|---|---|
| `AdminPageShell.tsx` | Layout base das telas admin (header auto-hide, título, ações, slots de módulos) |
| `AdminMenu.tsx` | Navegação agrupada do SevenOS |
| `Breadcrumb.tsx` | Trilha de navegação |
| `AdminComingSoon.tsx` | Placeholder de área em construção |
| `KpiCards.tsx`, `SmartInsights.tsx`, `AiInsightsBlock.tsx` | Indicadores e insights do dashboard |
| `ActivityFeed.tsx` | Feed de auditoria em tempo real (`audit_log` + Realtime) |
| `AuditDiffModal.tsx` | Comparação de alterações auditadas |
| `GlobalSearch.tsx` | Busca cross-entidade (RPC `search_global`) |
| `ClientPicker.tsx`, `ProjectPickerModal.tsx`, `TechPickerModal.tsx`, `TechMultiSelect.tsx`, `TagMultiSelect.tsx` | Seletores de entidade |
| `LucideIconPicker.tsx`, `IconUploader.tsx` | Seleção e upload de ícones |
| `AttachmentManager.tsx`, `FilePreview.tsx`, `StageDocuments.tsx` | Arquivos (bucket privado, URLs assinadas) |
| `ContractCard.tsx`, `ContractVersionHistory.tsx`, `ContractAiAnalysisModal.tsx` | Contratos e análise por IA |
| `PricingEngineModal.tsx` | Cálculo de precificação |
| `AiProjectGeneratorModal.tsx` | Geração assistida de projeto |
| `BlogPostEditor.tsx` | Editor de posts (markdown) |
| `SiteCreationProjectsTab.tsx`, `SiteCreationTechTab.tsx` | Abas do CMS da landing de criação de sites |
| `CitationMonitorSettings.tsx` | Configuração do monitor de citações |
| `PushSubscribeButton.tsx` | Assinatura de push |
| `finance/` | `ProjectFinanceBlock.tsx`, `TimeTrackerWidget.tsx` |
| `integrations/` | `ProjectIntegrationsBlock.tsx` |

## Regras

- Toda tela admin é acessível apenas por rota protegida com papel `admin`; ainda assim a autoridade é RLS.
- Arquivos privados sempre por URL assinada — nunca `getPublicUrl`.
- Ordenação por drag-and-drop usa `@dnd-kit` e persiste a ordem no banco.
- Ações destrutivas exigem confirmação explícita e ficam registradas em `audit_log`.

## Documentação relacionada

[MODULE_MAP](../../../docs/architecture/MODULE_MAP.md) · [AUDIT_LOG](../../../docs/security/AUDIT_LOG.md)
