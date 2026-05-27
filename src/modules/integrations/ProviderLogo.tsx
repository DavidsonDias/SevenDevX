/**
 * 🎨 ProviderLogo — Logo oficial com 2-tier fallback + branding contextual
 * Tier 1: cdn.simpleicons.org (SVG colorido nativo)
 * Tier 2: jsdelivr simple-icons via CSS mask (caso CDN seja bloqueado)
 * Tier 3: inicial da marca em gradiente brand-aware
 */
import { useState } from "react";
import { providerLogoUrl } from "./providerCatalog";

export default function ProviderLogo({
  slug, color, name, size = 40, className = "",
}: { slug?: string; color?: string; name: string; size?: number; className?: string }) {
  const [tier, setTier] = useState<0 | 1 | 2>(0);

  const isWhite = !color || /^#?f{3,6}$/i.test(color);
  const accent = color || "#ffffff";
  const accentHex = accent.replace("#", "");
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
      {tier === 0 && primaryUrl && (
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
      )}
      {tier === 1 && maskUrl && (
        <span
          aria-label={name}
          onError={() => setTier(2)}
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
      )}
      {(tier === 2 || (!primaryUrl && !maskUrl)) && (
        <span style={{ fontSize: size * 0.42, color: isWhite ? "#fff" : accent }}>
          {name.charAt(0).toUpperCase()}
        </span>
      )}
    </div>
  );
}
