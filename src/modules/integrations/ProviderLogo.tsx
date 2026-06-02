/**
 * 🎨 ProviderLogo — Logo oficial local-first + fallback resiliente
 * Tier 1: react-icons/simple-icons (sem rede, não quebra por CDN/CSP/SW)
 * Tier 2: cdn.simpleicons.org
 * Tier 3: jsdelivr simple-icons via CSS mask
 * Tier 4: inicial da marca em gradiente brand-aware
 */
import React, { useState } from "react";
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

/**
 * 🎯 Custom inline SVG glyphs para brands sem cobertura no simple-icons.
 * Estes têm prioridade absoluta sobre o lookup automático.
 */
type GlyphProps = { size: number; color: string };
const SVG = (size: number, vb: string, paths: React.ReactNode, fill: string): React.ReactElement => (
  <svg width={size} height={size} viewBox={vb} fill={fill} xmlns="http://www.w3.org/2000/svg" aria-hidden>
    {paths}
  </svg>
);

const CUSTOM_GLYPHS: Record<string, (p: GlyphProps) => React.ReactElement> = {
  // DeepSeek — whale silhouette stylized
  deepseek: ({ size, color }) => SVG(size, "0 0 24 24",
    <path d="M21.5 7.5c-.4-.3-1-.2-1.3.2l-1.4 1.7c-1-1.6-2.6-2.9-4.5-3.5C12.2 5.2 9.8 5.6 8 7c-1.2.9-2 2.2-2.4 3.6-1.4.4-2.6 1.5-3 2.9-.5 1.6.2 3.3 1.6 4.2.4.2.9.1 1.2-.3.2-.4.1-.9-.3-1.2-.7-.5-1-1.3-.8-2.1.2-.6.7-1.1 1.3-1.3 0 .6.1 1.2.3 1.7.3 1 .9 1.8 1.7 2.5.4.3.9.2 1.2-.1.3-.4.2-.9-.1-1.2-.6-.5-1-1.1-1.2-1.8-.4-1.3.1-2.8 1.1-3.7C9.7 9 11.6 8.6 13.4 9.2c2 .6 3.4 2.4 3.5 4.5 0 .5.4.8.9.8s.8-.4.8-.9c-.1-1.7-.9-3.3-2.1-4.4l1.7-2.1.1.1c.4.3.8.7 1.1 1.1.3.4.8.4 1.2.1.4-.3.4-.8.1-1.2-.4-.6-1-1.1-1.5-1.5l1.7-2.1c.3-.4.2-1-.2-1.3z M16 12.5c-.8 0-1.5.7-1.5 1.5s.7 1.5 1.5 1.5 1.5-.7 1.5-1.5-.7-1.5-1.5-1.5z" />,
    color),
  // Mistral — flame stripes
  mistralai: ({ size, color }) => SVG(size, "0 0 24 24",
    <g>
      <rect x="3" y="3" width="3" height="18" fill={color} />
      <rect x="9" y="3" width="3" height="6" fill={color} />
      <rect x="15" y="3" width="3" height="6" fill={color} />
      <rect x="9" y="11" width="3" height="6" fill={color} opacity="0.7" />
      <rect x="15" y="11" width="3" height="6" fill={color} opacity="0.5" />
      <rect x="9" y="18" width="9" height="3" fill={color} opacity="0.3" />
    </g>,
    "none"),
  // Cohere — abstract C
  cohere: ({ size, color }) => SVG(size, "0 0 24 24",
    <g fill={color}>
      <ellipse cx="9" cy="12" rx="3" ry="3" />
      <ellipse cx="15" cy="9" rx="2" ry="2" opacity="0.7" />
      <ellipse cx="15" cy="15" rx="2" ry="2" opacity="0.7" />
      <path d="M5 7c2-3 6-4 9-3 1 .3 1.5 1.5 1 2.5-.4.7-1.3 1-2 .7-2-.7-4.3 0-5.5 1.8C7 9.7 5.7 9.7 5 9c-.7-.7-.7-1.5 0-2z" opacity="0.85" />
      <path d="M5 17c2 3 6 4 9 3 1-.3 1.5-1.5 1-2.5-.4-.7-1.3-1-2-.7-2 .7-4.3 0-5.5-1.8C7 14.3 5.7 14.3 5 15c-.7.7-.7 1.5 0 2z" opacity="0.85" />
    </g>,
    "none"),
  // AssemblyAI — waveform A
  assemblyai: ({ size, color }) => SVG(size, "0 0 24 24",
    <g fill={color}>
      <rect x="3" y="10" width="2" height="4" rx="1" />
      <rect x="6" y="8" width="2" height="8" rx="1" />
      <rect x="9" y="5" width="2" height="14" rx="1" />
      <rect x="13" y="5" width="2" height="14" rx="1" />
      <rect x="16" y="8" width="2" height="8" rx="1" />
      <rect x="19" y="10" width="2" height="4" rx="1" />
    </g>,
    "none"),
  // Replicate — circular play
  replicate: ({ size, color }) => SVG(size, "0 0 24 24",
    <g fill={color}>
      <rect x="3" y="3" width="18" height="3" />
      <rect x="3" y="8" width="13" height="3" />
      <rect x="3" y="13" width="8" height="3" />
      <rect x="3" y="18" width="5" height="3" />
    </g>,
    "none"),
  // Runway — diagonal motion bars
  runway: ({ size, color }) => SVG(size, "0 0 24 24",
    <g fill={color}>
      <path d="M3 6h6l-3 5z" />
      <path d="M11 6h6l-3 5z" />
      <path d="M7 13h6l-3 5z" />
      <path d="M15 13h6l-3 5z" />
    </g>,
    "none"),
  // Stability AI — geometric S
  stabilityai: ({ size, color }) => SVG(size, "0 0 24 24",
    <path d="M6 7c0-2.2 1.8-4 4-4h4c2.2 0 4 1.8 4 4 0 1.1-.9 2-2 2H8c-1.1 0-2-.9-2-2zm12 10c0 2.2-1.8 4-4 4h-4c-2.2 0-4-1.8-4-4 0-1.1.9-2 2-2h8c1.1 0 2 .9 2 2zM4 12c0-1.1.9-2 2-2h12c1.1 0 2 .9 2 2s-.9 2-2 2H6c-1.1 0-2-.9-2-2z" fill={color} />,
    "none"),
  // Microsoft Azure — A triangle
  microsoftazure: ({ size, color }) => SVG(size, "0 0 24 24",
    <g fill={color}>
      <path d="M10 4L3 19h6l2-4z" opacity="0.85" />
      <path d="M11 9l-2 6h8l-2-3-2-3z" />
      <path d="M13 4l8 15h-7l-1-3 2-5z" opacity="0.7" />
    </g>,
    "none"),
  // Neon — lightning N
  neon: ({ size, color }) => SVG(size, "0 0 24 24",
    <path d="M5 3h3l8 12V3h3v18h-3L8 9v12H5z" fill={color} />,
    "none"),
  // Postmark — stamp
  postmark: ({ size, color }) => SVG(size, "0 0 24 24",
    <g fill={color}>
      <rect x="4" y="6" width="16" height="12" rx="2" />
      <path d="M6 8l6 5 6-5" stroke="#000" strokeWidth="1.5" fill="none" />
    </g>,
    "none"),
  // Klaviyo — K
  klaviyo: ({ size, color }) => SVG(size, "0 0 24 24",
    <path d="M12 3l9 7-4 5-5-4-5 4-4-5z M3 14l9 7 9-7-4-2-5 4-5-4z" fill={color} />,
    "none"),
  // ConvertKit — interlocking C
  convertkit: ({ size, color }) => SVG(size, "0 0 24 24",
    <path d="M12 3a9 9 0 100 18 9 9 0 000-18zm0 4a5 5 0 014.5 2.8l-3.4 1.7A1.2 1.2 0 1011 12c0-.4.2-.8.5-1l-2-3A5 5 0 0112 7z" fill={color} />,
    "none"),
  // Pipedrive — pipe segments
  pipedrive: ({ size, color }) => SVG(size, "0 0 24 24",
    <path d="M14 3c3.3 0 6 2.7 6 6s-2.7 6-6 6h-3v6H7V3h7zm-3 3v6h2.5a3 3 0 100-6H11z" fill={color} />,
    "none"),
  // RD Station — orbital R
  rdstation: ({ size, color }) => SVG(size, "0 0 24 24",
    <g fill={color}>
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2a10 10 0 00-7 17l1.5-1.5A8 8 0 0112 4a8 8 0 017 12l1.5 1.5A10 10 0 0012 2z" opacity="0.6" />
    </g>,
    "none"),
  // OneDrive — cloud
  microsoftonedrive: ({ size, color }) => SVG(size, "0 0 24 24",
    <path d="M7.5 18a4.5 4.5 0 01-.9-8.9 6 6 0 0111.4 1.4A4 4 0 0117 18H7.5z" fill={color} />,
    "none"),
  // Amplitude — bars
  amplitude: ({ size, color }) => SVG(size, "0 0 24 24",
    <g fill={color}>
      <rect x="3" y="14" width="3" height="7" rx="1" />
      <rect x="8" y="9" width="3" height="12" rx="1" />
      <rect x="13" y="4" width="3" height="17" rx="1" />
      <rect x="18" y="11" width="3" height="10" rx="1" />
    </g>,
    "none"),
  // Segment — connecting lines
  segment: ({ size, color }) => SVG(size, "0 0 24 24",
    <g fill={color}>
      <path d="M3 7h12v3H3z" />
      <path d="M9 14h12v3H9z" />
      <circle cx="18" cy="8.5" r="2" />
      <circle cx="6" cy="15.5" r="2" />
    </g>,
    "none"),
  // Pagar.me — P with chevron
  pagarme: ({ size, color }) => SVG(size, "0 0 24 24",
    <path d="M5 3h9a6 6 0 010 12h-4v6H5V3zm5 4v4h3a2 2 0 100-4h-3z" fill={color} />,
    "none"),
  // Asaas — A money
  asaas: ({ size, color }) => SVG(size, "0 0 24 24",
    <g fill={color}>
      <path d="M12 2L2 22h5l1.5-3h7L17 22h5L12 2zm-2.2 12L12 9l2.2 5h-4.4z" />
    </g>,
    "none"),
  // PagSeguro — shield
  pagseguro: ({ size, color }) => SVG(size, "0 0 24 24",
    <path d="M12 2l9 3v7c0 5-3.5 9.5-9 10-5.5-.5-9-5-9-10V5l9-3zm-1 7v4H8l4 6 4-6h-3V9h-2z" fill={color} />,
    "none"),
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

  const Custom = slug ? CUSTOM_GLYPHS[slug] : undefined;
  const glyphColor = isWhite ? "#ffffff" : accent;
  const glyphPx = Math.round(size * 0.56);

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
      {Custom ? (
        <span
          aria-label={name}
          style={{ display: "inline-flex", filter: isWhite ? "drop-shadow(0 0 6px rgba(255,255,255,0.35))" : `drop-shadow(0 0 7px ${accent}66)` }}
        >
          <Custom size={glyphPx} color={glyphColor} />
        </span>
      ) : LocalIcon ? (

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
