/**
 * LucideIconPicker.tsx — SevenDevX
 * ─────────────────────────────────────────────────────────────────────
 * @file src/components/admin/LucideIconPicker.tsx
 * @module SevenOS/UI
 *
 * @description
 * Seletor visual de ícones Lucide usado pelos CMSs.
 *
 * @security Uso restrito ao SevenOS; arquivos privados sempre por URL assinada.
 *
 * @see src/components/admin/README.md
 * ─────────────────────────────────────────────────────────────────────
 */

/**
 * 🎨 LucideIconPicker — seletor visual de ícones Lucide com busca.
 * Mostra preview do ícone atual + popover com grid pesquisável (toda a biblioteca).
 */
import { useMemo, useState } from "react";
import { icons, Search, X } from "lucide-react";
import LucideIconRender, { resolveLucideIcon } from "@/components/ui/LucideIconRender";

interface Props {
  value?: string | null;
  onChange: (name: string) => void;
  color?: string;
}

// Curated "popular" subset shown by default (fast first paint)
const POPULAR = [
  "Code", "Code2", "FileText", "Lightbulb", "Sparkles", "Rocket", "Layers",
  "Briefcase", "Palette", "Database", "Settings", "Wrench", "Cpu", "Cloud",
  "Globe", "Smartphone", "Monitor", "Server", "Shield", "Lock", "Key",
  "Zap", "Bot", "Brain", "Wand2", "Boxes", "Package", "ShoppingCart",
  "CreditCard", "DollarSign", "TrendingUp", "BarChart3", "PieChart", "LineChart",
  "Mail", "MessageSquare", "Phone", "Send", "Users", "User", "UserPlus",
  "Calendar", "Clock", "Bell", "Star", "Heart", "Flag", "Trophy",
  "Camera", "Image", "Video", "Music", "Mic", "Film", "Headphones",
  "PenTool", "Paintbrush", "Brush", "Type", "Layout", "LayoutGrid", "Grid3x3",
  "Search", "Filter", "Tag", "Bookmark", "Link", "Share2", "Download",
  "Upload", "FolderOpen", "Folder", "File", "FileCode", "FilePlus",
  "Plug", "Workflow", "GitBranch", "Github", "Terminal", "Bug", "TestTube",
  "Compass", "Map", "MapPin", "Navigation", "Truck", "Plane", "Car",
];

/**
 * Seletor visual de ícones Lucide com busca, usado no CMS de serviços.
 */
export default function LucideIconPicker({ value, onChange, color }: Props) {
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const Current = resolveLucideIcon(value);

  const list = useMemo(() => {
    const all = Object.keys(icons);
    if (!q.trim()) return POPULAR.filter((n) => (icons as any)[n]);
    const needle = q.toLowerCase().replace(/[^a-z0-9]/g, "");
    return all.filter((n) => n.toLowerCase().includes(needle)).slice(0, 200);
  }, [q]);

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center gap-3 px-3 py-2 bg-white/5 border border-white/10 rounded-lg hover:border-white/30 transition text-sm"
      >
        <div
          className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0"
          style={{ background: color ? `${color}22` : "rgba(255,255,255,0.06)", border: `1px solid ${color ?? "rgba(255,255,255,0.1)"}` }}
        >
          <Current className="w-5 h-5" style={{ color: color ?? "#fff" }} />
        </div>
        <span className="flex-1 text-left truncate">{value || "Escolher ícone"}</span>
        <span className="text-[10px] uppercase tracking-wider text-white/40">Lucide</span>
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute z-50 mt-2 w-[min(560px,90vw)] right-0 bg-zinc-950 border border-white/10 rounded-xl shadow-2xl overflow-hidden">
            <div className="p-3 border-b border-white/10 flex items-center gap-2">
              <Search className="w-4 h-4 text-white/40" />
              <input
                autoFocus
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Buscar entre 1500+ ícones..."
                className="flex-1 bg-transparent text-sm outline-none"
              />
              {q && (
                <button onClick={() => setQ("")} className="text-white/40 hover:text-white">
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
            <div className="p-3 max-h-[360px] overflow-y-auto grid grid-cols-8 sm:grid-cols-10 gap-1.5">
              {list.map((name) => (
                <button
                  key={name}
                  type="button"
                  title={name}
                  onClick={() => { onChange(name); setOpen(false); }}
                  className={`aspect-square rounded-md flex items-center justify-center border transition ${
                    value === name
                      ? "border-white bg-white/10"
                      : "border-white/10 hover:border-white/30 hover:bg-white/5"
                  }`}
                >
                  <LucideIconRender name={name} className="w-4 h-4" />
                </button>
              ))}
              {list.length === 0 && (
                <div className="col-span-full text-center text-xs text-white/40 py-8">
                  Nenhum ícone encontrado para "{q}"
                </div>
              )}
            </div>
            <div className="px-3 py-2 border-t border-white/10 text-[10px] uppercase tracking-wider text-white/40">
              {q ? `${list.length} resultados` : `Populares — digite para buscar todos`}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
