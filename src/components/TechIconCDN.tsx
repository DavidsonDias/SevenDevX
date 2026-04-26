/**
 * 🎨 TechIconCDN — Renders OFFICIAL brand-colored tech icons via Simple Icons CDN
 *
 * IMPORTANT: We intentionally do NOT pass a color to the CDN, so each icon is
 * rendered in its true brand color (React = #61DAFB, TypeScript = #3178C6,
 * Node.js = #5FA04E, PostgreSQL = #4169E1, Tailwind = #06B6D4, etc.).
 *
 * The optional `color` prop is only used as the fallback badge tint when the
 * icon fails to load (e.g. unknown slug).
 */
import { useState } from "react";

interface TechIconCDNProps {
  slug: string;
  name: string;
  color?: string;
  size?: number;
  className?: string;
}

export const TechIconCDN = ({ slug, name, color, size = 20, className = "" }: TechIconCDNProps) => {
  const [failed, setFailed] = useState(false);

  // Official brand color from Simple Icons (no color override)
  const url = slug ? `https://cdn.simpleicons.org/${encodeURIComponent(slug)}` : "";

  if (failed || !slug) {
    const fallbackColor = color || "#8B5CF6";
    return (
      <span
        className={`inline-flex items-center justify-center rounded-md font-bold text-[10px] uppercase ${className}`}
        style={{
          width: size,
          height: size,
          background: `${fallbackColor}22`,
          color: fallbackColor,
          border: `1px solid ${fallbackColor}55`,
        }}
        aria-label={name}
      >
        {name?.[0] || "?"}
      </span>
    );
  }

  return (
    <img
      src={url}
      alt={name}
      width={size}
      height={size}
      loading="lazy"
      onError={() => setFailed(true)}
      className={`inline-block ${className}`}
      style={{ width: size, height: size, objectFit: "contain" }}
    />
  );
};

export default TechIconCDN;
