/**
 * 🏷️ TagIcon — Renders the same icon for a given tag everywhere
 * (admin select, project cards, hub, modal, detail page).
 *
 * Resolution order:
 *  1. Brand/product icons via `react-icons/si` (PWA, SaaS, AI, Shopify…)
 *  2. Conceptual lucide icons (dashboard, mobile, security…)
 *  3. Default `Tags` lucide icon
 */
import {
  Activity, Accessibility, Bot, BriefcaseBusiness, Building2, CalendarCheck,
  ChartNoAxesCombined, Code2, CreditCard, FileText, Gamepad2, Globe2, GraduationCap,
  HeartPulse, LayoutDashboard, Lightbulb, Lock, Megaphone, MonitorSmartphone,
  Moon, Network, Newspaper, PackageOpen, PanelsTopLeft, Repeat, Rocket,
  Search, Server, ShoppingBag, Smartphone, Sparkles, Store, Tags, Users,
  Video, Wand2, Workflow, Zap,
} from "lucide-react";
import * as SiIcons from "react-icons/si";
import type { ElementType } from "react";

interface TagIconProps {
  name: string;
  slug?: string;
  color?: string;
  size?: number;
  className?: string;
  /** Custom icon URL (uploaded SVG/PNG) — takes priority. */
  iconUrl?: string | null;
}

/** Brand/product logos (Simple Icons). */
const BRAND_TAG_ICONS: Record<string, ElementType> = {
  "3d": SiIcons.SiThreedotjs,
  ai: SiIcons.SiOpenai,
  analytics: SiIcons.SiGoogleanalytics,
  api: SiIcons.SiGraphql,
  crypto: SiIcons.SiBitcoin,
  ecommerce: SiIcons.SiShopify,
  iot: SiIcons.SiInternetcomputer,
  jamstack: SiIcons.SiJamstack,
  pwa: SiIcons.SiPwa,
  ssr: SiIcons.SiNextdotjs,
  serverless: SiIcons.SiAwslambda,
  social: SiIcons.SiWhatsapp,
  streaming: SiIcons.SiYoutube,
  // Optional brand-aligned visuals for tech-flavoured tags:
  "open-source": SiIcons.SiOpensourceinitiative,
};

/** Conceptual / lucide-based icons for non-brand tags. */
const CONCEPT_TAG_ICONS: Record<string, ElementType> = {
  accessibility: Accessibility,
  agency: BriefcaseBusiness,
  animation: Wand2,
  automation: Workflow,
  b2b: Building2,
  b2c: Store,
  blog: FileText,
  booking: CalendarCheck,
  chatbot: Bot,
  cms: PanelsTopLeft,
  community: Users,
  crm: BriefcaseBusiness,
  dashboard: LayoutDashboard,
  "dark-mode": Moon,
  "design-system": Sparkles,
  edtech: GraduationCap,
  education: GraduationCap,
  enterprise: BriefcaseBusiness,
  fintech: ChartNoAxesCombined,
  game: Gamepad2,
  gamedev: Gamepad2,
  headless: Server,
  healthtech: HeartPulse,
  landing: Megaphone,
  lowcode: Lightbulb,
  marketplace: Store,
  microservices: Network,
  mobile: Smartphone,
  multitenant: Users,
  mvp: Rocket,
  news: Newspaper,
  nocode: Lightbulb,
  payments: CreditCard,
  performance: Zap,
  portfolio: PackageOpen,
  productivity: Activity,
  realtime: Zap,
  responsive: MonitorSmartphone,
  saas: Rocket,
  security: Lock,
  seo: Search,
  startup: Rocket,
  subscription: Repeat,
  web: Globe2,
  webapp: Network,
};

const normalize = (s: string) =>
  s.toLowerCase().trim().replace(/\s+/g, "-");

export const TagIcon = ({ name, slug, color, size = 14, className = "", iconUrl }: TagIconProps) => {
  if (iconUrl) {
    return (
      <img
        src={iconUrl}
        alt={name}
        title={name}
        loading="lazy"
        className={`inline-block shrink-0 object-contain ${className}`}
        style={{ width: size, height: size }}
      />
    );
  }

  const key = normalize(slug || name);
  const Icon =
    BRAND_TAG_ICONS[key] ||
    CONCEPT_TAG_ICONS[key] ||
    // common aliases (legacy data)
    BRAND_TAG_ICONS[key.replace("-", "")] ||
    CONCEPT_TAG_ICONS[key.replace("-", "")] ||
    Tags;

  return (
    <Icon
      aria-label={name}
      className={`inline-block shrink-0 ${className}`}
      style={{ width: size, height: size, color: color || "currentColor" }}
    />
  );
};

export default TagIcon;
