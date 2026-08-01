/**
 * AppInstallerButton.tsx — SevenDevX
 * ─────────────────────────────────────────────────────────────────────
 * @file src/components/AppInstallerButton.tsx
 * @module UI
 *
 * @description
 * Convite de instalação do PWA; só aparece quando o app ainda não está instalado e o navegador expõe o evento de instalação.
 *
 * @see src/components/README.md
 * ─────────────────────────────────────────────────────────────────────
 */

// ============================================================================
// 📦 IMPORTS
// ============================================================================

/**
 * 📦 AppInstallerButton v4 — SevenDevX Enterprise
 * ─────────────────────────────────────────────────
 * - Detecta instalação de forma confiável (display-mode, navigator.standalone,
 *   getInstalledRelatedApps, flag persistente) — nunca mostra em app já instalado.
 * - Corner-dock discreto (canto inferior esquerdo) em TODAS as telas (mobile, tablet,
 *   desktop) enquanto o app não estiver instalado.
 * - Card premium abre ao clicar no dock ou automaticamente após scroll (uma vez por dia).
 */
import { useEffect, useRef, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ArrowUpRight, Share, PlusSquare, Download } from "lucide-react";
import logoSevenDevX from "@/assets/logo.svg";

// ============================================================================
// 🧩 TYPES & CONTRACTS
// ============================================================================

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

// ============================================================================
// ⚙️ CONSTANTS & CONFIGURATION
// ============================================================================

const KEYS = {
  DISMISSED: "sdx_pwa_dismissed_v4",
  INSTALLED: "sdx_pwa_installed_v4",
  LAST: "sdx_pwa_last_v4",
};
const COOLDOWN_MS = 24 * 60 * 60 * 1000;
const SCROLL_TRIGGER = 60;
const SHOW_DELAY = 2200;
const AUTO_HIDE = 9000;

const store = {
  get: (k: string) => { try { return localStorage.getItem(k) ?? sessionStorage.getItem(k); } catch { return null; } },
  set: (k: string, v: string) => { try { localStorage.setItem(k, v); } catch { try { sessionStorage.setItem(k, v); } catch {} } },
};

// ============================================================================
// 🧠 BUSINESS LOGIC
// ============================================================================

const isIOS = () => /iphone|ipad|ipod/i.test(navigator.userAgent);
const isStandalone = () =>
  window.matchMedia?.("(display-mode: standalone)").matches ||
  window.matchMedia?.("(display-mode: fullscreen)").matches ||
  window.matchMedia?.("(display-mode: minimal-ui)").matches ||
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (navigator as any).standalone === true ||
  document.referrer.startsWith("android-app://");
const isWebView = () => {
  const ua = navigator.userAgent.toLowerCase();
  return /instagram|fbav|facebook|twitter|tiktok|wechat|pinterest|linkedin/.test(ua);
};
const isPreview = () => {
  try { if (window.self !== window.top) return true; } catch { return true; }
  const h = window.location.hostname;
  return h.includes("id-preview--") || h.includes("lovableproject.com") || h.includes("lovable.app");
};

// ============================================================================
// 🏗️ MAIN COMPONENT
// ============================================================================

