/**
 * 📦 Provider Catalog Enterprise — 100+ providers com branding oficial.
 * Logos via cdn.simpleicons.org com fallback local-first.
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
  | "produtividade"
  | "analytics"
  | "crm"
  | "storage"
  | "marketing";

export type ProviderBadge = "official" | "verified" | "popular" | "recommended" | "enterprise" | "beta" | "new" | "premium";

/** Campo persistido em system_settings (gerenciável pelo próprio tenant, sem Lovable Cloud) */
export interface TenantSettingField {
  key: string;            // chave em system_settings (ex: whatsapp_token)
  label: string;
  placeholder?: string;
  help?: string;
  secret?: boolean;       // renderiza como password e mascara
  required?: boolean;
}

export interface CatalogProvider {
  id: string;
  name: string;
  slug: string;
  category: ProviderCategory;
  description: string;
  color: string;
  secrets: string[];
  docs: string;
  hasTest?: boolean;
  hasWebhook?: boolean;
  hasOAuth?: boolean;
  tagline?: string;
  badges?: ProviderBadge[];
  /** Configurações persistidas em system_settings (não usam Lovable Cloud secrets) */
  tenantSettings?: TenantSettingField[];
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
  analytics: "Analytics",
  crm: "CRM & Vendas",
  storage: "Storage & Arquivos",
  marketing: "Marketing",
};

const P = (p: CatalogProvider): CatalogProvider => p;

