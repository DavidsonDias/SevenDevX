# Glossário — SevenDevX / SevenOS

Vocabulário oficial do projeto. Use estes termos em código, commits e documentação para eliminar ambiguidade.

## Produto e domínio

| Termo | Significado |
| --- | --- |
| **SevenDevX** | Site público institucional (marketing, portfólio, GEO, blog). |
| **SevenOS** | ERP/CRM interno da SevenDevX. Não é SaaS multi-tenant. |
| **Lead** | Contato entrante ainda não qualificado (formulário, WhatsApp, diagnóstico). |
| **Client** | Registro em `clients`; lead convertido com relação comercial ativa. |
| **Project** | Registro em `projects`; unidade de entrega, também usada na vitrine pública. |
| **Primary Project** | `featured_level = "primary"` — hero da vitrine na Home. |
| **Secondary Project** | `featured_level = "secondary"` — cards complementares da Home. |
| **Pipeline Stage** | Estágio operacional/comercial de um projeto ou contato. Fonte de verdade do funil. |
| **Diagnóstico** | Fluxo multi-step público que gera lead qualificado no módulo Criação de Sites. |

## Integrações e automação

| Termo | Significado |
| --- | --- |
| **Provider** | Serviço externo integrável (Slack, Stripe, GitHub, Vercel, Resend, WhatsApp…). |
| **Integration** | Instância configurada de um provider em `integration_providers` — fonte de verdade das integrações. |
| **Automation** | Regra `evento → ação` executada pelo `automation-runner`. |
| **Event** | Registro de acontecimento do sistema, consumido por automações e pelo feed. |
| **Webhook** | Entrada/saída HTTP assinada; entregas com retry e DLQ. |
| **DLQ** | Dead Letter Queue — entregas de webhook esgotadas após retries. |
| **Incident** | Falha operacional aberta automaticamente por health checks ou webhooks. |

## Marca e conteúdo

| Termo | Significado |
| --- | --- |
| **Brand Registry / LogoRegistry** | Fonte de verdade de branding (logos, cores, overrides). |
| **LogoRenderer** | Camada que resolve o logo correto de um provider/tecnologia. |
| **Brand Palette Engine** | Extração de paleta e design tokens a partir de assets de marca. |
| **GEO** | Generative Engine Optimization — conteúdo otimizado para motores de IA. |
| **Citation** | Menção da marca detectada por motores de IA, monitorada pelo `citation-monitor`. |
| **Content Cluster** | Agrupamento temático de conteúdo GEO/SEO. |

## Plataforma

| Termo | Significado |
| --- | --- |
| **AI Ops** | Camada de operações assistidas por IA (diagnóstico, recomendações, resumos). |
| **Edge Function** | Função Deno server-side; boundary de segurança para secrets e APIs externas. |
| **RLS** | Row Level Security — política de acesso por linha no banco. |
| **RBAC** | Controle de acesso por papel (`user_roles` + `has_role`). |
| **Signed URL** | URL temporária para assets do bucket privado `attachments`. |
| **Offline Queue** | Fila IndexedDB drenada por Background Sync no service worker. |

Ver também: [Portal de documentação](./README.md) · [Module Map](./architecture/MODULE_MAP.md)
