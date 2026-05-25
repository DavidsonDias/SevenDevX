/**
 * 📦 Provider Catalog — Branding oficial e metadados de 30+ providers
 * Logos via cdn.simpleicons.org (sem assets locais).
 */

export type ProviderCategory =
  | "desenvolvimento"
  | "deploy"
  | "cloud"
  | "banco_dados"
  | "payments"
  | "ia"
  | "comunicacao"
  | "monitoring"
  | "automacao"
  | "design"
  | "produtividade";

export interface CatalogProvider {
  id: string;
  name: string;
  slug: string; // simpleicons slug
  category: ProviderCategory;
  description: string;
  color: string; // brand hex
  secrets: string[];
  docs: string;
  hasTest?: boolean; // tem edge function *-test
  hasWebhook?: boolean;
  hasOAuth?: boolean;
  tagline?: string;
}

export const CATEGORY_LABEL: Record<ProviderCategory, string> = {
  desenvolvimento: "Desenvolvimento",
  deploy: "Deploy & CI/CD",
  cloud: "Cloud & Infra",
  banco_dados: "Banco de Dados",
  payments: "Pagamentos",
  ia: "Inteligência Artificial",
  comunicacao: "Comunicação",
  monitoring: "Monitoring & APM",
  automacao: "Automação",
  design: "Design",
  produtividade: "Produtividade",
};

