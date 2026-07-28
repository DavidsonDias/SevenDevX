# hooks — Acesso a dados e comportamento reutilizável

Camada entre a UI e o backend. Encapsula queries, mutations, cache, realtime e comportamentos de browser.

## Responsabilidade

Ser o **único** caminho recomendado da UI para os dados. Componentes não devem chamar `supabase` diretamente quando existe hook.

## Estrutura

### Dados de domínio

| Hook | Domínio |
|---|---|
| `useProjects.ts` | Projetos e pipeline |
| `useContacts.ts` | Leads e contatos |
| `useFinance.ts` | Transações, orçamentos e margem |
| `useTimeTracking.ts` | Apontamento de horas |
| `useDocuments.ts`, `useAttachments.ts` | Documentos e anexos (URLs assinadas) |
| `useContractVersions.ts` | Versionamento de contratos |
| `useRegistry.ts` | `tech_registry` e `tag_registry` |
| `useSitePage.ts` | CMS da landing de criação de sites |
| `useIntegrations.ts`, `useIntegrationFavorites.ts` | Integrações |
| `useEcosystem.ts` | Visão agregada do ecossistema |
| `useSmartInsights.ts` | Leads parados (`fn_stale_leads`) e forecast (`fn_pipeline_forecast`) |
| `useNotifications.ts`, `usePushSubscription.ts` | Notificações e push |
| `useOnboarding.ts` | Progresso do onboarding |
| `useAuditLog.ts` | Trilha de auditoria |
| `useSystemSettings.ts` | Configurações globais (escrita admin-only) |
| `useMfa.ts` | Enrolamento e verificação TOTP |
| `useSessionTracker.ts` | Registro de sessão administrativa |
| `useAnalytics.ts`, `useAiReferralTracker.ts` | Telemetria e tráfego vindo de IAs |

### Branding e tema

`useBrandPalette.ts` · `useExtractedColor.ts` · `useResolvedAccent.ts` · `useLogoOverrides.ts`

### UI e browser

`use-mobile.tsx` · `use-toast.ts` · `useScrollLock.ts` · `useAutoHideOnScroll.ts` · `useSmartBack.ts`

## Regras

- Chaves de cache com escopo no primeiro elemento: `["projects"]`, `["projects", id]`.
- Mutations invalidam as chaves afetadas — inclusive as de agregação (forecast, KPIs).
- Erros são retornados/lançados; a decisão de UI (toast, boundary) é do consumidor.
- Hooks não decidem permissão: RLS decide.
- Efeitos colaterais (storage, realtime, subscription) devem ser limpos no unmount.

## Convenções

`useCamelCase.ts`, um domínio por arquivo, tipos exportados junto ao hook.

## Documentação relacionada

[DATA_FLOW](../../docs/architecture/DATA_FLOW.md) · [ADR-004](../../docs/adr/ADR-004-react-query.md)
