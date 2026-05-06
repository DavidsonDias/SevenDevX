/**
 * 🧮 PricingEngineModal — calcula orçamento sugerido por tipo + complexidade + features.
 * Pode ser embarcado em qualquer fluxo (preenche valor do contrato).
 */
import { useMemo, useState } from "react";
import { Calculator, X, Sparkles } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useScrollLock } from "@/hooks/useScrollLock";
import {
  estimatePrice, maskBRL, type ProjectType, type Complexity, type PricingFeature,
} from "@/lib/contractBuilder";

const TYPES: { id: ProjectType; label: string }[] = [
  { id: "landing_page", label: "Landing Page" },
  { id: "website", label: "Website Institucional" },
  { id: "system", label: "Sistema Web" },
  { id: "ecommerce", label: "E-commerce" },
  { id: "mobile", label: "Mobile" },
];
const COMPLEXITIES: { id: Complexity; label: string }[] = [
  { id: "simple", label: "Simples" },
  { id: "medium", label: "Médio" },
  { id: "advanced", label: "Avançado" },
];
const FEATURES: { id: PricingFeature; label: string }[] = [
  { id: "form", label: "Formulário" },
  { id: "api_integration", label: "Integração API" },
  { id: "auth", label: "Login/Auth" },
  { id: "dashboard", label: "Dashboard" },
  { id: "payment", label: "Pagamento" },
  { id: "blog", label: "Blog/CMS" },
  { id: "i18n", label: "Multi-idioma" },
  { id: "admin_panel", label: "Painel Admin" },
  { id: "ai", label: "IA / GPT" },
  { id: "realtime", label: "Realtime" },
];

interface Props {
  open: boolean;
  onClose: () => void;
  onApply: (price: number, weeks: number, breakdownText: string) => void;
}

export default function PricingEngineModal({ open, onClose, onApply }: Props) {
  useScrollLock(open);
  const [type, setType] = useState<ProjectType>("landing_page");
  const [complexity, setComplexity] = useState<Complexity>("medium");
  const [features, setFeatures] = useState<PricingFeature[]>([]);

  const result = useMemo(() => estimatePrice({ type, complexity, features }), [type, complexity, features]);

  const toggleFeat = (f: PricingFeature) =>
    setFeatures((arr) => arr.includes(f) ? arr.filter((x) => x !== f) : [...arr, f]);

  const apply = () => {
    const text = result.breakdown.map((b) => `- ${b.label}: ${maskBRL(b.value)}`).join("\n");
    onApply(result.suggested_price, result.weeks_estimate, text);
    onClose();
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          className="fixed inset-0 z-[210] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-2xl my-8 bg-zinc-950 border border-white/15 rounded-2xl shadow-2xl"
          >
            <div className="p-5 border-b border-white/10 flex items-center justify-between">
              <h3 className="font-bold flex items-center gap-2">
                <Calculator className="w-4 h-4 text-emerald-400" />
                AI Pricing Engine
              </h3>
              <button onClick={onClose} className="p-1 rounded hover:bg-white/10"><X className="w-4 h-4" /></button>
            </div>

            <div className="p-5 space-y-5">
              <div>
                <label className="text-xs uppercase tracking-wider text-white/50 mb-2 block">Tipo de projeto</label>
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                  {TYPES.map((t) => (
                    <button key={t.id} onClick={() => setType(t.id)}
                      className={`text-xs px-2 py-2 rounded border transition-colors ${type === t.id ? "bg-emerald-500/20 border-emerald-500/50 text-emerald-200" : "bg-white/5 border-white/10 hover:bg-white/10"}`}>
                      {t.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-xs uppercase tracking-wider text-white/50 mb-2 block">Complexidade</label>
                <div className="grid grid-cols-3 gap-2">
                  {COMPLEXITIES.map((c) => (
                    <button key={c.id} onClick={() => setComplexity(c.id)}
                      className={`text-xs px-2 py-2 rounded border transition-colors ${complexity === c.id ? "bg-emerald-500/20 border-emerald-500/50 text-emerald-200" : "bg-white/5 border-white/10 hover:bg-white/10"}`}>
                      {c.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-xs uppercase tracking-wider text-white/50 mb-2 block">Features inclusas</label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {FEATURES.map((f) => {
                    const active = features.includes(f.id);
                    return (
                      <button key={f.id} onClick={() => toggleFeat(f.id)}
                        className={`text-xs px-2 py-2 rounded border transition-colors text-left ${active ? "bg-emerald-500/20 border-emerald-500/50 text-emerald-200" : "bg-white/5 border-white/10 hover:bg-white/10"}`}>
                        {f.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs uppercase tracking-wider text-emerald-300/80">Sugerido</span>
                  <span className="text-xs text-emerald-300/70">{result.weeks_estimate} semanas</span>
                </div>
                <div className="text-3xl font-bold text-emerald-200">{maskBRL(result.suggested_price)}</div>
                <ul className="mt-3 space-y-1 text-xs text-white/70">
                  {result.breakdown.map((b, i) => (
                    <li key={i} className="flex justify-between"><span>{b.label}</span><span>{maskBRL(b.value)}</span></li>
                  ))}
                </ul>
              </div>

              <button onClick={apply}
                className="w-full py-3 bg-emerald-500/20 border border-emerald-500/40 text-emerald-100 rounded-lg font-semibold inline-flex items-center justify-center gap-2 hover:bg-emerald-500/30">
                <Sparkles className="w-4 h-4" /> Aplicar valor ao contrato
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
