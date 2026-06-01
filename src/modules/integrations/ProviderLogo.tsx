/**
 * 🎨 ProviderLogo — Logo oficial local-first + fallback resiliente
 * Tier 1: react-icons/simple-icons (sem rede, não quebra por CDN/CSP/SW)
 * Tier 2: cdn.simpleicons.org
 * Tier 3: jsdelivr simple-icons via CSS mask
 * Tier 4: inicial da marca em gradiente brand-aware
 */
import { useState } from "react";
import type { IconType } from "react-icons";
import {
  SiAirtable, SiAmazondynamodb, SiAmazons3, SiAmazonwebservices, SiAnthropic, SiApachecassandra,
  SiArgo, SiAsana, SiAuth0, SiBackblaze, SiBetterstack, SiBitbucket, SiCanva, SiCircleci,
  SiClerk, SiClickup, SiCloudflare, SiCloudinary, SiCockroachlabs, SiCodecov, SiDatadog,
  SiDigitalocean, SiDiscord, SiDocker, SiDropbox, SiElasticsearch, SiElevenlabs, SiFigma,
  SiFirebase, SiFlydotio, SiFramer, SiGit, SiGithub, SiGitlab, SiGoogle, SiGoogleanalytics,
  SiGooglecalendar, SiGooglecloud, SiGoogledrive, SiGooglegemini, SiGooglemeet, SiGrafana,
  SiHetzner, SiHotjar, SiHubspot, SiHuggingface, SiIfttt, SiIntercom, SiJenkins, SiJira,
  SiKubernetes, SiLemonsqueezy, SiLinear, SiMailchimp, SiMailgun, SiMake, SiMariadb,
  SiMercadopago, SiMixpanel, SiMongodb, SiMysql, SiN8N, SiNetlify, SiNewrelic, SiNotion,
  SiOpenai, SiOracle, SiPaddle, SiPagerduty, SiPagseguro, SiPaypal, SiPerplexity,
  SiPlanetscale, SiPosthog, SiPostgresql, SiPrometheus, SiRabbitmq, SiRailway, SiRedis,
  SiRender, SiResend, SiSalesforce, SiSendgrid, SiSentry, SiSlack, SiSonarqube, SiStripe,
  SiSupabase, SiTelegram, SiTerraform, SiTrello, SiTwilio, SiVercel, SiVultr, SiWhatsapp,
  SiX, SiZapier, SiZendesk, SiZoom,
} from "react-icons/si";
import { providerLogoUrl } from "./providerCatalog";

const LOCAL_ICONS: Record<string, IconType> = {
  airtable: SiAirtable,
  amazondynamodb: SiAmazondynamodb,
  amazonaws: SiAmazonwebservices,
  amazons3: SiAmazons3,
  anthropic: SiAnthropic,
  apachecassandra: SiApachecassandra,
  argo: SiArgo,
  asana: SiAsana,
  auth0: SiAuth0,
  backblaze: SiBackblaze,
  betterstack: SiBetterstack,
  bitbucket: SiBitbucket,
  canva: SiCanva,
  circleci: SiCircleci,
  clerk: SiClerk,
  clickup: SiClickup,
  cloudflare: SiCloudflare,
  cloudinary: SiCloudinary,
  cockroachlabs: SiCockroachlabs,
  codecov: SiCodecov,
  datadog: SiDatadog,
  digitalocean: SiDigitalocean,
  discord: SiDiscord,
  docker: SiDocker,
  dropbox: SiDropbox,
  elasticsearch: SiElasticsearch,
  elevenlabs: SiElevenlabs,
  figma: SiFigma,
  firebase: SiFirebase,
  fly: SiFlydotio,
  framer: SiFramer,
  git: SiGit,
  github: SiGithub,
  gitlab: SiGitlab,
  google: SiGoogle,
  googleanalytics: SiGoogleanalytics,
  googlecalendar: SiGooglecalendar,
  googlecloud: SiGooglecloud,
  googledrive: SiGoogledrive,
  googlegemini: SiGooglegemini,
  googlemeet: SiGooglemeet,
  grafana: SiGrafana,
  hetzner: SiHetzner,
  hotjar: SiHotjar,
  hubspot: SiHubspot,
  huggingface: SiHuggingface,
  ifttt: SiIfttt,
  intercom: SiIntercom,
  jenkins: SiJenkins,
  jira: SiJira,
  kubernetes: SiKubernetes,
  lemonsqueezy: SiLemonsqueezy,
  linear: SiLinear,
  mailchimp: SiMailchimp,
  mailgun: SiMailgun,
  make: SiMake,
  mariadb: SiMariadb,
  mercadopago: SiMercadopago,
  mixpanel: SiMixpanel,
  mongodb: SiMongodb,
  mysql: SiMysql,
  n8n: SiN8N,
  netlify: SiNetlify,
  newrelic: SiNewrelic,
  notion: SiNotion,
  openai: SiOpenai,
  oracle: SiOracle,
  paddle: SiPaddle,
  pagerduty: SiPagerduty,
  pagseguro: SiPagseguro,
  paypal: SiPaypal,
  perplexity: SiPerplexity,
  planetscale: SiPlanetscale,
  posthog: SiPosthog,
  postgresql: SiPostgresql,
  prometheus: SiPrometheus,
  rabbitmq: SiRabbitmq,
  railway: SiRailway,
  redis: SiRedis,
  render: SiRender,
  resend: SiResend,
  salesforce: SiSalesforce,
  sendgrid: SiSendgrid,
  sentry: SiSentry,
  slack: SiSlack,
  sonarqube: SiSonarqube,
  stripe: SiStripe,
  supabase: SiSupabase,
  telegram: SiTelegram,
  terraform: SiTerraform,
  trello: SiTrello,
  twilio: SiTwilio,
  vercel: SiVercel,
  vultr: SiVultr,
  whatsapp: SiWhatsapp,
  x: SiX,
  zapier: SiZapier,
  zendesk: SiZendesk,
  zoom: SiZoom,
};