export const PROVIDER_CATALOG: CatalogProvider[] = [
  // 🛠 Desenvolvimento
  { id: "github", name: "GitHub", slug: "github", category: "desenvolvimento", color: "#ffffff", description: "Repositórios, PRs, issues, Actions e webhooks.", secrets: ["GITHUB_TOKEN"], docs: "https://docs.github.com/en/rest", hasTest: true, hasWebhook: true, hasOAuth: true, tagline: "Source of truth" },
  { id: "gitlab", name: "GitLab", slug: "gitlab", category: "desenvolvimento", color: "#FC6D26", description: "Repos, pipelines e merge requests.", secrets: ["GITLAB_TOKEN"], docs: "https://docs.gitlab.com/api/", hasWebhook: true, hasOAuth: true },
  { id: "bitbucket", name: "Bitbucket", slug: "bitbucket", category: "desenvolvimento", color: "#2684FF", description: "Repos e pipelines Atlassian.", secrets: ["BITBUCKET_TOKEN"], docs: "https://developer.atlassian.com/cloud/bitbucket/", hasOAuth: true },

  // 🚀 Deploy
  { id: "vercel", name: "Vercel", slug: "vercel", category: "deploy", color: "#ffffff", description: "Deploys, projects, teams e domínios.", secrets: ["VERCEL_TOKEN"], docs: "https://vercel.com/docs/rest-api", hasTest: true, hasWebhook: true, tagline: "Edge-first" },
  { id: "netlify", name: "Netlify", slug: "netlify", category: "deploy", color: "#00C7B7", description: "Sites, forms e functions.", secrets: ["NETLIFY_TOKEN"], docs: "https://docs.netlify.com/api/get-started/", hasWebhook: true },
  { id: "railway", name: "Railway", slug: "railway", category: "deploy", color: "#9F5CFE", description: "Container deploys e DBs gerenciados.", secrets: ["RAILWAY_TOKEN"], docs: "https://docs.railway.app/" },
  { id: "render", name: "Render", slug: "render", category: "deploy", color: "#46E3B7", description: "Web services, workers e cron jobs.", secrets: ["RENDER_API_KEY"], docs: "https://api-docs.render.com/" },

  // ☁ Cloud
  { id: "cloudflare", name: "Cloudflare", slug: "cloudflare", category: "cloud", color: "#F38020", description: "DNS, CDN, Workers e R2 storage.", secrets: ["CLOUDFLARE_API_TOKEN", "CLOUDFLARE_ACCOUNT_ID"], docs: "https://developers.cloudflare.com/api/" },
  { id: "aws", name: "AWS", slug: "amazonaws", category: "cloud", color: "#FF9900", description: "S3, Lambda, SES, CloudWatch.", secrets: ["AWS_ACCESS_KEY_ID", "AWS_SECRET_ACCESS_KEY", "AWS_REGION"], docs: "https://docs.aws.amazon.com/" },
  { id: "gcp", name: "Google Cloud", slug: "googlecloud", category: "cloud", color: "#4285F4", description: "GCS, Cloud Run, BigQuery.", secrets: ["GCP_SERVICE_ACCOUNT_JSON"], docs: "https://cloud.google.com/apis", hasOAuth: true },
  { id: "docker", name: "Docker Hub", slug: "docker", category: "cloud", color: "#2496ED", description: "Container registry e imagens.", secrets: ["DOCKERHUB_USERNAME", "DOCKERHUB_TOKEN"], docs: "https://docs.docker.com/docker-hub/api/latest/" },

  // 🗄 Banco de Dados
  { id: "supabase", name: "Supabase", slug: "supabase", category: "banco_dados", color: "#3ECF8E", description: "Postgres, Auth, Storage e Edge Functions.", secrets: ["SUPABASE_SERVICE_ROLE_KEY"], docs: "https://supabase.com/docs", hasWebhook: true, tagline: "Postgres-native" },
  { id: "firebase", name: "Firebase", slug: "firebase", category: "banco_dados", color: "#FFCA28", description: "Realtime DB, Auth e Firestore.", secrets: ["FIREBASE_SERVICE_ACCOUNT_JSON"], docs: "https://firebase.google.com/docs" },
  { id: "neon", name: "Neon", slug: "neon", category: "banco_dados", color: "#00E599", description: "Postgres serverless com branching.", secrets: ["NEON_API_KEY"], docs: "https://neon.tech/docs" },
  { id: "postgresql", name: "PostgreSQL", slug: "postgresql", category: "banco_dados", color: "#4169E1", description: "Postgres self-hosted via connection string.", secrets: ["DATABASE_URL"], docs: "https://www.postgresql.org/docs/" },
  { id: "mongodb", name: "MongoDB Atlas", slug: "mongodb", category: "banco_dados", color: "#47A248", description: "Document database gerenciado.", secrets: ["MONGODB_URI"], docs: "https://www.mongodb.com/docs/atlas/api/" },
  { id: "redis", name: "Redis", slug: "redis", category: "banco_dados", color: "#DC382D", description: "Cache, pub/sub e queues.", secrets: ["REDIS_URL"], docs: "https://redis.io/docs/" },
  { id: "rabbitmq", name: "RabbitMQ", slug: "rabbitmq", category: "banco_dados", color: "#FF6600", description: "Message broker AMQP enterprise.", secrets: ["RABBITMQ_URL"], docs: "https://www.rabbitmq.com/documentation.html" },

  // 💳 Payments
  { id: "stripe", name: "Stripe", slug: "stripe", category: "payments", color: "#635BFF", description: "Pagamentos globais, subscriptions e billing.", secrets: ["STRIPE_SECRET_KEY", "STRIPE_WEBHOOK_SECRET"], docs: "https://stripe.com/docs/api", hasWebhook: true, tagline: "Global payments" },
  { id: "mercadopago", name: "Mercado Pago", slug: "mercadopago", category: "payments", color: "#00B1EA", description: "Pix, cartão e boleto para LATAM.", secrets: ["MERCADOPAGO_ACCESS_TOKEN"], docs: "https://www.mercadopago.com.br/developers/", hasWebhook: true },

  // 🧠 IA
  { id: "openai", name: "OpenAI", slug: "openai", category: "ia", color: "#10A37F", description: "GPT-5, embeddings, vision e assistants.", secrets: ["OPENAI_API_KEY"], docs: "https://platform.openai.com/docs" },
  { id: "gemini", name: "Google Gemini", slug: "googlegemini", category: "ia", color: "#4796E3", description: "Gemini 2.5/3 Pro, multimodal e Live API.", secrets: ["GEMINI_API_KEY"], docs: "https://ai.google.dev/docs" },
  { id: "anthropic", name: "Anthropic", slug: "anthropic", category: "ia", color: "#D97706", description: "Claude 4.5 Sonnet e Opus.", secrets: ["ANTHROPIC_API_KEY"], docs: "https://docs.anthropic.com/" },

  // 📨 Comunicação
  { id: "resend", name: "Resend", slug: "resend", category: "comunicacao", color: "#ffffff", description: "Email transacional moderno.", secrets: ["RESEND_API_KEY"], docs: "https://resend.com/docs", hasWebhook: true },
  { id: "slack", name: "Slack", slug: "slack", category: "comunicacao", color: "#4A154B", description: "Workspace messaging e bots.", secrets: ["SLACK_BOT_TOKEN", "SLACK_SIGNING_SECRET"], docs: "https://api.slack.com/", hasWebhook: true, hasOAuth: true },
  { id: "discord", name: "Discord", slug: "discord", category: "comunicacao", color: "#5865F2", description: "Bots, webhooks e guild events.", secrets: ["DISCORD_BOT_TOKEN"], docs: "https://discord.com/developers/docs", hasWebhook: true, hasOAuth: true },
  { id: "whatsapp", name: "WhatsApp Business", slug: "whatsapp", category: "comunicacao", color: "#25D366", description: "Cloud API da Meta para mensagens.", secrets: ["WHATSAPP_TOKEN", "WHATSAPP_PHONE_ID"], docs: "https://developers.facebook.com/docs/whatsapp", hasTest: true, hasWebhook: true },
  { id: "clerk", name: "Clerk", slug: "clerk", category: "comunicacao", color: "#6C47FF", description: "Auth, user management e orgs.", secrets: ["CLERK_SECRET_KEY"], docs: "https://clerk.com/docs", hasWebhook: true },
  { id: "auth0", name: "Auth0", slug: "auth0", category: "comunicacao", color: "#EB5424", description: "Identity-as-a-service enterprise.", secrets: ["AUTH0_DOMAIN", "AUTH0_CLIENT_SECRET"], docs: "https://auth0.com/docs", hasOAuth: true },
  { id: "google", name: "Google APIs", slug: "google", category: "comunicacao", color: "#4285F4", description: "Calendar, Drive, Gmail via OAuth 2.0.", secrets: ["GOOGLE_CLIENT_ID", "GOOGLE_CLIENT_SECRET"], docs: "https://developers.google.com/", hasOAuth: true },

  // 📊 Monitoring
  { id: "sentry", name: "Sentry", slug: "sentry", category: "monitoring", color: "#362D59", description: "Error tracking, performance e releases.", secrets: ["SENTRY_DSN", "SENTRY_AUTH_TOKEN"], docs: "https://docs.sentry.io/", hasWebhook: true },
  { id: "datadog", name: "Datadog", slug: "datadog", category: "monitoring", color: "#632CA6", description: "Observability completa: logs, metrics, APM.", secrets: ["DATADOG_API_KEY", "DATADOG_APP_KEY"], docs: "https://docs.datadoghq.com/api/" },
  { id: "grafana", name: "Grafana", slug: "grafana", category: "monitoring", color: "#F46800", description: "Dashboards, alerting e Loki.", secrets: ["GRAFANA_API_TOKEN", "GRAFANA_URL"], docs: "https://grafana.com/docs/grafana/latest/developers/http_api/" },

  // 🎨 Design
  { id: "figma", name: "Figma", slug: "figma", category: "design", color: "#F24E1E", description: "Files, variables e dev mode.", secrets: ["FIGMA_TOKEN"], docs: "https://www.figma.com/developers/api", hasTest: true, hasOAuth: true, tagline: "Design system" },
];

export const CATEGORY_LIST: Array<[ProviderCategory | "all", string]> = [
  ["all", "Tudo"],
  ...(Object.entries(CATEGORY_LABEL) as Array<[ProviderCategory, string]>),
];

export const findCatalogProvider = (id: string) =>
  PROVIDER_CATALOG.find((p) => p.id === id);

/** Logo URL com fallback automático (cdn.simpleicons.org). */
export const providerLogoUrl = (slug: string, color?: string) => {
  const hex = (color || "ffffff").replace("#", "");
  return `https://cdn.simpleicons.org/${slug}/${hex}`;
};