export const PROVIDER_CATALOG: CatalogProvider[] = [
  // 🧠 IA — expandido
  P({ id: "openai", name: "OpenAI", slug: "openai", category: "ia", color: "#10A37F", description: "GPT-5, embeddings, vision, assistants e Realtime.", secrets: ["OPENAI_API_KEY"], hasTest: true, docs: "https://platform.openai.com/docs", tagline: "AGI lab", badges: ["official", "popular", "recommended"] }),
  P({ id: "anthropic", name: "Anthropic", slug: "anthropic", category: "ia", color: "#D97706", description: "Claude 4.5 Sonnet, Opus e Haiku.", secrets: ["ANTHROPIC_API_KEY"], docs: "https://docs.anthropic.com/", badges: ["official", "popular"] }),
  P({ id: "gemini", name: "Google Gemini", slug: "googlegemini", category: "ia", color: "#4796E3", description: "Gemini 2.5/3 Pro, multimodal e Live API.", secrets: ["GEMINI_API_KEY"], docs: "https://ai.google.dev/docs", badges: ["official", "popular"] }),
  P({ id: "grok", name: "xAI Grok", slug: "x", category: "ia", color: "#ffffff", description: "Grok 4 com reasoning e real-time web.", secrets: ["XAI_API_KEY"], docs: "https://docs.x.ai/", badges: ["official", "new"] }),
  P({ id: "deepseek", name: "DeepSeek", slug: "deepseek", category: "ia", color: "#4D6BFE", description: "DeepSeek V3 e R1 reasoning.", secrets: ["DEEPSEEK_API_KEY"], docs: "https://api-docs.deepseek.com/", badges: ["new"] }),
  P({ id: "mistral", name: "Mistral AI", slug: "mistralai", category: "ia", color: "#FA520F", description: "Mistral Large, Codestral e Pixtral.", secrets: ["MISTRAL_API_KEY"], docs: "https://docs.mistral.ai/" }),
  P({ id: "cohere", name: "Cohere", slug: "cohere", category: "ia", color: "#39594D", description: "Command R+, embeddings e rerank.", secrets: ["COHERE_API_KEY"], docs: "https://docs.cohere.com/" }),
  P({ id: "perplexity", name: "Perplexity", slug: "perplexity", category: "ia", color: "#1FB8CD", description: "Sonar com web search nativa.", secrets: ["PERPLEXITY_API_KEY"], docs: "https://docs.perplexity.ai/", badges: ["new"] }),
  P({ id: "huggingface", name: "Hugging Face", slug: "huggingface", category: "ia", color: "#FFD21E", description: "Inference API e 500k+ modelos open.", secrets: ["HUGGINGFACE_TOKEN"], docs: "https://huggingface.co/docs", badges: ["popular"] }),
  P({ id: "elevenlabs", name: "ElevenLabs", slug: "elevenlabs", category: "ia", color: "#ffffff", description: "Text-to-speech ultra realista e voice cloning.", secrets: ["ELEVENLABS_API_KEY"], docs: "https://elevenlabs.io/docs", badges: ["premium"] }),
  P({ id: "assemblyai", name: "AssemblyAI", slug: "assemblyai", category: "ia", color: "#2C2A8B", description: "Speech-to-text, summarization e LeMUR.", secrets: ["ASSEMBLYAI_API_KEY"], docs: "https://www.assemblyai.com/docs" }),
  P({ id: "replicate", name: "Replicate", slug: "replicate", category: "ia", color: "#ffffff", description: "Run open-source models via API.", secrets: ["REPLICATE_API_TOKEN"], docs: "https://replicate.com/docs" }),
  P({ id: "runwayml", name: "Runway", slug: "runway", category: "ia", color: "#ffffff", description: "Gen-3 Alpha para vídeo generativo.", secrets: ["RUNWAY_API_KEY"], docs: "https://docs.dev.runwayml.com/", badges: ["premium"] }),
  P({ id: "stability", name: "Stability AI", slug: "stabilityai", category: "ia", color: "#E33B96", description: "Stable Diffusion 3 e SDXL via API.", secrets: ["STABILITY_API_KEY"], docs: "https://platform.stability.ai/docs" }),

  // 🛠 Desenvolvimento
  P({ id: "github", name: "GitHub", slug: "github", category: "desenvolvimento", color: "#ffffff", description: "Repositórios, PRs, issues, Actions e webhooks.", secrets: ["GITHUB_TOKEN"], docs: "https://docs.github.com/en/rest", hasTest: true, hasWebhook: true, hasOAuth: true, tagline: "Source of truth", badges: ["official", "popular", "recommended"] }),
  P({ id: "gitlab", name: "GitLab", slug: "gitlab", category: "desenvolvimento", color: "#FC6D26", description: "Repos, pipelines e merge requests.", secrets: ["GITLAB_TOKEN"], docs: "https://docs.gitlab.com/api/", hasWebhook: true, hasOAuth: true, badges: ["official"] }),
  P({ id: "bitbucket", name: "Bitbucket", slug: "bitbucket", category: "desenvolvimento", color: "#2684FF", description: "Repos e pipelines Atlassian.", secrets: ["BITBUCKET_TOKEN"], docs: "https://developer.atlassian.com/cloud/bitbucket/", hasOAuth: true, badges: ["official"] }),
  P({ id: "jira", name: "Jira", slug: "jira", category: "desenvolvimento", color: "#0052CC", description: "Issues, sprints e workflows Atlassian.", secrets: ["JIRA_API_TOKEN", "JIRA_EMAIL"], docs: "https://developer.atlassian.com/cloud/jira/", hasOAuth: true, badges: ["enterprise"] }),
  P({ id: "sonarqube", name: "SonarQube", slug: "sonarqube", category: "desenvolvimento", color: "#4E9BCD", description: "Static analysis e code quality.", secrets: ["SONAR_TOKEN", "SONAR_HOST_URL"], docs: "https://docs.sonarsource.com/sonarqube/" }),
  P({ id: "codecov", name: "Codecov", slug: "codecov", category: "desenvolvimento", color: "#F01F7A", description: "Coverage reports e diff coverage.", secrets: ["CODECOV_TOKEN"], docs: "https://docs.codecov.com/" }),

  // 🚀 Deploy & CI/CD
  P({ id: "vercel", name: "Vercel", slug: "vercel", category: "deploy", color: "#ffffff", description: "Deploys, projects, teams e domínios.", secrets: ["VERCEL_TOKEN"], docs: "https://vercel.com/docs/rest-api", hasTest: true, hasWebhook: true, tagline: "Edge-first", badges: ["official", "popular", "recommended"] }),
  P({ id: "netlify", name: "Netlify", slug: "netlify", category: "deploy", color: "#00C7B7", description: "Sites, forms e functions.", secrets: ["NETLIFY_TOKEN"], docs: "https://docs.netlify.com/api/get-started/", hasWebhook: true, badges: ["official"] }),
  P({ id: "railway", name: "Railway", slug: "railway", category: "deploy", color: "#9F5CFE", description: "Container deploys e DBs gerenciados.", secrets: ["RAILWAY_TOKEN"], docs: "https://docs.railway.app/" }),
  P({ id: "render", name: "Render", slug: "render", category: "deploy", color: "#46E3B7", description: "Web services, workers e cron jobs.", secrets: ["RENDER_API_KEY"], docs: "https://api-docs.render.com/" }),
  P({ id: "flyio", name: "Fly.io", slug: "fly", category: "deploy", color: "#8B5CF6", description: "Global app servers em VMs Firecracker.", secrets: ["FLY_API_TOKEN"], docs: "https://fly.io/docs/" }),
  P({ id: "jenkins", name: "Jenkins", slug: "jenkins", category: "deploy", color: "#D33833", description: "CI/CD self-hosted.", secrets: ["JENKINS_URL", "JENKINS_TOKEN"], docs: "https://www.jenkins.io/doc/book/using/remote-access-api/" }),
  P({ id: "argocd", name: "Argo CD", slug: "argo", category: "deploy", color: "#EF7B4D", description: "GitOps continuous delivery para K8s.", secrets: ["ARGOCD_TOKEN", "ARGOCD_URL"], docs: "https://argo-cd.readthedocs.io/", badges: ["enterprise"] }),
  P({ id: "terraform", name: "Terraform Cloud", slug: "terraform", category: "deploy", color: "#7B42BC", description: "IaC workspaces, plans e applies.", secrets: ["TFC_TOKEN"], docs: "https://developer.hashicorp.com/terraform/cloud-docs/api-docs", badges: ["enterprise"] }),
  P({ id: "circleci", name: "CircleCI", slug: "circleci", category: "deploy", color: "#343434", description: "CI/CD pipelines com orbs.", secrets: ["CIRCLECI_TOKEN"], docs: "https://circleci.com/docs/api/" }),

  // ☁ Cloud & Infra
  P({ id: "aws", name: "AWS", slug: "amazonaws", category: "cloud", color: "#FF9900", description: "S3, Lambda, SES, CloudWatch e mais.", secrets: ["AWS_ACCESS_KEY_ID", "AWS_SECRET_ACCESS_KEY", "AWS_REGION"], docs: "https://docs.aws.amazon.com/", badges: ["official", "popular", "enterprise"] }),
  P({ id: "azure", name: "Microsoft Azure", slug: "microsoftazure", category: "cloud", color: "#0078D4", description: "Compute, Storage, AI Services.", secrets: ["AZURE_CLIENT_ID", "AZURE_CLIENT_SECRET", "AZURE_TENANT_ID"], docs: "https://learn.microsoft.com/en-us/rest/api/azure/", badges: ["official", "enterprise"] }),
  P({ id: "gcp", name: "Google Cloud", slug: "googlecloud", category: "cloud", color: "#4285F4", description: "GCS, Cloud Run, BigQuery, Vertex.", secrets: ["GCP_SERVICE_ACCOUNT_JSON"], docs: "https://cloud.google.com/apis", hasOAuth: true, badges: ["official", "enterprise"] }),
  P({ id: "cloudflare", name: "Cloudflare", slug: "cloudflare", category: "cloud", color: "#F38020", description: "DNS, CDN, Workers e R2 storage.", secrets: ["CLOUDFLARE_API_TOKEN", "CLOUDFLARE_ACCOUNT_ID"], docs: "https://developers.cloudflare.com/api/", badges: ["official", "popular"] }),
  P({ id: "digitalocean", name: "DigitalOcean", slug: "digitalocean", category: "cloud", color: "#0080FF", description: "Droplets, App Platform e Spaces.", secrets: ["DIGITALOCEAN_TOKEN"], docs: "https://docs.digitalocean.com/reference/api/" }),
  P({ id: "oraclecloud", name: "Oracle Cloud", slug: "oracle", category: "cloud", color: "#F80000", description: "OCI compute, storage e DB.", secrets: ["OCI_USER_OCID", "OCI_KEY", "OCI_TENANCY"], docs: "https://docs.oracle.com/en-us/iaas/api/", badges: ["enterprise"] }),
  P({ id: "vultr", name: "Vultr", slug: "vultr", category: "cloud", color: "#007BFC", description: "Cloud compute global.", secrets: ["VULTR_API_KEY"], docs: "https://www.vultr.com/api/" }),
  P({ id: "hetzner", name: "Hetzner", slug: "hetzner", category: "cloud", color: "#D50C2D", description: "Cloud e dedicated servers EU.", secrets: ["HETZNER_TOKEN"], docs: "https://docs.hetzner.cloud/" }),
  P({ id: "docker", name: "Docker Hub", slug: "docker", category: "cloud", color: "#2496ED", description: "Container registry e imagens.", secrets: ["DOCKERHUB_USERNAME", "DOCKERHUB_TOKEN"], docs: "https://docs.docker.com/docker-hub/api/latest/" }),
  P({ id: "kubernetes", name: "Kubernetes", slug: "kubernetes", category: "cloud", color: "#326CE5", description: "Orquestração de containers.", secrets: ["KUBECONFIG"], docs: "https://kubernetes.io/docs/reference/kubernetes-api/", badges: ["enterprise"] }),

  // 🗄 Banco de Dados
  P({ id: "supabase", name: "Supabase", slug: "supabase", category: "banco_dados", color: "#3ECF8E", description: "Postgres, Auth, Storage e Edge Functions.", secrets: ["SUPABASE_SERVICE_ROLE_KEY"], docs: "https://supabase.com/docs", hasWebhook: true, tagline: "Postgres-native", badges: ["official", "popular", "recommended"] }),
  P({ id: "firebase", name: "Firebase", slug: "firebase", category: "banco_dados", color: "#FFCA28", description: "Realtime DB, Auth e Firestore.", secrets: ["FIREBASE_SERVICE_ACCOUNT_JSON"], docs: "https://firebase.google.com/docs", badges: ["official"] }),
  P({ id: "neon", name: "Neon", slug: "neon", category: "banco_dados", color: "#00E599", description: "Postgres serverless com branching.", secrets: ["NEON_API_KEY"], docs: "https://neon.tech/docs", badges: ["new"] }),
  P({ id: "planetscale", name: "PlanetScale", slug: "planetscale", category: "banco_dados", color: "#ffffff", description: "MySQL serverless com branching.", secrets: ["PLANETSCALE_TOKEN"], docs: "https://planetscale.com/docs" }),
  P({ id: "cockroachdb", name: "CockroachDB", slug: "cockroachlabs", category: "banco_dados", color: "#6933FF", description: "Distributed SQL global.", secrets: ["COCKROACH_URL"], docs: "https://www.cockroachlabs.com/docs/", badges: ["enterprise"] }),
  P({ id: "postgresql", name: "PostgreSQL", slug: "postgresql", category: "banco_dados", color: "#4169E1", description: "Postgres self-hosted via connection string.", secrets: ["DATABASE_URL"], docs: "https://www.postgresql.org/docs/" }),
  P({ id: "mysql", name: "MySQL", slug: "mysql", category: "banco_dados", color: "#4479A1", description: "MySQL via connection string.", secrets: ["MYSQL_URL"], docs: "https://dev.mysql.com/doc/" }),
  P({ id: "mariadb", name: "MariaDB", slug: "mariadb", category: "banco_dados", color: "#003545", description: "Fork open-source do MySQL.", secrets: ["MARIADB_URL"], docs: "https://mariadb.org/documentation/" }),
  P({ id: "mongodb", name: "MongoDB Atlas", slug: "mongodb", category: "banco_dados", color: "#47A248", description: "Document database gerenciado.", secrets: ["MONGODB_URI"], docs: "https://www.mongodb.com/docs/atlas/api/", badges: ["popular"] }),
  P({ id: "redis", name: "Redis", slug: "redis", category: "banco_dados", color: "#DC382D", description: "Cache, pub/sub e queues.", secrets: ["REDIS_URL"], docs: "https://redis.io/docs/", badges: ["popular"] }),
  P({ id: "dynamodb", name: "DynamoDB", slug: "amazondynamodb", category: "banco_dados", color: "#4053D6", description: "Key-value NoSQL serverless da AWS.", secrets: ["AWS_ACCESS_KEY_ID", "AWS_SECRET_ACCESS_KEY"], docs: "https://docs.aws.amazon.com/dynamodb/", badges: ["enterprise"] }),
  P({ id: "cassandra", name: "Cassandra", slug: "apachecassandra", category: "banco_dados", color: "#1287B1", description: "Wide-column distribuído.", secrets: ["CASSANDRA_HOSTS", "CASSANDRA_USER", "CASSANDRA_PASSWORD"], docs: "https://cassandra.apache.org/doc/" }),
  P({ id: "elasticsearch", name: "Elasticsearch", slug: "elasticsearch", category: "banco_dados", color: "#005571", description: "Search & analytics engine.", secrets: ["ELASTIC_CLOUD_ID", "ELASTIC_API_KEY"], docs: "https://www.elastic.co/guide/" }),
  P({ id: "rabbitmq", name: "RabbitMQ", slug: "rabbitmq", category: "banco_dados", color: "#FF6600", description: "Message broker AMQP enterprise.", secrets: ["RABBITMQ_URL"], docs: "https://www.rabbitmq.com/documentation.html" }),

  // 💳 Payments
  P({ id: "stripe", name: "Stripe", slug: "stripe", category: "payments", color: "#635BFF", description: "Pagamentos globais, subscriptions e billing.", secrets: ["STRIPE_SECRET_KEY", "STRIPE_WEBHOOK_SECRET"], hasTest: true, docs: "https://stripe.com/docs/api", hasWebhook: true, tagline: "Global payments", badges: ["official", "popular", "recommended"] }),
  P({ id: "mercadopago", name: "Mercado Pago", slug: "mercadopago", category: "payments", color: "#00B1EA", description: "Pix, cartão e boleto para LATAM.", secrets: ["MERCADOPAGO_ACCESS_TOKEN"], docs: "https://www.mercadopago.com.br/developers/", hasWebhook: true, badges: ["official", "popular"] }),
  P({ id: "paypal", name: "PayPal", slug: "paypal", category: "payments", color: "#003087", description: "Pagamentos globais e subscriptions.", secrets: ["PAYPAL_CLIENT_ID", "PAYPAL_CLIENT_SECRET"], docs: "https://developer.paypal.com/", hasWebhook: true, badges: ["official"] }),
  P({ id: "asaas", name: "Asaas", slug: "asaas", category: "payments", color: "#1E88E5", description: "Cobranças Pix, boleto e cartão (BR).", secrets: ["ASAAS_API_KEY"], docs: "https://docs.asaas.com/", hasWebhook: true }),
  P({ id: "pagarme", name: "Pagar.me", slug: "pagarme", category: "payments", color: "#65A300", description: "Gateway Stone para Brasil.", secrets: ["PAGARME_API_KEY"], docs: "https://docs.pagar.me/", hasWebhook: true }),
  P({ id: "pagseguro", name: "PagSeguro", slug: "pagseguro", category: "payments", color: "#FFC107", description: "UOL PagSeguro/PagBank.", secrets: ["PAGSEGURO_TOKEN", "PAGSEGURO_EMAIL"], docs: "https://dev.pagseguro.uol.com.br/" }),
  P({ id: "paddle", name: "Paddle", slug: "paddle", category: "payments", color: "#FDDD35", description: "Merchant of Record para SaaS.", secrets: ["PADDLE_API_KEY"], docs: "https://developer.paddle.com/", hasWebhook: true, badges: ["recommended"] }),
  P({ id: "lemonsqueezy", name: "Lemon Squeezy", slug: "lemonsqueezy", category: "payments", color: "#FFC233", description: "MoR para digital products.", secrets: ["LEMONSQUEEZY_API_KEY"], docs: "https://docs.lemonsqueezy.com/", hasWebhook: true }),

  // 📨 Comunicação
  P({ id: "resend", name: "Resend", slug: "resend", category: "comunicacao", color: "#ffffff", description: "Email transacional moderno.", secrets: ["RESEND_API_KEY"], hasTest: true, docs: "https://resend.com/docs", hasWebhook: true, badges: ["recommended", "new"] }),
  P({ id: "sendgrid", name: "SendGrid", slug: "sendgrid", category: "comunicacao", color: "#1A82E2", description: "Email at scale Twilio.", secrets: ["SENDGRID_API_KEY"], docs: "https://docs.sendgrid.com/", badges: ["enterprise"] }),
  P({ id: "mailgun", name: "Mailgun", slug: "mailgun", category: "comunicacao", color: "#F06B66", description: "Email API para devs.", secrets: ["MAILGUN_API_KEY", "MAILGUN_DOMAIN"], docs: "https://documentation.mailgun.com/" }),
  P({ id: "postmark", name: "Postmark", slug: "postmark", category: "comunicacao", color: "#FFDE00", description: "Transactional email rápido.", secrets: ["POSTMARK_TOKEN"], docs: "https://postmarkapp.com/developer" }),
  P({ id: "slack", name: "Slack", slug: "slack", category: "comunicacao", color: "#4A154B", description: "Workspace messaging e bots.", secrets: ["SLACK_BOT_TOKEN", "SLACK_SIGNING_SECRET"], hasTest: true, docs: "https://api.slack.com/", hasWebhook: true, hasOAuth: true, badges: ["official", "popular"] }),
  P({ id: "discord", name: "Discord", slug: "discord", category: "comunicacao", color: "#5865F2", description: "Bots, webhooks e guild events.", secrets: ["DISCORD_BOT_TOKEN"], hasTest: true, docs: "https://discord.com/developers/docs", hasWebhook: true, hasOAuth: true, badges: ["popular"] }),
  P({
    id: "whatsapp", name: "WhatsApp Business", slug: "whatsapp", category: "comunicacao", color: "#25D366",
    description: "Cloud API da Meta para mensagens.", secrets: [],
    docs: "https://developers.facebook.com/docs/whatsapp", hasTest: true, hasWebhook: true,
    badges: ["official", "popular"],
    tenantSettings: [
      { key: "whatsapp_token", label: "Access Token (permanente)", placeholder: "EAAG...", secret: true, required: true, help: "Token permanente do app Meta (Business → System User)." },
      { key: "whatsapp_business_phone_id", label: "Phone Number ID", placeholder: "123456789012345", required: true, help: "ID do número no WhatsApp Business." },
      { key: "whatsapp_verify_token", label: "Verify Token (webhook)", placeholder: "string aleatória", secret: true, required: true, help: "Use o mesmo valor ao configurar o webhook no Meta." },
      { key: "whatsapp_business_account_id", label: "Business Account ID (opcional)", placeholder: "WABA ID" },
    ],
  }),
  P({ id: "telegram", name: "Telegram", slug: "telegram", category: "comunicacao", color: "#26A5E4", description: "Bot API para mensagens, canais e grupos.", secrets: ["TELEGRAM_BOT_TOKEN"], docs: "https://core.telegram.org/bots/api", hasWebhook: true }),
  P({ id: "twilio", name: "Twilio", slug: "twilio", category: "comunicacao", color: "#F22F46", description: "SMS, voz e WhatsApp via API.", secrets: ["TWILIO_ACCOUNT_SID", "TWILIO_AUTH_TOKEN"], docs: "https://www.twilio.com/docs", hasWebhook: true, badges: ["enterprise"] }),
  P({ id: "zoom", name: "Zoom", slug: "zoom", category: "comunicacao", color: "#2D8CFF", description: "Meetings, webinars e recordings.", secrets: ["ZOOM_CLIENT_ID", "ZOOM_CLIENT_SECRET"], docs: "https://developers.zoom.us/", hasOAuth: true, hasWebhook: true }),
  P({ id: "googlemeet", name: "Google Meet", slug: "googlemeet", category: "comunicacao", color: "#00897B", description: "Meet via Google Calendar API.", secrets: ["GOOGLE_CLIENT_ID", "GOOGLE_CLIENT_SECRET"], docs: "https://developers.google.com/meet", hasOAuth: true }),
  P({ id: "clerk", name: "Clerk", slug: "clerk", category: "comunicacao", color: "#6C47FF", description: "Auth, user management e orgs.", secrets: ["CLERK_SECRET_KEY"], docs: "https://clerk.com/docs", hasWebhook: true, badges: ["recommended"] }),
  P({ id: "auth0", name: "Auth0", slug: "auth0", category: "comunicacao", color: "#EB5424", description: "Identity-as-a-service enterprise.", secrets: ["AUTH0_DOMAIN", "AUTH0_CLIENT_SECRET"], docs: "https://auth0.com/docs", hasOAuth: true, badges: ["enterprise"] }),

  // 🏢 CRM & Vendas
  P({ id: "hubspot", name: "HubSpot", slug: "hubspot", category: "crm", color: "#FF7A59", description: "CRM, marketing e sales hub.", secrets: ["HUBSPOT_API_KEY"], docs: "https://developers.hubspot.com/", hasOAuth: true, hasWebhook: true, badges: ["official", "popular"] }),
  P({ id: "salesforce", name: "Salesforce", slug: "salesforce", category: "crm", color: "#00A1E0", description: "CRM #1 enterprise.", secrets: ["SALESFORCE_CLIENT_ID", "SALESFORCE_CLIENT_SECRET"], docs: "https://developer.salesforce.com/", hasOAuth: true, badges: ["official", "enterprise"] }),
  P({ id: "pipedrive", name: "Pipedrive", slug: "pipedrive", category: "crm", color: "#1A1A1A", description: "Sales pipeline visual.", secrets: ["PIPEDRIVE_API_TOKEN"], docs: "https://developers.pipedrive.com/", hasOAuth: true, hasWebhook: true }),
  P({ id: "rdstation", name: "RD Station", slug: "rdstation", category: "crm", color: "#19C66D", description: "Marketing & CRM BR.", secrets: ["RDSTATION_TOKEN"], docs: "https://developers.rdstation.com/", hasOAuth: true, badges: ["popular"] }),
  P({ id: "intercom", name: "Intercom", slug: "intercom", category: "crm", color: "#1F8DED", description: "Customer messaging e support.", secrets: ["INTERCOM_TOKEN"], docs: "https://developers.intercom.com/", hasWebhook: true, badges: ["enterprise"] }),
  P({ id: "zendesk", name: "Zendesk", slug: "zendesk", category: "crm", color: "#03363D", description: "Support tickets e helpdesk.", secrets: ["ZENDESK_TOKEN", "ZENDESK_SUBDOMAIN"], docs: "https://developer.zendesk.com/", badges: ["enterprise"] }),

  // 📊 Analytics
  P({ id: "googleanalytics", name: "Google Analytics", slug: "googleanalytics", category: "analytics", color: "#E37400", description: "GA4 measurement e reports.", secrets: ["GA4_MEASUREMENT_ID", "GA4_API_SECRET"], docs: "https://developers.google.com/analytics", badges: ["official", "popular"] }),
  P({ id: "mixpanel", name: "Mixpanel", slug: "mixpanel", category: "analytics", color: "#7856FF", description: "Product analytics e funnels.", secrets: ["MIXPANEL_TOKEN", "MIXPANEL_SECRET"], docs: "https://developer.mixpanel.com/" }),
  P({ id: "posthog", name: "PostHog", slug: "posthog", category: "analytics", color: "#1D4AFF", description: "Product analytics open-source.", secrets: ["POSTHOG_KEY", "POSTHOG_HOST"], docs: "https://posthog.com/docs/api", badges: ["recommended"] }),
  P({ id: "hotjar", name: "Hotjar", slug: "hotjar", category: "analytics", color: "#FD3A5C", description: "Heatmaps e session recordings.", secrets: ["HOTJAR_SITE_ID"], docs: "https://help.hotjar.com/hc/en-us/categories/115001789687" }),
  P({ id: "amplitude", name: "Amplitude", slug: "amplitude", category: "analytics", color: "#1E61F0", description: "Product analytics enterprise.", secrets: ["AMPLITUDE_API_KEY", "AMPLITUDE_SECRET"], docs: "https://www.docs.developers.amplitude.com/", badges: ["enterprise"] }),
  P({ id: "segment", name: "Segment", slug: "segment", category: "analytics", color: "#52BD95", description: "Customer Data Platform Twilio.", secrets: ["SEGMENT_WRITE_KEY"], docs: "https://segment.com/docs/connections/sources/" }),

  // 📊 Monitoring
  P({ id: "sentry", name: "Sentry", slug: "sentry", category: "monitoring", color: "#362D59", description: "Error tracking, performance e releases.", secrets: ["SENTRY_DSN", "SENTRY_AUTH_TOKEN"], docs: "https://docs.sentry.io/", hasWebhook: true, badges: ["recommended", "popular"] }),
  P({ id: "datadog", name: "Datadog", slug: "datadog", category: "monitoring", color: "#632CA6", description: "Observability completa: logs, metrics, APM.", secrets: ["DATADOG_API_KEY", "DATADOG_APP_KEY"], docs: "https://docs.datadoghq.com/api/", badges: ["enterprise"] }),
  P({ id: "newrelic", name: "New Relic", slug: "newrelic", category: "monitoring", color: "#008C99", description: "Full-stack observability.", secrets: ["NEWRELIC_API_KEY"], docs: "https://docs.newrelic.com/", badges: ["enterprise"] }),
  P({ id: "grafana", name: "Grafana", slug: "grafana", category: "monitoring", color: "#F46800", description: "Dashboards, alerting e Loki.", secrets: ["GRAFANA_API_TOKEN", "GRAFANA_URL"], docs: "https://grafana.com/docs/grafana/latest/developers/http_api/" }),
  P({ id: "prometheus", name: "Prometheus", slug: "prometheus", category: "monitoring", color: "#E6522C", description: "Time-series metrics.", secrets: ["PROMETHEUS_URL"], docs: "https://prometheus.io/docs/prometheus/latest/querying/api/" }),
  P({ id: "betterstack", name: "Better Stack", slug: "betterstack", category: "monitoring", color: "#7B61FF", description: "Uptime, logs e incidents.", secrets: ["BETTERSTACK_TOKEN"], docs: "https://betterstack.com/docs/", badges: ["new"] }),
  P({ id: "pagerduty", name: "PagerDuty", slug: "pagerduty", category: "monitoring", color: "#06AC38", description: "Incident response on-call.", secrets: ["PAGERDUTY_TOKEN"], docs: "https://developer.pagerduty.com/", badges: ["enterprise"] }),

  // 🤖 Automação
  P({ id: "make", name: "Make", slug: "make", category: "automacao", color: "#6D00CC", description: "Cenários de automação visual (ex-Integromat).", secrets: ["MAKE_API_TOKEN"], docs: "https://www.make.com/en/api-documentation", hasWebhook: true, badges: ["popular"] }),
  P({ id: "n8n", name: "n8n", slug: "n8n", category: "automacao", color: "#EA4B71", description: "Workflows open-source self-hosted ou cloud.", secrets: ["N8N_API_KEY", "N8N_BASE_URL"], docs: "https://docs.n8n.io/api/", hasWebhook: true, badges: ["recommended"] }),
  P({ id: "zapier", name: "Zapier", slug: "zapier", category: "automacao", color: "#FF4F00", description: "Automação no-code com 6000+ apps.", secrets: ["ZAPIER_API_KEY"], docs: "https://zapier.com/developer", hasWebhook: true, badges: ["official", "popular"] }),
  P({ id: "ifttt", name: "IFTTT", slug: "ifttt", category: "automacao", color: "#000000", description: "Applets para conectar serviços.", secrets: ["IFTTT_KEY"], docs: "https://ifttt.com/docs", hasWebhook: true }),

  // 📅 Produtividade
  P({ id: "googlecalendar", name: "Google Calendar", slug: "googlecalendar", category: "produtividade", color: "#4285F4", description: "Agendas, eventos e convites via Google API.", secrets: ["GOOGLE_CLIENT_ID", "GOOGLE_CLIENT_SECRET"], docs: "https://developers.google.com/calendar", hasOAuth: true, badges: ["official"] }),
  P({ id: "notion", name: "Notion", slug: "notion", category: "produtividade", color: "#ffffff", description: "Bases de dados, páginas e blocos via API.", secrets: ["NOTION_TOKEN"], docs: "https://developers.notion.com/", hasOAuth: true, badges: ["popular"] }),
  P({ id: "linear", name: "Linear", slug: "linear", category: "produtividade", color: "#5E6AD2", description: "Issues, projetos e cycles enterprise.", secrets: ["LINEAR_API_KEY"], docs: "https://developers.linear.app/", hasWebhook: true, hasOAuth: true, badges: ["recommended"] }),
  P({ id: "clickup", name: "ClickUp", slug: "clickup", category: "produtividade", color: "#7B68EE", description: "Tasks, docs e goals.", secrets: ["CLICKUP_TOKEN"], docs: "https://clickup.com/api", hasOAuth: true }),
  P({ id: "asana", name: "Asana", slug: "asana", category: "produtividade", color: "#F06A6A", description: "Project management.", secrets: ["ASANA_TOKEN"], docs: "https://developers.asana.com/", hasOAuth: true }),
  P({ id: "trello", name: "Trello", slug: "trello", category: "produtividade", color: "#0052CC", description: "Kanban boards Atlassian.", secrets: ["TRELLO_KEY", "TRELLO_TOKEN"], docs: "https://developer.atlassian.com/cloud/trello/", hasWebhook: true }),
  P({ id: "airtable", name: "Airtable", slug: "airtable", category: "produtividade", color: "#FCB400", description: "Spreadsheet-database híbrido.", secrets: ["AIRTABLE_TOKEN"], docs: "https://airtable.com/developers/web/api/introduction", hasWebhook: true }),

  // 📦 Storage & Arquivos
  P({ id: "s3", name: "Amazon S3", slug: "amazons3", category: "storage", color: "#569A31", description: "Object storage AWS.", secrets: ["AWS_ACCESS_KEY_ID", "AWS_SECRET_ACCESS_KEY", "S3_BUCKET"], docs: "https://docs.aws.amazon.com/s3/", badges: ["official", "popular"] }),
  P({ id: "cloudinary", name: "Cloudinary", slug: "cloudinary", category: "storage", color: "#3448C5", description: "Image & video CDN com transformações.", secrets: ["CLOUDINARY_CLOUD_NAME", "CLOUDINARY_API_KEY", "CLOUDINARY_API_SECRET"], docs: "https://cloudinary.com/documentation", badges: ["recommended"] }),
  P({ id: "backblaze", name: "Backblaze B2", slug: "backblaze", category: "storage", color: "#E50018", description: "Object storage barato.", secrets: ["B2_KEY_ID", "B2_APPLICATION_KEY"], docs: "https://www.backblaze.com/b2/docs/" }),
  P({ id: "dropbox", name: "Dropbox", slug: "dropbox", category: "storage", color: "#0061FF", description: "Cloud storage e file sync.", secrets: ["DROPBOX_ACCESS_TOKEN"], docs: "https://www.dropbox.com/developers/documentation", hasOAuth: true }),
  P({ id: "onedrive", name: "OneDrive", slug: "microsoftonedrive", category: "storage", color: "#0078D4", description: "Microsoft cloud storage.", secrets: ["MS_CLIENT_ID", "MS_CLIENT_SECRET"], docs: "https://learn.microsoft.com/en-us/onedrive/developer/", hasOAuth: true }),
  P({ id: "googledrive", name: "Google Drive", slug: "googledrive", category: "storage", color: "#4285F4", description: "Cloud storage Google.", secrets: ["GOOGLE_CLIENT_ID", "GOOGLE_CLIENT_SECRET"], docs: "https://developers.google.com/drive", hasOAuth: true, badges: ["popular"] }),

  // 📣 Marketing
  P({ id: "mailchimp", name: "Mailchimp", slug: "mailchimp", category: "marketing", color: "#FFE01B", description: "Email marketing e audiences.", secrets: ["MAILCHIMP_API_KEY"], docs: "https://mailchimp.com/developer/", hasWebhook: true, badges: ["popular"] }),
  P({ id: "klaviyo", name: "Klaviyo", slug: "klaviyo", category: "marketing", color: "#000000", description: "Email/SMS para e-commerce.", secrets: ["KLAVIYO_API_KEY"], docs: "https://developers.klaviyo.com/", badges: ["enterprise"] }),
  P({ id: "convertkit", name: "ConvertKit", slug: "convertkit", category: "marketing", color: "#FB6970", description: "Email marketing para creators.", secrets: ["CONVERTKIT_API_KEY"], docs: "https://developers.convertkit.com/" }),

  // 🎨 Design
  P({ id: "figma", name: "Figma", slug: "figma", category: "design", color: "#F24E1E", description: "Files, variables e dev mode.", secrets: ["FIGMA_TOKEN"], docs: "https://www.figma.com/developers/api", hasTest: true, hasOAuth: true, tagline: "Design system", badges: ["official", "popular"] }),
  P({ id: "framer", name: "Framer", slug: "framer", category: "design", color: "#0055FF", description: "Sites e prototypes.", secrets: ["FRAMER_TOKEN"], docs: "https://www.framer.com/developers/" }),
  P({ id: "canva", name: "Canva", slug: "canva", category: "design", color: "#00C4CC", description: "Design templates API.", secrets: ["CANVA_API_KEY"], docs: "https://www.canva.dev/", badges: ["new"] }),
];

