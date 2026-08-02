/**
 * 🚀 PWAUpdatePrompt.tsx — SevenDevX Enterprise Platform
 * ═══════════════════════════════════════════════════════════════════════
 *
 * @file src/components/PWAUpdatePrompt.tsx
 * @module UI
 * @layer Presentation / UI
 * @status Active
 *
 * @description
 * Aviso de nova versão do app; a atualização é sempre confirmada
 * pelo usuário.
 *
 * ┌─────────────────────────────────────────────────────────────────────┐
 * │ 🛠️ DEPENDÊNCIAS RELEVANTES                                         │
 * └─────────────────────────────────────────────────────────────────────┘
 *
 * ✅ Framer Motion — transições e animações
 * ✅ Lucide — iconografia do design system
 *
 * ┌─────────────────────────────────────────────────────────────────────┐
 * │ ⚡ PERFORMANCE                                                       │
 * └─────────────────────────────────────────────────────────────────────┘
 *
 * ✅ Evitar alterações que provoquem layout shift
 *
 * ┌─────────────────────────────────────────────────────────────────────┐
 * │ ♿ ACESSIBILIDADE                                                    │
 * └─────────────────────────────────────────────────────────────────────┘
 *
 * ✅ Controles interativos expõem rótulos/roles acessíveis
 *
 * ┌─────────────────────────────────────────────────────────────────────┐
 * │ 🔐 SEGURANÇA                                                        │
 * └─────────────────────────────────────────────────────────────────────┘
 *
 * 🔒 Validações de frontend são de UX — a autoridade é o banco (RLS)
 *
 * ┌─────────────────────────────────────────────────────────────────────┐
 * │ 🔧 MANUTENÇÃO                                                       │
 * └─────────────────────────────────────────────────────────────────────┘
 *
 * ✅ Atualizar este cabeçalho quando a responsabilidade do arquivo mudar
 * ✅ Manter regras de negócio próximas da implementação
 * ✅ Registrar decisões arquiteturais relevantes em ADR
 *
 * ┌─────────────────────────────────────────────────────────────────────┐
 * │ 🔗 DOCUMENTAÇÃO RELACIONADA                                         │
 * └─────────────────────────────────────────────────────────────────────┘
 *
 * @see src/components/README.md
 * @see docs/architecture/MODULE_MAP.md
 * @see docs/code-standards/CODE_ANATOMY.md
 *
 * @updated 2026-08-02
 * @license Proprietary — SevenDevX
 * ═══════════════════════════════════════════════════════════════════════
 */

// ============================================================================
// 📦 IMPORTS
// ============================================================================

/**
 * 🔄 PWAUpdatePrompt v2 — SevenDevX Enterprise
 * ─────────────────────────────────────────────
 * Só aparece quando existe SW `waiting` de fato (nova versão pronta).
 * Aplica a atualização SOMENTE quando o usuário clica em "Atualizar".
 * Estilo monocromático glass, coerente com o instalador PWA.
 */
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, X, ArrowUpRight } from "lucide-react";

// ============================================================================
// 🧠 BUSINESS LOGIC
// ============================================================================

const isPreview = () => {
  try { if (window.self !== window.top) return true; } catch { return true; }
  const h = window.location.hostname;
  return (
    h.includes("id-preview--") ||
    h.includes("lovableproject.com") ||
    h.includes("lovable.app")
  );
};

// ============================================================================
// 🏗️ MAIN COMPONENT
// ============================================================================

const PWAUpdatePrompt = () => {
  const [show, setShow] = useState(false);
  const [waiting, setWaiting] = useState<ServiceWorker | null>(null);

  useEffect(() => {
    if (!("serviceWorker" in navigator)) return;
    if (isPreview()) return;

    let refreshing = false;
    const onControllerChange = () => {
      if (refreshing) return;
      refreshing = true;
      window.location.reload();
    };
    navigator.serviceWorker.addEventListener("controllerchange", onControllerChange);

    const attach = (reg: ServiceWorkerRegistration) => {
      // Só sinaliza update se existe SW controlando (não é a primeira instalação)
      const alreadyControlled = !!navigator.serviceWorker.controller;

      if (reg.waiting && alreadyControlled) {
        setWaiting(reg.waiting);
        setShow(true);
      }

      reg.addEventListener("updatefound", () => {
        const nw = reg.installing;
        if (!nw) return;
        nw.addEventListener("statechange", () => {
          if (nw.state === "installed" && navigator.serviceWorker.controller) {
            setWaiting(nw);
            setShow(true);
          }
        });
      });
    };

    navigator.serviceWorker.getRegistration().then((reg) => reg && attach(reg));

    return () => {
      navigator.serviceWorker.removeEventListener("controllerchange", onControllerChange);
    };
  }, []);

  const apply = () => {
    if (waiting) waiting.postMessage({ type: "SKIP_WAITING" });
    // Não fecha o card: aguardamos controllerchange → reload
  };

  const later = () => setShow(false);

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 12, scale: 0.98 }}
          transition={{ type: "spring", stiffness: 320, damping: 28 }}
          role="status"
          className="fixed z-[9999] w-[calc(100%-1.5rem)] max-w-[420px] left-0 right-0 mx-auto sm:left-auto sm:right-6 sm:mx-0"
          style={{ bottom: `calc(env(safe-area-inset-bottom) + 1.25rem)` }}
        >
          <div className="absolute -inset-[1px] rounded-[22px] bg-gradient-to-br from-white/25 via-white/5 to-white/20 opacity-60 blur-md pointer-events-none" />
          <div className="relative overflow-hidden rounded-[20px] border border-white/12 bg-[#050505]/95 backdrop-blur-2xl shadow-[0_30px_80px_-20px_rgba(0,0,0,0.9)]">
            <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/40 to-transparent" />

            <div className="relative p-5">
              <div className="flex items-start gap-3.5">
                <div className="relative shrink-0">
                  <div className="absolute inset-0 rounded-xl bg-emerald-400/10 blur-lg" />
                  <div className="relative w-11 h-11 rounded-xl border border-white/12 bg-gradient-to-br from-white/10 to-white/[0.02] flex items-center justify-center">
                    <Sparkles className="w-4 h-4 text-emerald-300" />
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[10px] uppercase tracking-[0.25em] text-emerald-300/80 font-semibold">
                    Nova versão · SevenDevX
                  </p>
                  <h3 className="mt-1 font-orbitron text-[15px] font-bold text-white leading-tight">
                    Atualização disponível
                  </h3>
                  <p className="mt-1 text-[12px] text-white/60 leading-relaxed">
                    Novos recursos, melhorias e correções prontos para instalar.
                  </p>
                </div>
                <button
                  onClick={later}
                  aria-label="Depois"
                  className="shrink-0 p-1.5 rounded-lg text-white/50 hover:text-white hover:bg-white/5 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="mt-4 flex gap-2.5">
                <button
                  onClick={apply}
                  className="flex-1 px-4 py-3 rounded-xl bg-white text-black text-[12px] font-bold uppercase tracking-[0.18em] hover:bg-white/90 transition-colors flex items-center justify-center gap-2"
                >
                  Atualizar agora
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={later}
                  className="px-4 py-3 rounded-xl border border-white/15 text-white/70 hover:text-white hover:bg-white/5 text-[12px] font-semibold uppercase tracking-[0.18em] transition-colors"
                >
                  Depois
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

// ============================================================================
// 📤 EXPORTS
// ============================================================================

export default PWAUpdatePrompt;
