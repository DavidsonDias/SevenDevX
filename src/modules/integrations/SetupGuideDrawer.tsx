/**
 * 📘 SetupGuideDrawer — Tutorial premium passo a passo por provider
 * - Checklist persistente em localStorage
 * - Code blocks com copy
 * - Troubleshooting / FAQs / CURL examples
 */
import { motion, AnimatePresence } from "framer-motion";
import { X, ExternalLink, CheckCircle2, BookOpen, Copy, Check, AlertCircle, HelpCircle } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

type Step = {
  title: string;
  body: string;
  link?: { label: string; url: string };
  code?: { lang: string; value: string };
};
type FAQ = { q: string; a: string };
type Trouble = { problem: string; solution: string };

type Guide = {
  intro: string;
  secretsExpected?: string[];
  steps: Step[];
  curl?: { label: string; value: string }[];
  troubleshooting?: Trouble[];
  faq?: FAQ[];
};

const GUIDES: Record<string, Guide> = {
  github: {
    intro: "Conecte sua conta GitHub para monitorar repositórios, PRs, commits e validar o token automaticamente.",
    secretsExpected: ["GITHUB_TOKEN"],
    steps: [
      { title: "Gere um Personal Access Token (fine-grained)", body: "GitHub → Settings → Developer settings → Personal access tokens → Fine-grained tokens. Validade recomendada: 90 dias.", link: { label: "Abrir GitHub Tokens", url: "https://github.com/settings/tokens?type=beta" } },
      { title: "Selecione os scopes mínimos", body: "Repository access: All repositories (ou específicos). Permissions: Contents (read), Metadata (read), Pull requests (read), Commit statuses (read)." },
      { title: "Salve o secret GITHUB_TOKEN", body: "Cole o token em Cloud → Secrets. O teste no SevenOS valida automaticamente: /user, scopes, rate limit e listagem de repositórios." },
      { title: "Execute o teste no SevenOS", body: "Volte ao modal da integração GitHub e clique em Testar conexão. Você verá 5 checks com latência e payload completo." },
    ],
    curl: [
      { label: "Validar token", value: `curl -H "Authorization: Bearer $GITHUB_TOKEN" https://api.github.com/user` },
      { label: "Listar repos", value: `curl -H "Authorization: Bearer $GITHUB_TOKEN" https://api.github.com/user/repos?per_page=3` },
    ],
    troubleshooting: [
      { problem: "401 Bad credentials", solution: "Token expirado ou inválido. Gere um novo em github.com/settings/tokens." },
      { problem: "403 Resource not accessible by integration", solution: "Faltam scopes. Edite o token e adicione a permissão necessária." },
      { problem: "Rate limit baixo", solution: "Tokens autenticados têm 5000 req/h. Se estiver baixo, há outro processo consumindo." },
    ],
    faq: [
      { q: "Posso usar OAuth App em vez de PAT?", a: "Sim, mas o teste atual usa Bearer token. OAuth App requer fluxo de autorização adicional." },
      { q: "O SevenOS armazena meu token?", a: "O token fica apenas em Secrets do backend, jamais exposto ao frontend." },
    ],
  },

  vercel: {
    intro: "Acompanhe deploys, projects e teams da Vercel em tempo real.",
    secretsExpected: ["VERCEL_TOKEN"],
    steps: [
      { title: "Crie um Access Token", body: "Vercel → Account Settings → Tokens → Create. Scope: Full Account (ou específico do time).", link: { label: "Vercel Tokens", url: "https://vercel.com/account/tokens" } },
      { title: "Salve VERCEL_TOKEN nos Secrets", body: "Cloud → Secrets → adicione VERCEL_TOKEN." },
      { title: "Teste a conexão", body: "O SevenOS valida /v2/user, /v2/teams e /v9/projects retornando latência e payload." },
      { title: "Webhook (opcional)", body: "Para deploys realtime, configure um webhook apontando para sua função webhook-dispatch." },
    ],
    curl: [
      { label: "Validar token", value: `curl -H "Authorization: Bearer $VERCEL_TOKEN" https://api.vercel.com/v2/user` },
      { label: "Listar projetos", value: `curl -H "Authorization: Bearer $VERCEL_TOKEN" "https://api.vercel.com/v9/projects?limit=5"` },
    ],
    troubleshooting: [
      { problem: "403 forbidden", solution: "Token sem permissão no team. Recrie com scope correto." },
      { problem: "404 em projeto específico", solution: "Use o ID correto (não o nome) ou prefixe com o teamId via query param." },
    ],
    faq: [
      { q: "Quanto tempo o token dura?", a: "Sem expiração por padrão, mas pode ser revogado a qualquer momento." },
    ],
  },

  figma: {
    intro: "Valide acesso a arquivos Figma e use no projeto.",
    secretsExpected: ["FIGMA_TOKEN"],
    steps: [
      { title: "Gere um Personal Access Token", body: "Figma → Settings → Personal access tokens → Generate new token. Escolha escopo File content (read).", link: { label: "Figma Settings", url: "https://www.figma.com/settings" } },
      { title: "Salve FIGMA_TOKEN", body: "Cloud → Secrets → FIGMA_TOKEN." },
      { title: "Teste a conexão", body: "O SevenOS valida /v1/me e listagem de teams." },
    ],
    curl: [
      { label: "Validar token", value: `curl -H "X-Figma-Token: $FIGMA_TOKEN" https://api.figma.com/v1/me` },
    ],
    troubleshooting: [
      { problem: "403 Invalid token", solution: "Token revogado ou sem escopo. Gere novo em figma.com/settings." },
    ],
  },

  whatsapp: {
    intro: "Conecte o WhatsApp Business Cloud API (Meta) para receber leads e enviar mensagens.",
    secretsExpected: ["WHATSAPP_TOKEN", "WHATSAPP_PHONE_ID", "WHATSAPP_BUSINESS_ACCOUNT_ID"],
    steps: [
      { title: "Crie um app Business no Meta", body: "developers.facebook.com → My Apps → Create App → Business → adicione o produto WhatsApp.", link: { label: "Meta for Developers", url: "https://developers.facebook.com" } },
      { title: "Gere um Access Token permanente", body: "Use System User do Business Manager → Generate Token → escopo whatsapp_business_messaging + whatsapp_business_management." },
      { title: "Salve secrets no SevenOS", body: "WHATSAPP_TOKEN, WHATSAPP_PHONE_ID e (opcional) WHATSAPP_BUSINESS_ACCOUNT_ID em Cloud → Secrets." },
      { title: "Configure webhook (opcional)", body: "Subscribe ao evento messages apontando para sua função webhook-dispatch. Use o Verify Token retornado pelo SevenOS." },
      { title: "Teste a conexão", body: "O SevenOS valida o phone number e (se WABA_ID informado) as subscriptions." },
    ],
    curl: [
      { label: "Validar phone number", value: `curl -H "Authorization: Bearer $WHATSAPP_TOKEN" "https://graph.facebook.com/v20.0/$WHATSAPP_PHONE_ID?fields=verified_name,display_phone_number"` },
      { label: "Enviar mensagem template", value: `curl -X POST -H "Authorization: Bearer $WHATSAPP_TOKEN" -H "Content-Type: application/json" \\\n  -d '{"messaging_product":"whatsapp","to":"+5531999999999","type":"template","template":{"name":"hello_world","language":{"code":"en_US"}}}' \\\n  "https://graph.facebook.com/v20.0/$WHATSAPP_PHONE_ID/messages"` },
    ],
    troubleshooting: [
      { problem: "190 OAuthException", solution: "Token de usuário expirou. Gere token permanente via System User." },
      { problem: "Número não verificado", solution: "Conclua a verificação por SMS no Business Manager antes de enviar mensagens." },
      { problem: "Webhook não recebe nada", solution: "Verifique se subscribed_apps inclui seu app e se o Verify Token bate." },
    ],
    faq: [
      { q: "Posso usar número pessoal?", a: "Não. Precisa ser um número não registrado no WhatsApp pessoal, dedicado à Cloud API." },
    ],
  },

  google: {
    intro: "Conecte Google Workspace (Calendar, Drive, Gmail) via OAuth 2.0.",
    secretsExpected: ["GOOGLE_CLIENT_ID", "GOOGLE_CLIENT_SECRET"],
    steps: [
      { title: "Crie um projeto no Google Cloud", body: "console.cloud.google.com → New Project.", link: { label: "Google Cloud Console", url: "https://console.cloud.google.com" } },
      { title: "Configure OAuth consent screen", body: "Tipo External, adicione scopes (calendar, drive.readonly, gmail.send) e domínios autorizados." },
      { title: "Crie credenciais OAuth 2.0", body: "Tipo Web Application. Adicione o redirect URL exibido pelo SevenOS." },
      { title: "Salve GOOGLE_CLIENT_ID e GOOGLE_CLIENT_SECRET", body: "Em Cloud → Secrets. O fluxo OAuth completo será habilitado em fase futura." },
    ],
    troubleshooting: [
      { problem: "redirect_uri_mismatch", solution: "O URL configurado no Google Cloud precisa bater 100% (sem barra final divergente) com o usado no app." },
      { problem: "access_denied", solution: "App em modo Testing aceita apenas usuários listados. Adicione test users ou publique o app." },
    ],
  },

  stripe: {
    intro: "Pagamentos globais, subscriptions e billing via Stripe.",
    secretsExpected: ["STRIPE_SECRET_KEY", "STRIPE_WEBHOOK_SECRET"],
    steps: [
      { title: "Pegue sua Secret Key", body: "Dashboard → Developers → API keys. Use restricted keys quando possível.", link: { label: "Stripe API Keys", url: "https://dashboard.stripe.com/apikeys" } },
      { title: "Salve STRIPE_SECRET_KEY", body: "Cloud → Secrets. Use sk_test_... em desenvolvimento, sk_live_... em produção." },
      { title: "Configure webhook endpoint", body: "Developers → Webhooks → Add endpoint. Aponte para sua função webhook-dispatch e copie o signing secret." },
      { title: "Salve STRIPE_WEBHOOK_SECRET", body: "Necessário para validar assinaturas HMAC dos eventos." },
    ],
    curl: [
      { label: "Listar customers", value: `curl https://api.stripe.com/v1/customers -u $STRIPE_SECRET_KEY:` },
      { label: "Criar payment intent", value: `curl https://api.stripe.com/v1/payment_intents \\\n  -u $STRIPE_SECRET_KEY: \\\n  -d amount=2000 -d currency=brl` },
    ],
    troubleshooting: [
      { problem: "Invalid signature on webhook", solution: "Verifique se está usando o signing secret correto (test vs live)." },
      { problem: "No such customer", solution: "IDs de test mode não funcionam em live e vice-versa." },
    ],
  },

  openai: {
    intro: "GPT-5, embeddings, vision e assistants da OpenAI.",
    secretsExpected: ["OPENAI_API_KEY"],
    steps: [
      { title: "Crie uma API key", body: "platform.openai.com → API keys. Recomendamos uma key por projeto.", link: { label: "OpenAI Platform", url: "https://platform.openai.com/api-keys" } },
      { title: "Configure billing", body: "Você precisa de um payment method e créditos para usar a API." },
      { title: "Salve OPENAI_API_KEY", body: "Cloud → Secrets → OPENAI_API_KEY." },
      { title: "Defina limites de uso", body: "Settings → Limits → Hard limit mensal para evitar surpresas." },
    ],
    curl: [
      { label: "Chat completion", value: `curl https://api.openai.com/v1/chat/completions \\\n  -H "Authorization: Bearer $OPENAI_API_KEY" \\\n  -H "Content-Type: application/json" \\\n  -d '{"model":"gpt-5","messages":[{"role":"user","content":"Hi"}]}'` },
    ],
    troubleshooting: [
      { problem: "429 insufficient_quota", solution: "Sem créditos disponíveis. Adicione billing em platform.openai.com/account/billing." },
      { problem: "401 Invalid API key", solution: "Key revogada ou typo. Gere uma nova." },
    ],
    faq: [
      { q: "Posso usar via Lovable AI?", a: "Sim. O Lovable AI Gateway já roteia para OpenAI sem precisar de key própria." },
    ],
  },

  gemini: {
    intro: "Google Gemini 2.5/3 Pro, multimodal e Live API.",
    secretsExpected: ["GEMINI_API_KEY"],
    steps: [
      { title: "Gere a API key no AI Studio", body: "aistudio.google.com → Get API key → Create API key in new project.", link: { label: "Google AI Studio", url: "https://aistudio.google.com/app/apikey" } },
      { title: "Salve GEMINI_API_KEY", body: "Cloud → Secrets → GEMINI_API_KEY." },
      { title: "Escolha o modelo", body: "gemini-2.5-flash (rápido), gemini-2.5-pro (qualidade máxima), gemini-3.1-flash-image-preview (image gen)." },
    ],
    curl: [
      { label: "Generate content", value: `curl "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=$GEMINI_API_KEY" \\\n  -H "Content-Type: application/json" \\\n  -d '{"contents":[{"parts":[{"text":"Hello"}]}]}'` },
    ],
    troubleshooting: [
      { problem: "403 PERMISSION_DENIED", solution: "Key sem acesso ao modelo solicitado. Tente outro modelo ou habilite billing." },
    ],
  },

  supabase: {
    intro: "Postgres, Auth, Storage e Edge Functions gerenciados.",
    secretsExpected: ["SUPABASE_SERVICE_ROLE_KEY"],
    steps: [
      { title: "Pegue a service role key", body: "Project Settings → API → service_role secret. NUNCA exponha no frontend.", link: { label: "Supabase Dashboard", url: "https://supabase.com/dashboard" } },
      { title: "Configure RLS em todas as tabelas", body: "alter table public.xxx enable row level security; — crítico para segurança." },
      { title: "Salve SUPABASE_SERVICE_ROLE_KEY", body: "Apenas em Edge Functions/server. Frontend usa anon key (publishable)." },
    ],
    troubleshooting: [
      { problem: "JWT expired", solution: "Renove a sessão do usuário ou ajuste o tempo de expiração em Auth settings." },
      { problem: "permission denied for table", solution: "Adicione policies RLS apropriadas para o role authenticated/anon." },
    ],
  },

  resend: {
    intro: "Email transacional moderno com React Email integrado.",
    secretsExpected: ["RESEND_API_KEY"],
    steps: [
      { title: "Crie uma API key", body: "resend.com/api-keys → Create API key. Use sending-only para frontend.", link: { label: "Resend Dashboard", url: "https://resend.com/api-keys" } },
      { title: "Verifique seu domínio", body: "resend.com/domains → Add domain. Configure DNS records (SPF/DKIM/DMARC)." },
      { title: "Salve RESEND_API_KEY", body: "Cloud → Secrets → RESEND_API_KEY." },
    ],
    curl: [
      { label: "Enviar email", value: `curl https://api.resend.com/emails \\\n  -H "Authorization: Bearer $RESEND_API_KEY" \\\n  -H "Content-Type: application/json" \\\n  -d '{"from":"you@yourdomain.com","to":"to@example.com","subject":"Hi","html":"<p>Hello</p>"}'` },
    ],
    troubleshooting: [
      { problem: "Domain not verified", solution: "Aguarde a propagação DNS (até 48h) e clique em Verify novamente." },
    ],
  },

  slack: {
    intro: "Mensageria de workspace, bots e slash commands.",
    secretsExpected: ["SLACK_BOT_TOKEN", "SLACK_SIGNING_SECRET"],
    steps: [
      { title: "Crie um Slack App", body: "api.slack.com/apps → Create New App → From scratch.", link: { label: "Slack API", url: "https://api.slack.com/apps" } },
      { title: "Adicione bot scopes", body: "OAuth & Permissions → Bot Token Scopes: chat:write, channels:read, users:read." },
      { title: "Instale no workspace", body: "Install to Workspace → autorize. Copie o Bot User OAuth Token (xoxb-...)." },
      { title: "Salve secrets", body: "SLACK_BOT_TOKEN + SLACK_SIGNING_SECRET (Basic Information → App Credentials)." },
    ],
    curl: [
      { label: "Postar mensagem", value: `curl -X POST -H "Authorization: Bearer $SLACK_BOT_TOKEN" \\\n  -H "Content-Type: application/json" \\\n  -d '{"channel":"#general","text":"Hello from SevenOS"}' \\\n  https://slack.com/api/chat.postMessage` },
    ],
  },

  discord: {
    intro: "Bots, webhooks e events de guild.",
    secretsExpected: ["DISCORD_BOT_TOKEN"],
    steps: [
      { title: "Crie uma Application", body: "discord.com/developers/applications → New Application.", link: { label: "Discord Developer Portal", url: "https://discord.com/developers/applications" } },
      { title: "Adicione um bot", body: "Bot tab → Add Bot → Copy token." },
      { title: "Convide para o servidor", body: "OAuth2 → URL Generator → scopes: bot + applications.commands." },
      { title: "Salve DISCORD_BOT_TOKEN", body: "Cloud → Secrets." },
    ],
  },

  cloudflare: {
    intro: "DNS, CDN, Workers, R2 storage e Pages.",
    secretsExpected: ["CLOUDFLARE_API_TOKEN", "CLOUDFLARE_ACCOUNT_ID"],
    steps: [
      { title: "Crie um API Token", body: "dash.cloudflare.com/profile/api-tokens → Create Token.", link: { label: "Cloudflare API Tokens", url: "https://dash.cloudflare.com/profile/api-tokens" } },
      { title: "Pegue o Account ID", body: "Aparece na sidebar do dashboard (Overview)." },
      { title: "Salve secrets", body: "CLOUDFLARE_API_TOKEN + CLOUDFLARE_ACCOUNT_ID." },
    ],
  },

  sentry: {
    intro: "Error tracking, performance monitoring e releases.",
    secretsExpected: ["SENTRY_DSN", "SENTRY_AUTH_TOKEN"],
    steps: [
      { title: "Crie um projeto", body: "sentry.io → Projects → Create Project. Escolha plataforma (React).", link: { label: "Sentry", url: "https://sentry.io" } },
      { title: "Copie o DSN", body: "Settings → Client Keys (DSN). Use no SDK do frontend." },
      { title: "Gere Auth Token", body: "Settings → Auth Tokens → Create. Scope: project:read, project:releases." },
      { title: "Salve secrets", body: "SENTRY_DSN + SENTRY_AUTH_TOKEN." },
    ],
  },

  mercadopago: {
    intro: "Pix, cartão e boleto para o mercado LATAM.",
    secretsExpected: ["MERCADOPAGO_ACCESS_TOKEN"],
    steps: [
      { title: "Pegue o Access Token", body: "Mercado Pago Developers → Suas credenciais → Produção/Test.", link: { label: "MP Developers", url: "https://www.mercadopago.com.br/developers/panel/app" } },
      { title: "Salve MERCADOPAGO_ACCESS_TOKEN", body: "Cloud → Secrets." },
      { title: "Configure webhooks", body: "URL → sua função webhook-dispatch. Eventos: payment, merchant_order." },
    ],
  },
};

