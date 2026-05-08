/**
 * 🧮 PricingEngineModal — Enterprise modal: sticky header/footer, scroll interno,
 * safe-area iOS, focus trap básico, ESC + click outside.
 */
import { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
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
  const closeBtnRef = useRef<HTMLButtonElement>(null);

  const result = useMemo(() => estimatePrice({ type, complexity, features }), [type, complexity, features]);

  const toggleFeat = (f: PricingFeature) =>
    setFeatures((arr) => arr.includes(f) ? arr.filter((x) => x !== f) : [...arr, f]);

  // ESC para fechar
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKey);
    closeBtnRef.current?.focus();
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  const apply = () => {
    const text = result.breakdown.map((b) => `- ${b.label}: ${maskBRL(b.value)}`).join("\n");
    onApply(result.suggested_price, result.weeks_estimate, text);
    onClose();
  };

  if (typeof document === "undefined") return null;

  return createPortal(
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-[210] bg-black/75 backdrop-blur-md flex items-center justify-center p-3 sm:p-4"
          onClick={onClose}
          role="dialog"
          aria-modal="true"
          aria-labelledby="pricing-engine-title"
        >
          <motion.div
            initial={{ y: 20, opacity: 0, scale: 0.96 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: 20, opacity: 0, scale: 0.96 }}
            transition={{ duration: 0.22 }}
            onClick={(e) => e.stopPropagation()}
            className="
              w-full sm:w-[min(1100px,92vw)]
              bg-zinc-950 border border-white/15
              rounded-2xl shadow-2xl
              flex flex-col
              max-h-[calc(100vh-24px)] sm:max-h-[90vh]
              overflow-hidden
            "
            style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
          >
            {/* STICKY HEADER */}
            <div className="shrink-0 px-5 py-4 border-b border-white/10 flex items-center justify-between bg-zinc-950/95 backdrop-blur">
              <h3 id="pricing-engine-title" className="font-bold flex items-center gap-2 min-w-0">
                <Calculator className="w-4 h-4 text-emerald-400 shrink-0" />
                <span className="truncate">AI Pricing Engine</span>
              </h3>
              <button
                ref={closeBtnRef}
                onClick={onClose}
                className="p-1.5 rounded hover:bg-white/10 shrink-0"
                aria-label="Fechar"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* SCROLL AREA */}
            <div className="flex-1 overflow-y-auto overscroll-contain px-5 py-5 space-y-5 min-h-0">
              <Section label="Tipo de projeto">
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2">
                  {TYPES.map((t) => (
                    <Chip key={t.id} active={type === t.id} onClick={() => setType(t.id)}>{t.label}</Chip>
                  ))}
                </div>
              </Section>

              <Section label="Complexidade">
                <div className="grid grid-cols-3 gap-2">
                  {COMPLEXITIES.map((c) => (
                    <Chip key={c.id} active={complexity === c.id} onClick={() => setComplexity(c.id)}>{c.label}</Chip>
                  ))}
                </div>
              </Section>

              <Section label="Features inclusas">
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {FEATURES.map((f) => (
                    <Chip key={f.id} active={features.includes(f.id)} onClick={() => toggleFeat(f.id)}>
                      {f.label}
                    </Chip>
                  ))}
                </div>
              </Section>

              <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs uppercase tracking-wider text-emerald-300/80">Sugerido</span>
                  <span className="text-xs text-emerald-300/70">{result.weeks_estimate} semanas</span>
                </div>
                <div className="text-3xl font-bold text-emerald-200 break-words">{maskBRL(result.suggested_price)}</div>
                <ul className="mt-3 space-y-1 text-xs text-white/70">
                  {result.breakdown.map((b, i) => (
                    <li key={i} className="flex justify-between gap-2">
                      <span className="truncate">{b.label}</span>
                      <span className="shrink-0">{maskBRL(b.value)}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* STICKY FOOTER */}
            <div className="shrink-0 px-5 py-4 border-t border-white/10 bg-zinc-950/95 backdrop-blur flex flex-col sm:flex-row gap-2">
              <button
                onClick={onClose}
                className="sm:flex-1 py-2.5 rounded-lg border border-white/15 hover:bg-white/5 text-sm"
              >
                Cancelar
              </button>
              <button
                onClick={apply}
                className="sm:flex-[2] py-2.5 bg-emerald-500/20 border border-emerald-500/40 text-emerald-100 rounded-lg font-semibold inline-flex items-center justify-center gap-2 hover:bg-emerald-500/30 text-sm"
              >
                <Sparkles className="w-4 h-4" /> Aplicar valor ao contrato
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function Section({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="text-[11px] uppercase tracking-wider text-white/50 mb-2 block">{label}</label>
      {children}
    </div>
  );
}

function Chip({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`min-w-0 text-xs px-2 py-2 rounded border transition-colors text-center truncate ${
        active
          ? "bg-emerald-500/20 border-emerald-500/50 text-emerald-200"
          : "bg-white/5 border-white/10 hover:bg-white/10"
      }`}
    >
      {children}
    </button>
  );
}
