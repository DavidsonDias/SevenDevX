/**
 * 🎨 LogoRenderer — Wrapper enterprise unificado para logos de providers/tecnologias.
 * Sistema oficial global. Centraliza tamanhos, glow, skeleton e fallback.
 * Internamente reusa o pipeline local-first (react-icons/si) do ProviderLogo.
 */
import { Suspense } from "react";
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
  /** Override numérico — quando passado, prevalece sobre variant */
  size?: number;
  className?: string;
  /** Glow pulsante sutil ao redor (premium) */
  glow?: boolean;
  /** Renderiza somente o glifo (sem bg/borda) */
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
  slug, color, name, variant = "md", size, className, glow = false, bare = false,
}: Props) {
  const px = size ?? SIZE[variant];
  return (
    <div className={`relative inline-flex shrink-0 ${className ?? ""}`} style={{ width: px, height: px }}>
      {glow && (
        <span
          aria-hidden
          className="absolute inset-0 rounded-xl blur-xl opacity-60 pointer-events-none animate-pulse"
          style={{ background: `radial-gradient(circle, ${color ?? "#ffffff"}44, transparent 70%)` }}
        />
      )}
      <Suspense fallback={<LogoSkeleton size={px} />}>
        <ProviderLogo
          slug={slug}
          color={color}
          name={name}
          size={px}
          className={bare ? "!bg-transparent !border-0 !shadow-none" : ""}
        />
      </Suspense>
    </div>
  );
}
