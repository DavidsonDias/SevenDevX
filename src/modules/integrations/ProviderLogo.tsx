/**
 * 🎨 ProviderLogo — Logo oficial com fundo contextual + fallback elegante
 * - Logos monocromáticas (#ffffff) ganham fundo escuro garantindo contraste.
 * - Logos coloridas ganham glow contextual com a brand color.
 */
import { useState } from "react";
import { providerLogoUrl } from "./providerCatalog";

export default function ProviderLogo({
  slug, color, name, size = 40, className = "",
}: { slug?: string; color?: string; name: string; size?: number; className?: string }) {
  const [err, setErr] = useState(false);
  const isWhite = !color || /^#?f{3,6}$/i.test(color);
  const accent = color || "#ffffff";
  const url = slug ? providerLogoUrl(slug, isWhite ? "ffffff" : accent.replace("#", "")) : null;

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
      {url && !err ? (
        <img
          src={url}
          alt={name}
          width={size * 0.58}
          height={size * 0.58}
          loading="lazy"
          onError={() => setErr(true)}
          className="object-contain"
          style={{ filter: isWhite ? "drop-shadow(0 0 6px rgba(255,255,255,0.35))" : undefined }}
        />
      ) : (
        <span style={{ fontSize: size * 0.42 }}>{name.charAt(0)}</span>
      )}
    </div>
  );
}
