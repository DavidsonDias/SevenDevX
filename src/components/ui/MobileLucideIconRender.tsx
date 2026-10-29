/**
 * 🎯 LucideIconRender — resolve dinamicamente qualquer ícone do lucide-react
 * a partir de um nome (PascalCase, kebab-case ou snake_case), com fallback seguro.
 */
import { forwardRef, useState } from "react";
import { Icon, Code, type LucideProps, type LucideIcon } from "lucide-react";
import catalog from "@/data/lucideIconAssets.json";

const names: Record<string, string> = catalog.names;
const resolved = new Map<string, LucideIcon>();

const toPascal = (raw: string) =>
  raw
    .trim()
    .replace(/[_-]+/g, " ")
    .replace(/\s+/g, " ")
    .split(" ")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join("");

export const resolveLucideName = (name?: string | null) => name ? names[name] || names[toPascal(name)] : undefined;

export function resolveLucideIcon(name?: string | null) {
  if (!name) return Code;
  const canonical = resolveLucideName(name);
  if (!canonical) return Code;
  const cached = resolved.get(canonical);
  if (cached) return cached;
  const source = `/lucide-icons/${catalog.version}/${canonical}.svg`;
  const classSuffix = canonical.replace(/([a-z0-9])([A-Z])/g, "$1-$2").toLowerCase();
  const Component = forwardRef<SVGSVGElement, LucideProps>(({ children, className, ...props }, ref) => {
    const [failed, setFailed] = useState(false);
    if (failed) return <Code {...props} className={className} ref={ref}>{children}</Code>;
    return <>
      <Icon {...props} ref={ref} iconNode={[]} className={`lucide-${classSuffix}${className ? ` ${className}` : ""}`}>
        <use key="asset" href={`${source}#icon`} />{children}
      </Icon>
      {/* Detect a missing/offline asset without adding a visible layout box. */}
      <img src={source} alt="" aria-hidden="true" width={1} height={1} style={{ display: "none" }} onError={() => setFailed(true)} />
    </>;
  });
  Component.displayName = canonical;
  resolved.set(canonical, Component);
  return Component;
}

interface Props extends LucideProps {
  name?: string | null;
  fallback?: keyof typeof catalog.names;
}

export default function LucideIconRender({ name, fallback, ...rest }: Props) {
  const Cmp = resolveLucideIcon(name) || resolveLucideIcon(fallback);
  return <Cmp {...rest} />;
}
