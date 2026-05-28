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
import ProviderLogo from "./ProviderLogo";
import { useScrollLock } from "@/hooks/useScrollLock";
import { getCatalogProvider } from "./providerCatalog";

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

  gitlab: {
    intro: "Repositórios, pipelines CI/CD e merge requests no GitLab.",
    secretsExpected: ["GITLAB_TOKEN"],
    steps: [
      { title: "Crie um Personal Access Token", body: "GitLab → User Settings → Access Tokens. Scopes: api, read_repository.", link: { label: "GitLab Tokens", url: "https://gitlab.com/-/user_settings/personal_access_tokens" } },
      { title: "Salve GITLAB_TOKEN", body: "Cloud → Secrets → GITLAB_TOKEN." },
      { title: "Teste", body: "Use o wizard para validar /api/v4/user." },
    ],
    curl: [{ label: "Validar token", value: `curl -H "PRIVATE-TOKEN: $GITLAB_TOKEN" https://gitlab.com/api/v4/user` }],
    troubleshooting: [{ problem: "401 Unauthorized", solution: "Token expirado ou sem scope api." }],
  },

  bitbucket: {
    intro: "Repos e pipelines do ecossistema Atlassian.",
    secretsExpected: ["BITBUCKET_TOKEN", "BITBUCKET_USERNAME"],
    steps: [
      { title: "Crie um App Password", body: "Bitbucket → Personal settings → App passwords. Permissions: Repositories (read), Pull requests (read).", link: { label: "Bitbucket App Passwords", url: "https://bitbucket.org/account/settings/app-passwords/" } },
      { title: "Salve secrets", body: "BITBUCKET_USERNAME + BITBUCKET_TOKEN em Cloud → Secrets." },
    ],
    curl: [{ label: "Listar repos", value: `curl -u $BITBUCKET_USERNAME:$BITBUCKET_TOKEN https://api.bitbucket.org/2.0/repositories` }],
  },

  netlify: {
    intro: "Sites, forms e functions Netlify.",
    secretsExpected: ["NETLIFY_TOKEN"],
    steps: [
      { title: "Crie um Personal Access Token", body: "User settings → Applications → Personal access tokens → New token.", link: { label: "Netlify Tokens", url: "https://app.netlify.com/user/applications#personal-access-tokens" } },
      { title: "Salve NETLIFY_TOKEN", body: "Cloud → Secrets." },
    ],
    curl: [{ label: "Listar sites", value: `curl -H "Authorization: Bearer $NETLIFY_TOKEN" https://api.netlify.com/api/v1/sites` }],
  },

  railway: {
    intro: "Container deploys e bancos gerenciados.",
    secretsExpected: ["RAILWAY_TOKEN"],
    steps: [
      { title: "Pegue o token", body: "Railway → Account Settings → Tokens → Create.", link: { label: "Railway Tokens", url: "https://railway.app/account/tokens" } },
      { title: "Salve RAILWAY_TOKEN", body: "Cloud → Secrets." },
    ],
    curl: [{ label: "GraphQL me", value: `curl -X POST https://backboard.railway.app/graphql/v2 \\\n  -H "Authorization: Bearer $RAILWAY_TOKEN" \\\n  -H "Content-Type: application/json" \\\n  -d '{"query":"{ me { id email } }"}'` }],
  },

  render: {
    intro: "Web services, workers e cron jobs no Render.",
    secretsExpected: ["RENDER_API_KEY"],
    steps: [
      { title: "Crie uma API key", body: "Render Dashboard → Account Settings → API Keys.", link: { label: "Render API Keys", url: "https://dashboard.render.com/u/settings" } },
      { title: "Salve RENDER_API_KEY", body: "Cloud → Secrets." },
    ],
    curl: [{ label: "Listar services", value: `curl -H "Authorization: Bearer $RENDER_API_KEY" https://api.render.com/v1/services` }],
  },

  aws: {
    intro: "S3, Lambda, SES e CloudWatch via SDK.",
    secretsExpected: ["AWS_ACCESS_KEY_ID", "AWS_SECRET_ACCESS_KEY", "AWS_REGION"],
    steps: [
      { title: "Crie um IAM User", body: "IAM Console → Users → Create. Anexe políticas mínimas (princípio do menor privilégio).", link: { label: "AWS IAM", url: "https://console.aws.amazon.com/iam/" } },
      { title: "Gere Access Keys", body: "User → Security credentials → Create access key." },
      { title: "Salve secrets", body: "AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY e AWS_REGION (ex: us-east-1)." },
    ],
    troubleshooting: [
      { problem: "SignatureDoesNotMatch", solution: "Relógio fora de sincronia (NTP) ou chave incorreta." },
      { problem: "AccessDenied", solution: "Falta política IAM. Anexe a permissão correta ao user." },
    ],
  },

  gcp: {
    intro: "GCS, Cloud Run, BigQuery via Service Account.",
    secretsExpected: ["GCP_SERVICE_ACCOUNT_JSON"],
    steps: [
      { title: "Crie Service Account", body: "IAM & Admin → Service Accounts → Create. Conceda roles necessárias.", link: { label: "GCP Console", url: "https://console.cloud.google.com/iam-admin/serviceaccounts" } },
      { title: "Gere chave JSON", body: "Keys → Add Key → JSON. Cole o JSON inteiro em GCP_SERVICE_ACCOUNT_JSON." },
    ],
  },

  docker: {
    intro: "Container registry e imagens Docker Hub.",
    secretsExpected: ["DOCKERHUB_USERNAME", "DOCKERHUB_TOKEN"],
    steps: [
      { title: "Crie um Access Token", body: "Docker Hub → Account Settings → Security → New Access Token.", link: { label: "Docker Hub Security", url: "https://hub.docker.com/settings/security" } },
      { title: "Salve secrets", body: "DOCKERHUB_USERNAME + DOCKERHUB_TOKEN." },
    ],
  },

  firebase: {
    intro: "Realtime DB, Firestore, Auth e Cloud Functions.",
    secretsExpected: ["FIREBASE_SERVICE_ACCOUNT_JSON"],
    steps: [
      { title: "Pegue a Service Account", body: "Firebase Console → Project Settings → Service Accounts → Generate new private key.", link: { label: "Firebase Console", url: "https://console.firebase.google.com" } },
      { title: "Salve FIREBASE_SERVICE_ACCOUNT_JSON", body: "Cole o JSON inteiro em Cloud → Secrets." },
    ],
  },

  neon: {
    intro: "Postgres serverless com database branching.",
    secretsExpected: ["NEON_API_KEY"],
    steps: [
      { title: "Pegue a API key", body: "Neon Console → Account Settings → API Keys → Create.", link: { label: "Neon Console", url: "https://console.neon.tech" } },
      { title: "Salve NEON_API_KEY", body: "Cloud → Secrets." },
    ],
    curl: [{ label: "Listar projects", value: `curl -H "Authorization: Bearer $NEON_API_KEY" https://console.neon.tech/api/v2/projects` }],
  },

  postgresql: {
    intro: "PostgreSQL self-hosted ou managed via connection string.",
    secretsExpected: ["DATABASE_URL"],
    steps: [
      { title: "Pegue sua connection string", body: "Formato: postgresql://user:pass@host:5432/db?sslmode=require" },
      { title: "Salve DATABASE_URL", body: "Cloud → Secrets. Sempre use sslmode=require em produção." },
      { title: "Whitelist do IP", body: "Adicione os IPs do Lovable Cloud no firewall do banco se necessário." },
    ],
    troubleshooting: [
      { problem: "connection timeout", solution: "Firewall bloqueando. Permita egress 0.0.0.0/0 ou IPs específicos." },
      { problem: "SSL required", solution: "Anexe ?sslmode=require na connection string." },
    ],
  },

  mongodb: {
    intro: "MongoDB Atlas document database gerenciado.",
    secretsExpected: ["MONGODB_URI"],
    steps: [
      { title: "Crie cluster", body: "Atlas → Database → Build a Database.", link: { label: "MongoDB Atlas", url: "https://cloud.mongodb.com" } },
      { title: "Configure Network Access", body: "Allow access from anywhere (0.0.0.0/0) ou whitelist específico." },
      { title: "Crie Database User", body: "Database Access → Add New Database User." },
      { title: "Salve MONGODB_URI", body: "Connect → Drivers → copie a connection string." },
    ],
  },

  redis: {
    intro: "Cache, pub/sub e job queues.",
    secretsExpected: ["REDIS_URL"],
    steps: [
      { title: "Provisione Redis", body: "Use Upstash, Redis Cloud, Railway ou self-hosted.", link: { label: "Upstash", url: "https://upstash.com" } },
      { title: "Salve REDIS_URL", body: "Formato: redis://default:pass@host:6379 (ou rediss:// para TLS)." },
    ],
  },

  rabbitmq: {
    intro: "Message broker AMQP enterprise.",
    secretsExpected: ["RABBITMQ_URL"],
    steps: [
      { title: "Provisione RabbitMQ", body: "Use CloudAMQP, Amazon MQ ou self-hosted.", link: { label: "CloudAMQP", url: "https://www.cloudamqp.com" } },
      { title: "Salve RABBITMQ_URL", body: "Formato: amqps://user:pass@host:5671/vhost." },
    ],
  },

  anthropic: {
    intro: "Claude 4.5 Sonnet e Opus para conversas avançadas.",
    secretsExpected: ["ANTHROPIC_API_KEY"],
    steps: [
      { title: "Crie uma API key", body: "console.anthropic.com → API Keys → Create Key.", link: { label: "Anthropic Console", url: "https://console.anthropic.com" } },
      { title: "Salve ANTHROPIC_API_KEY", body: "Cloud → Secrets." },
    ],
    curl: [{ label: "Messages", value: `curl https://api.anthropic.com/v1/messages \\\n  -H "x-api-key: $ANTHROPIC_API_KEY" \\\n  -H "anthropic-version: 2023-06-01" \\\n  -H "content-type: application/json" \\\n  -d '{"model":"claude-sonnet-4-5","max_tokens":1024,"messages":[{"role":"user","content":"Hi"}]}'` }],
  },

  clerk: {
    intro: "Auth, user management e organizations.",
    secretsExpected: ["CLERK_SECRET_KEY"],
    steps: [
      { title: "Crie uma application", body: "Clerk Dashboard → Applications → Create.", link: { label: "Clerk Dashboard", url: "https://dashboard.clerk.com" } },
      { title: "Pegue Secret Key", body: "API Keys → Backend → Secret Key (sk_live_... / sk_test_...)." },
      { title: "Configure webhooks", body: "Webhooks → Add Endpoint → cole sua função webhook-dispatch URL." },
    ],
  },

  auth0: {
    intro: "Identity-as-a-service enterprise.",
    secretsExpected: ["AUTH0_DOMAIN", "AUTH0_CLIENT_ID", "AUTH0_CLIENT_SECRET"],
    steps: [
      { title: "Crie um tenant", body: "Auth0 Dashboard → Create Tenant.", link: { label: "Auth0", url: "https://manage.auth0.com" } },
      { title: "Crie uma Application", body: "Applications → Create → Machine to Machine (server) ou Regular Web App." },
      { title: "Salve secrets", body: "AUTH0_DOMAIN (tenant.us.auth0.com), AUTH0_CLIENT_ID e AUTH0_CLIENT_SECRET." },
    ],
  },

  datadog: {
    intro: "Observability completa: logs, métricas e APM.",
    secretsExpected: ["DATADOG_API_KEY", "DATADOG_APP_KEY"],
    steps: [
      { title: "Pegue as keys", body: "Organization Settings → API Keys + Application Keys.", link: { label: "Datadog", url: "https://app.datadoghq.com" } },
      { title: "Salve secrets", body: "DATADOG_API_KEY (server) + DATADOG_APP_KEY (queries)." },
    ],
  },

  grafana: {
    intro: "Dashboards, alerting e Loki logs.",
    secretsExpected: ["GRAFANA_URL", "GRAFANA_API_TOKEN"],
    steps: [
      { title: "Crie um Service Account", body: "Administration → Service accounts → Add. Gere token com role Editor.", link: { label: "Grafana Cloud", url: "https://grafana.com" } },
      { title: "Salve secrets", body: "GRAFANA_URL (ex: https://myorg.grafana.net) + GRAFANA_API_TOKEN." },
    ],
  },

  make: {
    intro: "Cenários de automação visual, webhooks instantâneos e orquestrações entre apps.",
    secretsExpected: ["MAKE_API_TOKEN"],
    steps: [
      { title: "Crie um token de API", body: "Make → Profile → API → Tokens. Gere um token com acesso ao organization/scenarios necessários.", link: { label: "Make API", url: "https://www.make.com/en/api-documentation" } },
      { title: "Salve MAKE_API_TOKEN", body: "Adicione o secret no backend. O teste valida presença do token e libera automações/Webhooks." },
      { title: "Configure um Custom Webhook", body: "No Make, crie um módulo Webhooks → Custom webhook e use a URL gerada em fluxos SevenOS quando precisar disparar cenários." },
      { title: "Teste no SevenOS", body: "Use Testar para validar secrets e Guia para revisar escopos; depois habilite On." },
    ],
    troubleshooting: [
      { problem: "Scenario não dispara", solution: "Confirme se o webhook do Make está ativo e se o scenario foi salvo com o gatilho correto." },
      { problem: "Token sem acesso", solution: "Gere token no mesmo organization onde os cenários estão criados." },
    ],
  },

  n8n: {
    intro: "Workflows self-hosted/cloud com API key, webhooks e execução programática.",
    secretsExpected: ["N8N_BASE_URL", "N8N_API_KEY"],
    steps: [
      { title: "Habilite a Public API", body: "n8n → Settings → API → crie uma API key. Em self-hosted, confirme que N8N_PUBLIC_API_DISABLED não está ativo.", link: { label: "n8n API", url: "https://docs.n8n.io/api/" } },
      { title: "Salve N8N_BASE_URL", body: "Use a URL pública do n8n sem barra final, por exemplo https://n8n.suaempresa.com." },
      { title: "Salve N8N_API_KEY", body: "Cole a API key nos Secrets do backend. O teste lista workflows via /api/v1/workflows." },
      { title: "Configure Webhook nodes", body: "Para eventos em tempo real, crie Webhook nodes no n8n e direcione eventos SevenOS para essas URLs." },
    ],
    curl: [{ label: "Listar workflows", value: `curl -H "X-N8N-API-KEY: $N8N_API_KEY" "$N8N_BASE_URL/api/v1/workflows?limit=5"` }],
    troubleshooting: [
      { problem: "404 na API", solution: "Confirme URL base, versão do n8n e se a Public API está habilitada." },
      { problem: "401 Unauthorized", solution: "API key inválida ou removida; gere novamente no usuário correto." },
    ],
  },

  zapier: {
    intro: "Automação no-code com Webhooks by Zapier e integrações entre milhares de apps.",
    secretsExpected: ["ZAPIER_API_KEY"],
    steps: [
      { title: "Escolha o modelo de integração", body: "Para webhooks, use Webhooks by Zapier → Catch Hook. Para APIs avançadas, use Zapier Platform/Interfaces conforme sua conta." , link: { label: "Zapier Developer", url: "https://zapier.com/developer" } },
      { title: "Crie e salve ZAPIER_API_KEY", body: "Quando usar Zapier APIs/Interfaces, salve a key como ZAPIER_API_KEY. Para Catch Hook simples, guarde a webhook URL no fluxo." },
      { title: "Mapeie payloads", body: "Padronize campos como event, provider_id, lead_id, email, phone e metadata para facilitar replay e observability." },
      { title: "Valide no SevenOS", body: "O teste confirma credencial configurada e o guia mantém checklist operacional do setup." },
    ],
    troubleshooting: [
      { problem: "Zap não recebe payload", solution: "Confirme se o Zap está publicado e se a URL do Catch Hook é a URL de produção." },
      { problem: "Campos não aparecem", solution: "Envie um payload de teste e clique em Retest trigger dentro do Zapier." },
    ],
  },

  telegram: {
    intro: "Bot API para mensagens, alertas operacionais e notificações internas.",
    secretsExpected: ["TELEGRAM_BOT_TOKEN"],
    steps: [
      { title: "Crie o bot no BotFather", body: "Abra @BotFather no Telegram → /newbot → copie o token gerado.", link: { label: "Telegram Bot API", url: "https://core.telegram.org/bots/api" } },
      { title: "Salve TELEGRAM_BOT_TOKEN", body: "Adicione o token nos Secrets. O teste real chama getMe e retorna o username do bot." },
      { title: "Configure destinos", body: "Adicione o bot em grupos/canais e capture chat_id para automações de alerta." },
    ],
    curl: [{ label: "Validar bot", value: `curl "https://api.telegram.org/bot$TELEGRAM_BOT_TOKEN/getMe"` }],
    troubleshooting: [{ problem: "Bot não envia em grupo", solution: "Adicione o bot ao grupo e conceda permissão para postar mensagens." }],
  },

  twilio: {
    intro: "SMS, voz e WhatsApp via API Twilio com account validation real.",
    secretsExpected: ["TWILIO_ACCOUNT_SID", "TWILIO_AUTH_TOKEN"],
    steps: [
      { title: "Pegue Account SID e Auth Token", body: "Twilio Console → Account Info. Use subaccounts para isolar ambientes.", link: { label: "Twilio Console", url: "https://console.twilio.com" } },
      { title: "Salve TWILIO_ACCOUNT_SID e TWILIO_AUTH_TOKEN", body: "O teste real faz lookup da conta e retorna status/friendly name." },
      { title: "Configure números e webhooks", body: "Phone Numbers → Messaging/Voice webhook apontando para webhook-dispatch quando precisar receber eventos." },
    ],
    curl: [{ label: "Validar conta", value: `curl -u "$TWILIO_ACCOUNT_SID:$TWILIO_AUTH_TOKEN" "https://api.twilio.com/2010-04-01/Accounts/$TWILIO_ACCOUNT_SID.json"` }],
    troubleshooting: [{ problem: "Authenticate", solution: "SID/Auth Token pertencem a contas diferentes ou token foi rotacionado." }],
  },

  googlecalendar: {
    intro: "Agendas, eventos e convites via OAuth 2.0 do Google Calendar.",
    secretsExpected: ["GOOGLE_CLIENT_ID", "GOOGLE_CLIENT_SECRET"],
    steps: [
      { title: "Configure OAuth Consent Screen", body: "Google Cloud → APIs & Services → OAuth consent screen. Adicione escopos calendar.readonly/calendar.events conforme uso." , link: { label: "Google Cloud Console", url: "https://console.cloud.google.com/apis/credentials" } },
      { title: "Crie OAuth Client Web", body: "Credentials → Create OAuth client ID → Web application. Cadastre o redirect URI do SevenOS." },
      { title: "Salve GOOGLE_CLIENT_ID e GOOGLE_CLIENT_SECRET", body: "Esses secrets habilitam o wizard OAuth e testes assistidos." },
      { title: "Habilite Calendar API", body: "APIs & Services → Library → Google Calendar API → Enable." },
    ],
    troubleshooting: [
      { problem: "redirect_uri_mismatch", solution: "Copie exatamente o redirect URI mostrado pelo SevenOS para o Google Cloud." },
      { problem: "App não verificado", solution: "Em modo Testing, adicione seu e-mail em Test users." },
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

function buildGenericGuide(providerId: string): Guide {
  const upper = providerId.toUpperCase().replace(/[^A-Z0-9]/g, "_");
  return {
    intro:
      "Guia operacional para conectar credenciais, validar secrets, registrar webhooks e executar teste guiado no SevenOS.",
    secretsExpected: [`${upper}_API_KEY`],
    steps: [
      {
        title: "Obtenha as credenciais no painel do provider",
        body: "Acesse o painel oficial do provider, crie uma API key (ou access token) com escopo de leitura adequado e copie o valor com segurança.",
      },
      {
        title: `Salve o secret ${upper}_API_KEY`,
        body: "Abra Cloud → Secrets, clique em Adicionar secret e cole a credencial. Edge functions e testes terão acesso automaticamente.",
      },
      {
        title: "Configure webhook (opcional)",
        body: "Se o provider suportar webhooks, aponte para sua função webhook-dispatch para receber eventos em tempo real.",
      },
      {
        title: "Teste a conexão",
        body: "Volte ao SevenOS, abra o modal do provider e use o botão Testar ou o Wizard guiado para validar a credencial.",
      },
    ],
    troubleshooting: [
      { problem: "401 Unauthorized", solution: "Credencial inválida ou expirada — gere uma nova no painel do provider." },
      { problem: "Timeout", solution: "Confira região/endpoint corretos e se sua conta está ativa no provider." },
    ],
  };
}

export default function SetupGuideDrawer({
  providerId, open, onClose,
}: { providerId: string | null; open: boolean; onClose: () => void }) {
  const guide = providerId ? (GUIDES[providerId] ?? buildGenericGuide(providerId)) : null;
  const providerMeta = providerId ? getCatalogProvider(providerId) : null;
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
              <div className="min-w-0 flex items-start gap-3">
                {providerMeta && <ProviderLogo slug={providerMeta.slug} color={providerMeta.color} name={providerMeta.name} size={46} />}
                <div className="min-w-0">
                  <div className="flex items-center gap-2 text-xs uppercase tracking-[0.3em] text-white/40">
                    <BookOpen className="w-3.5 h-3.5" /> Guia de configuração
                  </div>
                  <h2 className="text-xl font-bold mt-1">{providerMeta?.name ?? providerId}</h2>
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