export default function ProviderLogo({
  slug, color, name, size = 40, className = "",
}: { slug?: string; color?: string; name: string; size?: number; className?: string }) {
  const [tier, setTier] = useState<0 | 1 | 2>(0);

  const isWhite = !color || /^#?f{3,6}$/i.test(color);
  const accent = color || "#ffffff";
  const accentHex = accent.replace("#", "");
  const LocalIcon = slug ? LOCAL_ICONS[slug] : undefined;
  const primaryUrl = slug ? providerLogoUrl(slug, isWhite ? "ffffff" : accentHex) : null;
  const maskUrl = slug ? `https://cdn.jsdelivr.net/npm/simple-icons@v13/icons/${slug}.svg` : null;

  return (
    <div
      className={`relative rounded-xl border flex items-center justify-center font-bold shrink-0 overflow-hidden ${className}`}
      style={{
        width: size,
        height: size,
        background: isWhite
          ? "linear-gradient(135deg, #1a1a1a, #050505)"
          : `linear-gradient(135deg, ${accent}26, ${accent}08)`,
        borderColor: isWhite ? "rgba(255,255,255,0.15)" : `${accent}55`,
        boxShadow: `0 0 24px ${accent}22 inset, 0 4px 18px ${accent}1a`,
        color: accent,
      }}
    >
      {LocalIcon ? (
        <LocalIcon
          aria-label={name}
          size={size * 0.56}
          color={isWhite ? "#ffffff" : accent}
          style={{ filter: isWhite ? "drop-shadow(0 0 6px rgba(255,255,255,0.35))" : `drop-shadow(0 0 7px ${accent}66)` }}
        />
      ) : tier === 0 && primaryUrl ? (
        <img
          src={primaryUrl}
          alt={name}
          width={size * 0.58}
          height={size * 0.58}
          loading="lazy"
          onError={() => setTier(1)}
          className="object-contain"
          style={{ filter: isWhite ? "drop-shadow(0 0 6px rgba(255,255,255,0.35))" : undefined }}
        />
      ) : tier === 1 && maskUrl ? (
        <span
          aria-label={name}
          style={{
            display: "block",
            width: size * 0.58,
            height: size * 0.58,
            background: isWhite ? "#ffffff" : accent,
            WebkitMask: `url(${maskUrl}) center / contain no-repeat`,
            mask: `url(${maskUrl}) center / contain no-repeat`,
            filter: isWhite ? "drop-shadow(0 0 6px rgba(255,255,255,0.35))" : `drop-shadow(0 0 6px ${accent}66)`,
          }}
        />
      ) : (
        <span style={{ fontSize: size * 0.42, color: isWhite ? "#fff" : accent }}>
          {name.charAt(0).toUpperCase()}
        </span>
      )}
    </div>
  );
}
