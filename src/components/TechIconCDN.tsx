/**
 * 🎨 TechIconCDN — Renders tech icons via Simple Icons CDN
 * Falls back to a colored initial badge if the CDN fails.
 */
import { useState } from "react";

interface TechIconCDNProps {
  slug: string;
  name: string;
  color?: string;
  size?: number;
  className?: string;
}

const cleanHex = (c?: string) => (c || "8B5CF6").replace("#", "");

export const TechIconCDN = ({ slug, name, color, size = 20, className = "" }: TechIconCDNProps) => {
  const [failed, setFailed] = useState(false);
  const url = `https://cdn.simpleicons.org/${encodeURIComponent(slug)}/${cleanHex(color)}`;

  if (failed || !slug) {
    return (
      <span
        className={`inline-flex items-center justify-center rounded-md font-bold text-[10px] uppercase ${className}`}
        style={{
          width: size,
          height: size,
          background: `${color || "#8B5CF6"}22`,
          color: color || "#8B5CF6",
          border: `1px solid ${color || "#8B5CF6"}55`,
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
      style={{ width: size, height: size }}
    />
  );
};

export default TechIconCDN;
