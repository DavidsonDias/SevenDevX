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
  SiAmazonwebservices, SiAnthropic, SiAuth0, SiBitbucket, SiClerk, SiCloudflare, SiDatadog,
  SiDiscord, SiDocker, SiFigma, SiFirebase, SiGit, SiGithub, SiGitlab, SiGoogle, SiGooglecalendar,
  SiGooglecloud, SiGooglegemini, SiGrafana, SiLinear, SiMake, SiMercadopago, SiMongodb,
  SiN8N, SiNetlify, SiNotion, SiOpenai, SiPostgresql, SiRabbitmq, SiRailway, SiRedis,
  SiRender, SiResend, SiSentry, SiSlack, SiStripe, SiSupabase, SiTelegram, SiTwilio,
  SiVercel, SiWhatsapp, SiZapier,
} from "react-icons/si";
import { providerLogoUrl } from "./providerCatalog";

const LOCAL_ICONS: Record<string, IconType> = {
  amazonaws: SiAmazonwebservices,
  anthropic: SiAnthropic,
  auth0: SiAuth0,
  bitbucket: SiBitbucket,
  clerk: SiClerk,
  cloudflare: SiCloudflare,
  datadog: SiDatadog,
  discord: SiDiscord,
  docker: SiDocker,
  figma: SiFigma,
  firebase: SiFirebase,
  git: SiGit,
  github: SiGithub,
  gitlab: SiGitlab,
  google: SiGoogle,
  googlecalendar: SiGooglecalendar,
  googlecloud: SiGooglecloud,
  googlegemini: SiGooglegemini,
  grafana: SiGrafana,
  linear: SiLinear,
  make: SiMake,
  mercadopago: SiMercadopago,
  mongodb: SiMongodb,
  n8n: SiN8N,
  netlify: SiNetlify,
  notion: SiNotion,
  openai: SiOpenai,
  postgresql: SiPostgresql,
  rabbitmq: SiRabbitmq,
  railway: SiRailway,
  redis: SiRedis,
  render: SiRender,
  resend: SiResend,
  sentry: SiSentry,
  slack: SiSlack,
  stripe: SiStripe,
  supabase: SiSupabase,
  telegram: SiTelegram,
  twilio: SiTwilio,
  vercel: SiVercel,
  whatsapp: SiWhatsapp,
  zapier: SiZapier,
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
