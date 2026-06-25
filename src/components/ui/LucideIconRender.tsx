/**
 * 🎯 LucideIconRender — resolve dinamicamente qualquer ícone do lucide-react
 * a partir de um nome (PascalCase, kebab-case ou snake_case), com fallback seguro.
 */
import { icons, Code, type LucideProps } from "lucide-react";

const toPascal = (raw: string) =>
  raw
    .trim()
    .replace(/[_-]+/g, " ")
    .replace(/\s+/g, " ")
    .split(" ")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join("");

export function resolveLucideIcon(name?: string | null) {
  if (!name) return Code;
  const map = icons as Record<string, any>;
  return map[name] || map[toPascal(name)] || Code;
}

interface Props extends LucideProps {
  name?: string | null;
  fallback?: keyof typeof icons;
}

export default function LucideIconRender({ name, fallback, ...rest }: Props) {
  const map = icons as Record<string, any>;
  const Cmp = resolveLucideIcon(name) || (fallback ? map[fallback] : Code);
  return <Cmp {...rest} />;
}
