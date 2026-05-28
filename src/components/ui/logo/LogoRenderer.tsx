/**
 * 🎨 LogoRenderer — Wrapper enterprise unificado para logos de providers/tecnologias.
 * Centraliza tamanhos, glow, skeleton e fallback. Reusa ProviderLogo (local-first via react-icons/si).
 */
import { Suspense, lazy } from "react";
import ProviderLogo from "@/modules/integrations/ProviderLogo";

export type LogoVariant = "xs" | "sm" | "md" | "lg" | "xl" | "card" | "marketplace" | "hero" | "inline";

const SIZE: Record<LogoVariant, number> = {
  xs: 20, sm: 28, md: 40, lg: 56, xl: 80,
  card: 44, marketplace: 48, hero: 96, inline: 18,
};

interface Props {
  slug?: string;
  color?: string;
  name: string;
  variant?: LogoVariant;
  className?: string;
  /** Adiciona glow pulsante sutil ao redor (premium mode) */
  glow?: boolean;
  /** Desativa background/borda (somente o glifo) */
  bare?: boolean;
}

export function LogoSkeleton({ size = 40 }: { size?: number }) {
  return (
    <div
      className="rounded-xl bg-white/[0.04] border border-white/10 animate-pulse"
      style={{ width: size, height: size }}
      aria-hidden
    />
  );
}

export default function LogoRenderer({
  slug, color, name, variant = "md", className, glow = false, bare = false,
}: Props) {
  const size = SIZE[variant];
  return (
    <div className={`relative inline-flex shrink-0 ${className ?? ""}`}>
      {glow && (
        <span
          aria-hidden
          className="absolute inset-0 rounded-xl blur-xl opacity-60 pointer-events-none animate-pulse"
          style={{ background: `radial-gradient(circle, ${color ?? "#ffffff"}44, transparent 70%)` }}
        />
      )}
      <Suspense fallback={<LogoSkeleton size={size} />}>
        <ProviderLogo
          slug={slug}
          color={color}
          name={name}
          size={size}
          className={bare ? "!bg-transparent !border-0 !shadow-none" : ""}
        />
      </Suspense>
    </div>
  );
}