export const CATEGORY_LIST: Array<[ProviderCategory | "all", string]> = [
  ["all", "Tudo"],
  ...(Object.entries(CATEGORY_LABEL) as Array<[ProviderCategory, string]>),
];

export const BADGE_META: Record<ProviderBadge, { label: string; cls: string }> = {
  official:    { label: "OFFICIAL",    cls: "bg-blue-500/15 text-blue-300 border-blue-500/30" },
  verified:    { label: "VERIFIED",    cls: "bg-cyan-500/15 text-cyan-300 border-cyan-500/30" },
  popular:     { label: "POPULAR",     cls: "bg-amber-500/15 text-amber-300 border-amber-500/30" },
  recommended: { label: "RECOMMENDED", cls: "bg-emerald-500/15 text-emerald-300 border-emerald-500/30" },
  enterprise:  { label: "ENTERPRISE",  cls: "bg-violet-500/15 text-violet-300 border-violet-500/30" },
  beta:        { label: "BETA",        cls: "bg-fuchsia-500/15 text-fuchsia-300 border-fuchsia-500/30" },
  new:         { label: "NEW",         cls: "bg-pink-500/15 text-pink-300 border-pink-500/30" },
  premium:     { label: "PREMIUM",     cls: "bg-gradient-to-r from-amber-500/20 to-orange-500/20 text-amber-200 border-amber-400/40" },
};

export const findCatalogProvider = (id: string) =>
  PROVIDER_CATALOG.find((p) => p.id === id);

export const getCatalogProvider = (id: string) =>
  findCatalogProvider(id) ?? {
    id,
    name: id.replace(/[-_]/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()),
    slug: "git",
    category: "automacao" as ProviderCategory,
    color: "#ffffff",
    description: "Integração customizada via API ou webhook.",
    secrets: [`${id.toUpperCase().replace(/[^A-Z0-9]/g, "_")}_API_KEY`],
    docs: "https://developer.mozilla.org/en-US/docs/Web/HTTP",
    hasTest: true,
    hasWebhook: true,
  };

/** Logo URL com fallback automático (cdn.simpleicons.org). */
export const providerLogoUrl = (slug: string, color?: string) => {
  const hex = (color || "ffffff").replace("#", "");
  return `https://cdn.simpleicons.org/${slug}/${hex}`;
};
