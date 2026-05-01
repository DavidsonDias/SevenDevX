/**
 * 🗺️ Breadcrumb — caminho dinâmico do admin
 * Resolve labels com base na rota atual.
 */
import { Link, useLocation } from "react-router-dom";
import { ChevronRight, Home } from "lucide-react";

const LABELS: Record<string, string> = {
  admin: "Painel",
  projects: "Projetos",
  clients: "Clientes",
  pipeline: "Pipeline",
  services: "Serviços",
  technologies: "Tecnologias",
  tags: "Tags",
  faq: "FAQ",
  process: "Processo",
  blog: "Blog",
  contacts: "Contatos",
  debug: "Debug",
};

const prettify = (s: string) =>
  LABELS[s] ||
  decodeURIComponent(s)
    .replace(/[-_]/g, " ")
    .replace(/\b\w/g, (m) => m.toUpperCase());

export const Breadcrumb = () => {
  const { pathname } = useLocation();
  const parts = pathname.split("/").filter(Boolean);
  if (parts.length <= 1) return null;

  const crumbs = parts.map((seg, i) => {
    const href = "/" + parts.slice(0, i + 1).join("/");
    // UUIDs viram "Detalhe"
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-/i.test(seg);
    return { href, label: isUuid ? "Detalhe" : prettify(seg) };
  });

  return (
    <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-xs text-white/40 mb-3 overflow-x-auto whitespace-nowrap">
      <Link to="/admin" className="hover:text-white/80 inline-flex items-center gap-1 shrink-0">
        <Home className="w-3 h-3" />
      </Link>
      {crumbs.slice(1).map((c, i) => (
        <div key={c.href} className="inline-flex items-center gap-1.5 shrink-0">
          <ChevronRight className="w-3 h-3 opacity-40" />
          {i === crumbs.length - 2 ? (
            <span className="text-white/80 font-medium">{c.label}</span>
          ) : (
            <Link to={c.href} className="hover:text-white/80">{c.label}</Link>
          )}
        </div>
      ))}
    </nav>
  );
};

export default Breadcrumb;
