/**
 * OnboardingTour.tsx — SevenDevX
 * ─────────────────────────────────────────────────────────────────────
 * @file src/modules/onboarding/OnboardingTour.tsx
 * @module Onboarding
 *
 * @description
 * Tour guiado do SevenOS.
 *
 * @see src/modules/onboarding/README.md
 * ─────────────────────────────────────────────────────────────────────
 */

// ============================================================================
// 📦 IMPORTS
// ============================================================================

/**
 * 🎓 OnboardingTour — spotlight overlay com steps configuráveis.
 */
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { X, ChevronRight, ChevronLeft, Sparkles } from "lucide-react";
import { useOnboarding } from "@/hooks/useOnboarding";

// ============================================================================
// 🧩 TYPES & CONTRACTS
// ============================================================================

export type TourStep = {
  id: string;
  title: string;
  description: string;
  targetSelector?: string; // optional — when missing, shows centered modal
  placement?: "top" | "bottom" | "left" | "right" | "center";
};

// ============================================================================
// 🏗️ MAIN COMPONENT
// ============================================================================

export default function OnboardingTour({
  tourKey, steps, autoStart = true,
}: { tourKey: string; steps: TourStep[]; autoStart?: boolean }) {
  const { progress, completeStep, dismiss, complete } = useOnboarding(tourKey);
  const [idx, setIdx] = useState(-1);
  const [rect, setRect] = useState<DOMRect | null>(null);

  useEffect(() => {
    if (!progress) return;
    if (progress.completed_at || progress.dismissed_at) return;
    if (autoStart && idx === -1) setIdx(0);
  }, [progress, autoStart, idx]);

  const step = idx >= 0 ? steps[idx] : null;

  useEffect(() => {
    if (!step?.targetSelector) { setRect(null); return; }
    const update = () => {
      const el = document.querySelector(step.targetSelector!);
      if (el) {
        const r = el.getBoundingClientRect();
        setRect(r);
        el.scrollIntoView({ behavior: "smooth", block: "center" });
      } else setRect(null);
    };
    update();
    const t = setInterval(update, 250);
    window.addEventListener("resize", update);
    window.addEventListener("scroll", update, true);
    return () => { clearInterval(t); window.removeEventListener("resize", update); window.removeEventListener("scroll", update, true); };
  }, [step?.targetSelector]);

  if (!step) return null;

  const next = () => {
    completeStep(step.id);
    if (idx >= steps.length - 1) { complete(); setIdx(-1); }
    else setIdx(idx + 1);
  };
  const prev = () => setIdx(Math.max(0, idx - 1));
  const skip = () => { dismiss(); setIdx(-1); };

  const padding = 8;
  const cardW = 340;
  const cardPos = rect ? computePosition(rect, padding, cardW, step.placement) : null;

  return createPortal(
    <AnimatePresence>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className="fixed inset-0 z-[10000] pointer-events-none">
        {/* Dark overlay with spotlight hole */}
        <svg className="absolute inset-0 w-full h-full pointer-events-auto">
          <defs>
            <mask id="hole">
              <rect width="100%" height="100%" fill="white" />
              {rect && (
                <rect
                  x={rect.left - padding} y={rect.top - padding}
                  width={rect.width + padding * 2} height={rect.height + padding * 2}
                  rx={12} fill="black"
                />
              )}
            </mask>
          </defs>
          <rect width="100%" height="100%" fill="rgba(0,0,0,0.75)" mask="url(#hole)" onClick={skip} />
          {rect && (
            <rect
              x={rect.left - padding} y={rect.top - padding}
              width={rect.width + padding * 2} height={rect.height + padding * 2}
              rx={12} fill="none" stroke="rgba(251,191,36,0.8)" strokeWidth="2"
              className="animate-pulse" />
          )}
        </svg>
        {/* Tooltip card */}
        <motion.div
          key={step.id}
          initial={{ opacity: 0, y: 8, scale: 0.96 }} animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ type: "spring", stiffness: 240, damping: 22 }}
          style={cardPos ?? { left: "50%", top: "50%", transform: "translate(-50%, -50%)" }}
          className="absolute pointer-events-auto w-[340px] max-w-[90vw] rounded-2xl bg-[#0a0a0a] border border-white/15 shadow-2xl shadow-black/60 p-5">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-amber-500/30 to-fuchsia-500/30 border border-white/10 flex items-center justify-center">
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            </div>
            <div className="text-[10px] uppercase tracking-[0.2em] text-white/40">
              {idx + 1} / {steps.length}
            </div>
            <button onClick={skip} className="ml-auto p-1 rounded hover:bg-white/10 text-white/40 hover:text-white">
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
          <h3 className="text-sm font-semibold mb-1.5">{step.title}</h3>
          <p className="text-xs text-white/60 leading-relaxed mb-4">{step.description}</p>
          <div className="flex items-center justify-between gap-2">
            <button onClick={skip} className="text-[11px] text-white/40 hover:text-white">Pular tour</button>
            <div className="flex gap-1.5">
              {idx > 0 && (
                <button onClick={prev} className="p-1.5 rounded-lg border border-white/15 hover:bg-white/5">
                  <ChevronLeft className="w-3.5 h-3.5" />
                </button>
              )}
              <button onClick={next} className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-white text-black text-xs font-medium">
                {idx >= steps.length - 1 ? "Concluir" : "Próximo"}
                {idx < steps.length - 1 && <ChevronRight className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>,
    document.body
  );
}

function computePosition(rect: DOMRect, pad: number, cardW: number, placement?: string) {
  const vh = window.innerHeight;
  const vw = window.innerWidth;
  const cardH = 200;
  const margin = 12;
  let top = rect.bottom + pad + margin;
  let left = rect.left + rect.width / 2 - cardW / 2;
  if (placement === "top" || top + cardH > vh - 20) top = rect.top - pad - cardH - margin;
  if (top < 20) top = 20;
  left = Math.max(16, Math.min(vw - cardW - 16, left));
  return { left, top };
}