const STORAGE_KEY = (id: string) => `setup-guide-done:${id}`;

function CopyBlock({ value, label }: { value: string; label?: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <div className="relative group">
      {label && <div className="text-[10px] uppercase tracking-wider text-white/40 mb-1">{label}</div>}
      <pre className="text-[10px] font-mono p-2.5 bg-black/60 border border-white/10 rounded overflow-x-auto whitespace-pre-wrap break-all">
{value}
      </pre>
      <button
        onClick={() => {
          navigator.clipboard.writeText(value);
          setCopied(true);
          toast.success("Copiado");
          setTimeout(() => setCopied(false), 1500);
        }}
        className="absolute top-1.5 right-1.5 p-1 rounded bg-white/5 hover:bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity"
        aria-label="Copiar"
      >
        {copied ? <Check className="w-3 h-3 text-emerald-300" /> : <Copy className="w-3 h-3 text-white/60" />}
      </button>
    </div>
  );
}

export default function SetupGuideDrawer({
  providerId, open, onClose,
}: { providerId: string | null; open: boolean; onClose: () => void }) {
  const guide = providerId ? GUIDES[providerId] : null;
  const [done, setDone] = useState<Set<number>>(new Set());

  useEffect(() => {
    if (!providerId) return;
    try {
      const raw = localStorage.getItem(STORAGE_KEY(providerId));
      if (raw) setDone(new Set(JSON.parse(raw)));
      else setDone(new Set());
    } catch { setDone(new Set()); }
  }, [providerId]);

  const toggleDone = (i: number) => {
    setDone((d) => {
      const n = new Set(d);
      n.has(i) ? n.delete(i) : n.add(i);
      if (providerId) {
        try { localStorage.setItem(STORAGE_KEY(providerId), JSON.stringify([...n])); } catch {}
      }
      return n;
    });
  };

  return (
    <AnimatePresence>
      {open && guide && providerId && (
        <>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] bg-black/70 backdrop-blur-sm" onClick={onClose} />
          <motion.aside
            initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }}
            transition={{ type: "spring", stiffness: 320, damping: 30 }}
            className="fixed right-0 top-0 bottom-0 z-[60] w-full sm:w-[520px] bg-[#0a0a0a] border-l border-white/10 flex flex-col"
          >
            <header className="p-5 border-b border-white/10 flex items-start justify-between gap-3">
              <div className="min-w-0">
                <div className="flex items-center gap-2 text-xs uppercase tracking-[0.3em] text-white/40">
                  <BookOpen className="w-3.5 h-3.5" /> Guia de configuração
                </div>
                <h2 className="text-xl font-bold mt-1 capitalize">{providerId}</h2>
                <p className="text-sm text-white/60 mt-2">{guide.intro}</p>
                {guide.secretsExpected && (
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {guide.secretsExpected.map((s) => (
                      <span key={s} className="text-[10px] font-mono px-2 py-1 rounded-md bg-emerald-500/10 border border-emerald-500/30 text-emerald-300">
                        {s}
                      </span>
                    ))}
                  </div>
                )}
              </div>
              <button onClick={onClose} className="p-2 rounded-lg hover:bg-white/5 shrink-0"><X className="w-4 h-4" /></button>
            </header>

            <div className="flex-1 overflow-y-auto p-5 space-y-6">
              {/* Steps */}
              <section>
                <h3 className="text-[10px] uppercase tracking-[0.3em] text-white/40 mb-3">Passo a passo</h3>
                <div className="space-y-3">
                  {guide.steps.map((s, i) => {
                    const isDone = done.has(i);
                    return (
                      <motion.div key={i} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0, transition: { delay: i * 0.04 } }}
                        className={`p-4 rounded-xl border ${isDone ? "border-emerald-500/30 bg-emerald-500/5" : "border-white/10 bg-white/[0.02]"}`}>
                        <div className="flex items-start gap-3">
                          <button onClick={() => toggleDone(i)}
                            className={`mt-0.5 w-6 h-6 rounded-full border flex items-center justify-center shrink-0 ${isDone ? "border-emerald-400 bg-emerald-400/20" : "border-white/20 hover:border-white/50"}`}>
                            {isDone ? <CheckCircle2 className="w-4 h-4 text-emerald-300" /> : <span className="text-[11px] text-white/50">{i + 1}</span>}
                          </button>
                          <div className="min-w-0 flex-1">
                            <h4 className={`font-semibold ${isDone ? "line-through text-white/50" : ""}`}>{s.title}</h4>
                            <p className="text-sm text-white/60 mt-1">{s.body}</p>
                            {s.code && <div className="mt-2"><CopyBlock value={s.code.value} label={s.code.lang} /></div>}
                            {s.link && (
                              <a href={s.link.url} target="_blank" rel="noreferrer"
                                className="inline-flex items-center gap-1.5 mt-2 text-xs text-emerald-300 hover:text-emerald-200">
                                <ExternalLink className="w-3 h-3" /> {s.link.label}
                              </a>
                            )}
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              </section>

              {/* CURL */}
              {guide.curl && guide.curl.length > 0 && (
                <section>
                  <h3 className="text-[10px] uppercase tracking-[0.3em] text-white/40 mb-3">Exemplos CURL</h3>
                  <div className="space-y-3">
                    {guide.curl.map((c, i) => <CopyBlock key={i} value={c.value} label={c.label} />)}
                  </div>
                </section>
              )}

              {/* Troubleshooting */}
              {guide.troubleshooting && guide.troubleshooting.length > 0 && (
                <section>
                  <h3 className="text-[10px] uppercase tracking-[0.3em] text-white/40 mb-3 flex items-center gap-2">
                    <AlertCircle className="w-3 h-3" /> Troubleshooting
                  </h3>
                  <div className="space-y-2">
                    {guide.troubleshooting.map((t, i) => (
                      <div key={i} className="p-3 rounded-lg border border-amber-500/20 bg-amber-500/5">
                        <div className="text-xs font-semibold text-amber-200">{t.problem}</div>
                        <div className="text-xs text-white/70 mt-1">{t.solution}</div>
                      </div>
                    ))}
                  </div>
                </section>
              )}

              {/* FAQ */}
              {guide.faq && guide.faq.length > 0 && (
                <section>
                  <h3 className="text-[10px] uppercase tracking-[0.3em] text-white/40 mb-3 flex items-center gap-2">
                    <HelpCircle className="w-3 h-3" /> FAQ
                  </h3>
                  <div className="space-y-2">
                    {guide.faq.map((f, i) => (
                      <details key={i} className="p-3 rounded-lg border border-white/10 bg-white/[0.02]">
                        <summary className="cursor-pointer text-xs font-semibold text-white/90">{f.q}</summary>
                        <p className="text-xs text-white/60 mt-2">{f.a}</p>
                      </details>
                    ))}
                  </div>
                </section>
              )}
            </div>

            <footer className="p-4 border-t border-white/10 text-[11px] text-white/40 text-center tabular-nums">
              {done.size}/{guide.steps.length} passos concluídos
            </footer>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
