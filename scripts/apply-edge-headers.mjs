/**
 * Gerador único de cabeçalhos para as Edge Functions.
 * Uso interno (executado uma vez); mantido fora do bundle da aplicação.
 */
import { readFileSync, writeFileSync, existsSync } from "node:fs";

const META = {
  "admin-delete-user": ["Exclusão definitiva de um usuário e seus vínculos.", "JWT + role admin", "—", "Identidade", "Operação irreversível; registrada na trilha de auditoria."],
  "ai-chat": ["Chatbot do site público SevenDevX.", "Pública controlada", "AI Gateway", "IA", "Não expõe chave de modelo; valida input antes de chamar o provider."],
  "ai-contract-summarize": ["Resumo e análise de versões de contrato.", "JWT + role admin", "AI Gateway", "IA/Contratos", "Conteúdo contratual é sensível: não registrar o texto completo em log."],
  "ai-engine": ["Execuções genéricas de IA do SevenOS.", "JWT + role admin", "AI Gateway", "IA", "Consumo registrado em ai_usage para controle de quota."],
  "ai-ops": ["Operações assistidas por IA sob demanda.", "JWT + role admin", "AI Gateway", "AI Ops", "Ações sugeridas ficam em ai_ops_actions para revisão humana."],
  "ai-ops-autonomous": ["Rotina autônoma de operações assistidas por IA.", "Token de job", "AI Gateway", "AI Ops", "Executa sem interação humana: toda ação deve ser auditável e reversível."],
  "automation-runner": ["Processa os eventos pendentes e executa as automações ativas.", "Token de job", "—", "Automations", "Cada execução gera registro em automation_runs, inclusive falhas."],
  "brand-scan": ["Extrai identidade visual e paleta a partir de uma origem informada.", "JWT + role admin", "Web (URL informada)", "Branding", "Validar a URL de entrada; não seguir redirecionamentos para rede interna."],
  "citation-monitor": ["Monitora citações da marca em respostas de IAs e buscadores.", "Token de job", "Buscadores / IA", "GEO", "Resultados alimentam ai_citations; falha parcial não deve abortar o job."],
  "daily-digest": ["Resumo diário operacional enviado à equipe.", "Token de job", "Canais de notificação", "Observabilidade", "Agendada por pg_cron; não deve expor dados de clientes fora do destinatário."],
  "discord-test": ["Testa a integração Discord configurada.", "JWT + role admin", "Discord", "Integrations", "Retorna apenas diagnóstico; nunca o segredo."],
  "figma-info": ["Retorna dados da conta Figma conectada.", "JWT + role admin", "Figma", "Integrations", "O token permanece no ambiente da função."],
  "figma-test": ["Diagnóstico completo da integração Figma (auth e acesso a teams).", "JWT + role admin", "Figma", "Integrations", "Reporta presença do segredo como presente/ausente, nunca o valor."],
  "github-info": ["Retorna dados da conta/repositórios GitHub conectados.", "JWT + role admin", "GitHub", "Integrations", "O token permanece no ambiente da função."],
  "github-test": ["Diagnóstico da integração GitHub.", "JWT + role admin", "GitHub", "Integrations", "Reporta apenas resultado dos checks."],
  "gsc-insights": ["Insights de desempenho do Google Search Console.", "JWT + role admin", "Google Search Console", "SEO", "Dados agregados; sem PII."],
  "health-collector": ["Coleta amostras de saúde dos serviços monitorados.", "Token de job", "Serviços monitorados", "System Health", "Grava em service_health_snapshots; ausência de amostra não significa saudável."],
  "incident-notify": ["Notifica a equipe sobre incidentes abertos ou agravados.", "Token de job", "Canais de notificação", "System Health", "Evitar tempestade de alertas: respeitar deduplicação por incidente."],
  "lead-score-ai": ["Calcula a pontuação de qualificação de leads.", "JWT + role admin / job", "AI Gateway", "Pipeline", "Score é apoio à decisão, não classificação definitiva."],
  "logo-variations-ai": ["Gera variações de logo a partir do ativo base.", "JWT + role admin", "AI Gateway", "Branding", "Ativos grandes em base64 impactam backup e export."],
  "mfa-disable": ["Remove o MFA do próprio usuário autenticado.", "JWT do usuário", "—", "Security/MFA", "Opera exclusivamente sobre auth.uid(); não permite alvo arbitrário."],
  "mfa-enroll": ["Gera segredo TOTP, URI otpauth e backup codes.", "JWT do usuário", "—", "Security/MFA", "O segredo é retornado uma única vez ao próprio usuário; nunca a terceiros."],
  "mfa-verify": ["Valida o código TOTP e ativa o MFA do usuário.", "JWT do usuário", "—", "Security/MFA", "Backup codes são de uso único."],
  "oauth-callback": ["Conclui o fluxo OAuth PKCE e persiste a conexão.", "JWT + role admin", "Providers OAuth", "Integrations/OAuth", "Valida o state/verifier antes de trocar o código por token."],
  "oauth-start": ["Inicia o fluxo OAuth PKCE e devolve a URL de autorização.", "JWT + role admin", "Providers OAuth", "Integrations/OAuth", "O redirect é sempre same-origin público, nunca rota protegida."],
  "openai-test": ["Testa a integração OpenAI configurada.", "JWT + role admin", "OpenAI", "Integrations", "Retorna apenas diagnóstico."],
  "project-generator": ["Geração assistida de estrutura de projeto.", "JWT + role admin", "AI Gateway", "Projects", "Saída é rascunho: exige confirmação antes de persistir."],
  "provider-secrets-check": ["Verifica a presença dos segredos exigidos por cada provider.", "JWT + role admin", "—", "Integrations", "Retorna presente/ausente; jamais o valor do segredo."],
  "provider-test": ["Teste genérico de conexão para providers do catálogo.", "JWT + role admin", "Variável (provider)", "Integrations", "Propaga status e corpo do provider em caso de falha."],
  "push-public-key": ["Fornece a chave pública usada para assinar inscrições Web Push.", "Pública", "—", "Notifications", "Chave pública por definição; nenhuma chave privada é exposta."],
  "push-send": ["Envia notificações Web Push às inscrições registradas.", "JWT / token de job", "Web Push", "Notifications", "Inscrições inválidas devem ser removidas de push_subscriptions."],
  "resend-test": ["Testa a integração de e-mail transacional.", "JWT + role admin", "Resend", "Integrations", "Não envia para destinatário arbitrário sem validação."],
  "session-geo": ["Enriquece a sessão administrativa com dados geográficos.", "JWT do usuário", "Geo IP", "Security/Sessions", "IP é dado pessoal: armazenar apenas o necessário para auditoria."],
  "slack-test": ["Testa a integração Slack configurada.", "JWT + role admin", "Slack", "Integrations", "Retorna apenas diagnóstico."],
  "stripe-test": ["Testa a integração Stripe configurada.", "JWT + role admin", "Stripe", "Integrations", "Somente leitura de diagnóstico; não cria cobranças."],
  "tenant-export": ["Exporta os dados operacionais para backup.", "JWT + role admin", "—", "Backup", "Segredos e credenciais nunca entram no pacote exportado."],
  "tenant-restore": ["Restaura dados a partir de um backup.", "JWT + role admin", "—", "Restore", "Operação destrutiva: exige confirmação explícita e é auditada."],
  "track-analytics": ["Registra eventos de telemetria do site público.", "Pública controlada", "—", "Analytics", "Não aceita PII; input estritamente validado."],
  "vercel-info": ["Retorna dados de projetos e deploys da Vercel.", "JWT + role admin", "Vercel", "Integrations", "O token permanece no ambiente da função."],
  "vercel-test": ["Diagnóstico da integração Vercel.", "JWT + role admin", "Vercel", "Integrations", "Retorna apenas resultado dos checks."],
  "vercel-watch": ["Observa deploys e gera alertas de falha.", "Token de job", "Vercel", "Observabilidade", "Alertas persistidos em vercel_deploy_alerts."],
  "webhook-dispatch": ["Entrega eventos aos endpoints de webhook registrados.", "Token de job / interno", "Endpoints externos", "Webhooks", "Falhas vão para webhook_dlq; cabeçalhos de auth não são logados."],
  "webhook-retry-worker": ["Reprocessa entregas na dead-letter queue.", "Token de job", "Endpoints externos", "Webhooks", "Reprocessamento pode duplicar entrega: consumidores devem ser idempotentes."],
  "weekly-intel-report": ["Relatório semanal de inteligência operacional e comercial.", "Token de job", "AI Gateway", "Observabilidade", "Números do relatório derivam de dados reais; não estimar."],
  "whatsapp-send": ["Envia mensagem pela Meta Cloud API.", "JWT + role admin", "Meta Cloud API", "WhatsApp", "Respeitar janelas e templates aprovados pela Meta."],
  "whatsapp-test": ["Diagnóstico da integração WhatsApp Business.", "JWT + role admin", "Meta Cloud API", "WhatsApp", "Retorna apenas resultado dos checks."],
  "whatsapp-webhook": ["Recebe mensagens e status da Meta Cloud API.", "Assinatura HMAC do payload", "Meta Cloud API", "WhatsApp", "Rejeitar qualquer payload cuja assinatura não confira."],
};

let touched = 0;
for (const [name, m] of Object.entries(META)) {
  const path = `supabase/functions/${name}/index.ts`;
  if (!existsSync(path)) { console.log("skip (inexistente):", name); continue; }
  const src = readFileSync(path, "utf8");
  if (src.startsWith("/**")) { console.log("skip (já tem header):", name); continue; }
  const [desc, auth, ext, mod, note] = m;
  const header = `/**
 * ⚡ ${name}/index.ts — SevenOS Edge Function
 * ═══════════════════════════════════════════════════════════════════════
 *
 * @file supabase/functions/${name}/index.ts
 * @module ${mod}
 *
 * @description
 * ${desc}
 *
 * @security
 * ${auth}. Segredos permanecem em Deno.env e nunca são retornados.
 *
 * @external-api
 * ${ext}
 *
 * @remarks
 * ${note}
 *
 * @see docs/security/EDGE_FUNCTION_SECURITY.md
 * @see supabase/functions/README.md
 * ═══════════════════════════════════════════════════════════════════════
 */
`;
  writeFileSync(path, header + src);
  touched++;
}
console.log("cabeçalhos aplicados:", touched);
