/**
 * 🎨 useResolvedAccent — Resolve a cor "viva" de um provider/logo.
 * Prioridade: override.color > cor extraída do SVG inline > cor extraída da URL > fallback.
 * Reage a mudanças globais de branding (DB + Realtime via useLogoOverrides).
 */
import { useLogoOverrides } from "./useLogoOverrides";
import { useExtractedColor } from "./useExtractedColor";

export function useResolvedAccent(slug?: string, fallback?: string): string {
  const { get } = useLogoOverrides();
  const ov = get(slug);
  const color = useExtractedColor({
    explicitColor: ov?.color,
    customSvg: ov?.customSvg,
    customUrl: ov?.customUrl,
  });
  return color || fallback || "#ffffff";
}
