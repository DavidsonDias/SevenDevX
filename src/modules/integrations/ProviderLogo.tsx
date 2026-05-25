/**
 * 🎨 ProviderLogo — Logo oficial com fallback elegante
 */
import { useState } from "react";
import { providerLogoUrl } from "./providerCatalog";

export default function ProviderLogo({
  slug, color, name, size = 40, className = "",
}: { slug?: string; color?: string; name: string; size?: number; className?: string }) {
  const [err, setErr] = useState(false);
  const url = slug ? providerLogoUrl(slug, color) : null;

  return (
    <div
      className={`relative rounded-xl border border-white/10 flex items-center justify-center font-bold shrink-0 overflow-hidden ${className}`}
      style={{
        width: size,
        height: size,
        background: `${color || "#ffffff"}18`,
        color: color || "#ffffff",
        boxShadow: `0 0 24px ${color || "#ffffff"}22 inset`,
      }}
    >
      {url && !err ? (
        <img
          src={url}
          alt={name}
          width={size * 0.55}
          height={size * 0.55}
          loading="lazy"
          onError={() => setErr(true)}
          className="object-contain"
        />
      ) : (
        <span style={{ fontSize: size * 0.42 }}>{name.charAt(0)}</span>
      )}
    </div>
  );
}
