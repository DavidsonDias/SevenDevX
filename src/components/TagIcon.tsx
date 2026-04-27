import {
  Activity, BarChart3, Bot, BriefcaseBusiness, Building2, CalendarCheck, ChartNoAxesCombined,
  Code2, Cpu, Cuboid, FileText, Gamepad2, Globe2, HeartPulse, LayoutDashboard,
  Megaphone, MessageCircle, MonitorSmartphone, Network, PackageOpen, PanelsTopLeft,
  Rocket, Settings2, ShoppingCart, Smartphone, Sparkles, Store, Tags, Video,
  Workflow, Zap,
} from "lucide-react";
import * as SiIcons from "react-icons/si";
import type { IconType } from "react-icons";

interface TagIconProps {
  name: string;
  slug?: string;
  color?: string;
  size?: number;
  className?: string;
}

const TAG_ICON_MAP: Record<string, IconType> = {
  "3d": SiIcons.SiThreedotjs,
  ai: SiIcons.SiOpenai,
  analytics: SiIcons.SiGoogleanalytics,
  api: SiIcons.SiGraphql,
  crypto: SiIcons.SiBitcoin,
  ecommerce: SiIcons.SiShopify,
  "e-commerce": SiIcons.SiShopify,
  gamedev: SiIcons.SiUnity,
  iot: SiIcons.SiInternetcomputer,
  pwa: SiIcons.SiPwa,
  saas: Rocket,
  social: SiIcons.SiWhatsapp,
  streaming: Video,
};

const FALLBACK_TAGS: Record<string, IconType> = {
  automation: Workflow,
  b2b: Building2,
  b2c: Store,
  blog: FileText,
  booking: CalendarCheck,
  chatbot: Bot,
  cms: PanelsTopLeft,
  crm: BriefcaseBusiness,
  dashboard: LayoutDashboard,
  "design-system": Sparkles,
  edtech: MonitorSmartphone,
  enterprise: BriefcaseBusiness,
  fintech: ChartNoAxesCombined,
  game: Gamepad2,
  healthtech: HeartPulse,
  landing: Megaphone,
  "landing-page": Megaphone,
  marketplace: Store,
  mobile: Smartphone,
  "open-source": Code2,
  portfolio: PackageOpen,
  productivity: Activity,
  realtime: Zap,
  web: Globe2,
  "web-app": Network,
};

export const TagIcon = ({ name, slug, color, size = 14, className = "" }: TagIconProps) => {
  const key = (slug || name).toLowerCase().trim().replace(/\s+/g, "-");
  const Icon = TAG_ICON_MAP[key] || FALLBACK_TAGS[key] || Tags;

  return (
    <Icon
      aria-label={name}
      className={`inline-block shrink-0 ${className}`}
      style={{ width: size, height: size, color: color || "currentColor" }}
    />
  );
};

export default TagIcon;