export default function AppInstallerButton() {
  const [prompt, setPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [open, setOpen] = useState(false);
  const [dock, setDock] = useState(false);
  const [installed, setInstalled] = useState(false);
  const [countdown, setCountdown] = useState(Math.round(AUTO_HIDE / 1000));
  const autoOpened = useRef(false);
  const timers = useRef<number[]>([]);

  const clearTimers = () => { timers.current.forEach(clearTimeout); timers.current = []; };

  // Robust install detection (initial + async related-apps)
  const checkInstalled = useCallback(async () => {
    if (isStandalone() || store.get(KEYS.INSTALLED) === "1") return true;
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const nav = navigator as any;
      if (typeof nav.getInstalledRelatedApps === "function") {
        const apps = await nav.getInstalledRelatedApps();
        if (Array.isArray(apps) && apps.length > 0) {
          store.set(KEYS.INSTALLED, "1");
          return true;
        }
      }
    } catch { /* noop */ }
    return false;
  }, []);

  useEffect(() => {
    if (isPreview() || isWebView()) return;

    let cancelled = false;
    (async () => {
      const inst = await checkInstalled();
      if (cancelled) return;
      if (inst) { setInstalled(true); return; }

      const onBIP = (e: Event) => { e.preventDefault(); setPrompt(e as BeforeInstallPromptEvent); };
      const onInstalled = () => {
        setInstalled(true); setOpen(false); setDock(false);
        store.set(KEYS.INSTALLED, "1");
      };
      const onDisplayChange = (ev: MediaQueryListEvent) => {
        if (ev.matches) { setInstalled(true); store.set(KEYS.INSTALLED, "1"); }
      };

      window.addEventListener("beforeinstallprompt", onBIP);
      window.addEventListener("appinstalled", onInstalled);
      const mql = window.matchMedia("(display-mode: standalone)");
      mql.addEventListener?.("change", onDisplayChange);

      // Corner-dock: mostra sempre (mobile/tablet/desktop) após pequeno scroll
      const showDock = () => { if (!isStandalone()) setDock(true); };
      timers.current.push(window.setTimeout(showDock, 1800));
      const onScroll = () => { if (window.scrollY > 20) showDock(); };
      window.addEventListener("scroll", onScroll, { passive: true });

      // Auto-open card uma única vez por cooldown, após scroll significativo
      const maybeAutoOpen = () => {
        if (autoOpened.current) return;
        if (window.scrollY < SCROLL_TRIGGER) return;
        const last = Number(store.get(KEYS.LAST) || 0);
        if (Date.now() - last < COOLDOWN_MS && store.get(KEYS.DISMISSED) === "1") return;
        autoOpened.current = true;
        window.removeEventListener("scroll", maybeAutoOpen);
        timers.current.push(window.setTimeout(() => {
          setOpen(true);
          store.set(KEYS.LAST, String(Date.now()));
        }, SHOW_DELAY));
      };
      window.addEventListener("scroll", maybeAutoOpen, { passive: true });

      return () => {
        cancelled = true;
        window.removeEventListener("beforeinstallprompt", onBIP);
        window.removeEventListener("appinstalled", onInstalled);
        window.removeEventListener("scroll", onScroll);
        window.removeEventListener("scroll", maybeAutoOpen);
        mql.removeEventListener?.("change", onDisplayChange);
        clearTimers();
      };
    })();

    return () => { cancelled = true; clearTimers(); };
  }, [checkInstalled]);

  // Countdown enquanto o card estiver aberto
  useEffect(() => {
    if (!open) return;
    setCountdown(Math.round(AUTO_HIDE / 1000));
    const start = Date.now();
    const tick = window.setInterval(() => {
      const left = Math.max(0, Math.round((AUTO_HIDE - (Date.now() - start)) / 1000));
      setCountdown(left);
      if (left <= 0) { setOpen(false); clearInterval(tick); }
    }, 500);
    return () => clearInterval(tick);
  }, [open]);

  const install = async () => {
    if (!prompt) { setOpen(true); return; }
    try {
      await prompt.prompt();
      const { outcome } = await prompt.userChoice;
      if (outcome === "accepted") { setInstalled(true); store.set(KEYS.INSTALLED, "1"); }
      else { store.set(KEYS.DISMISSED, "1"); store.set(KEYS.LAST, String(Date.now())); }
    } catch {}
    setPrompt(null);
    setOpen(false); setDock(false);
  };

  const dismissCard = () => {
    setOpen(false);
    store.set(KEYS.DISMISSED, "1");
    store.set(KEYS.LAST, String(Date.now()));
  };

  const dismissDock = () => { setDock(false); store.set(KEYS.DISMISSED, "1"); };

  if (installed || isPreview()) return null;

  const iosMode = isIOS() && !prompt;

  return (
    <>
      {/* ─── Corner Dock (mobile + tablet + desktop, canto inferior esquerdo) ─ */}
      <AnimatePresence>
        {dock && !open && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.9 }}
            transition={{ type: "spring", stiffness: 300, damping: 26 }}
            className="fixed z-[9998] flex items-center gap-1"
            style={{
              left: `calc(env(safe-area-inset-left) + 1rem)`,
              bottom: `calc(env(safe-area-inset-bottom) + 1rem)`,
            }}
          >
            <button
              onClick={() => setOpen(true)}
              aria-label="Instalar SevenDevX"
              className="group relative"
            >
              <span className="absolute inset-0 rounded-2xl bg-gradient-to-br from-white/25 via-white/5 to-transparent blur-xl opacity-70 group-hover:opacity-100 transition-opacity" />
              <span className="relative flex items-center gap-2 px-3.5 py-2.5 rounded-2xl bg-black/85 backdrop-blur-xl border border-white/15 text-white text-[11px] uppercase tracking-[0.18em] font-semibold shadow-2xl hover:bg-white hover:text-black transition-colors">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <Download className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Instalar app</span>
              </span>
            </button>
            <button
              onClick={dismissDock}
              aria-label="Ocultar"
              className="w-6 h-6 rounded-full bg-black/70 border border-white/10 text-white/50 hover:text-white flex items-center justify-center"
            >
              <X className="w-3 h-3" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ─── Card premium (mobile + fallback) ──────────────────── */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 24, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12, scale: 0.98 }}
            transition={{ type: "spring", stiffness: 320, damping: 28 }}
            role="dialog"
            aria-live="polite"
            className="fixed left-0 right-0 mx-auto z-[9999] w-[calc(100%-1.5rem)] max-w-[440px]"
            style={{ bottom: `calc(env(safe-area-inset-bottom) + 1.25rem)` }}
          >
            <div className="absolute -inset-[1px] rounded-[22px] bg-gradient-to-br from-white/25 via-white/5 to-white/20 opacity-60 blur-md pointer-events-none" />
            <div className="relative overflow-hidden rounded-[20px] border border-white/12 bg-[#050505]/95 backdrop-blur-2xl shadow-[0_30px_80px_-20px_rgba(0,0,0,0.9)]">
              <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/40 to-transparent" />
              <div className="absolute inset-0 opacity-[0.03] pointer-events-none [background-image:linear-gradient(0deg,rgba(255,255,255,0.5)_1px,transparent_1px)] [background-size:100%_3px]" />

              <div className="relative p-5 sm:p-6">
                <div className="flex items-start gap-4">
                  <div className="relative shrink-0">
                    <div className="absolute inset-0 rounded-xl bg-white/10 blur-lg" />
                    <div className="relative w-12 h-12 rounded-xl border border-white/15 bg-gradient-to-br from-white/10 to-white/[0.02] flex items-center justify-center overflow-hidden">
                      <img src={logoSevenDevX} alt="SevenDevX" className="w-8 h-8 object-contain" />
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[10px] uppercase tracking-[0.25em] text-white/45 font-semibold">
                      SevenDevX · Progressive App
                    </p>
                    <h3 className="mt-1 font-orbitron text-[15px] sm:text-base font-bold text-white leading-tight">
                      Instale a experiência completa
                    </h3>
                    <p className="mt-1.5 text-[12px] text-white/60 leading-relaxed">
                      {iosMode
                        ? "Acesso offline, notificações e velocidade nativa direto da sua tela inicial."
                        : "Modo offline, atualizações silenciosas e ícone na sua tela — em segundos."}
                    </p>
                  </div>
                  <button
                    onClick={dismissCard}
                    aria-label="Dispensar"
                    className="shrink-0 p-1.5 rounded-lg text-white/50 hover:text-white hover:bg-white/5 transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {iosMode ? (
                  <div className="mt-4 rounded-xl border border-white/10 bg-white/[0.03] p-3 space-y-2">
                    <div className="flex items-center gap-2.5 text-[12px] text-white/80">
                      <span className="w-6 h-6 rounded-md bg-white/10 border border-white/10 flex items-center justify-center">
                        <Share className="w-3.5 h-3.5" />
                      </span>
                      Toque no ícone <b className="font-semibold">Compartilhar</b>
                    </div>
                    <div className="flex items-center gap-2.5 text-[12px] text-white/80">
                      <span className="w-6 h-6 rounded-md bg-white/10 border border-white/10 flex items-center justify-center">
                        <PlusSquare className="w-3.5 h-3.5" />
                      </span>
                      Escolha <b className="font-semibold">Adicionar à Tela de Início</b>
                    </div>
                  </div>
                ) : (
                  <div className="mt-4 flex gap-2.5">
                    <button
                      onClick={install}
                      className="flex-1 relative overflow-hidden group px-4 py-3 rounded-xl bg-white text-black text-[12px] font-bold uppercase tracking-[0.18em] hover:bg-white/90 transition-colors"
                    >
                      <span className="relative flex items-center justify-center gap-2">
                        Instalar agora
                        <ArrowUpRight className="w-3.5 h-3.5" />
                      </span>
                    </button>
                    <button
                      onClick={dismissCard}
                      className="px-4 py-3 rounded-xl border border-white/15 text-white/70 hover:text-white hover:bg-white/5 text-[12px] font-semibold uppercase tracking-[0.18em] transition-colors"
                    >
                      Depois
                    </button>
                  </div>
                )}

                <div className="mt-4 flex items-center justify-between text-[10px] uppercase tracking-[0.25em] text-white/35">
                  <span>Fecha em {countdown}s</span>
                  <span>#instalar</span>
                </div>
                <div className="mt-1.5 h-[2px] w-full rounded-full bg-white/8 overflow-hidden">
                  <motion.div
                    key={countdown}
                    initial={{ width: `${((countdown + 1) / (AUTO_HIDE / 1000)) * 100}%` }}
                    animate={{ width: `${(countdown / (AUTO_HIDE / 1000)) * 100}%` }}
                    transition={{ duration: 0.5, ease: "linear" }}
                    className="h-full bg-gradient-to-r from-white/40 via-white to-white/40"
                  />
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
