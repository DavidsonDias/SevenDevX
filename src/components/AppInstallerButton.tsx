/**
 * 📦 AppInstallerButton v3 — SevenDevX Enterprise
 * ─────────────────────────────────────────────────
 * Card premium monocromático (glass + hairline + ring gradient),
 * copy SevenDevX, contador discreto, corner-dock em desktop, safe-area em mobile.
 * API pública preservada: <AppInstallerButton />.
 */
import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ArrowUpRight, Share, PlusSquare } from "lucide-react";
import logoSevenDevX from "@/assets/logo.svg";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

const KEYS = {
  DISMISSED: "sdx_pwa_dismissed_v3",
  INSTALLED: "sdx_pwa_installed_v3",
  LAST: "sdx_pwa_last_v3",
};
const COOLDOWN_MS = 24 * 60 * 60 * 1000;
const SCROLL_TRIGGER = 60;
const SHOW_DELAY = 2200;
const AUTO_HIDE = 9000;

const store = {
  get: (k: string) => { try { return localStorage.getItem(k) ?? sessionStorage.getItem(k); } catch { return null; } },
  set: (k: string, v: string) => { try { localStorage.setItem(k, v); } catch { try { sessionStorage.setItem(k, v); } catch {} } },
};

const isIOS = () => /iphone|ipad|ipod/i.test(navigator.userAgent);
const isStandalone = () =>
  window.matchMedia("(display-mode: standalone)").matches ||
  (navigator as any).standalone === true;
const isWebView = () => {
  const ua = navigator.userAgent.toLowerCase();
  return /instagram|fbav|facebook|twitter|tiktok|wechat|pinterest|linkedin/.test(ua);
};
const isPreview = () => {
  try { if (window.self !== window.top) return true; } catch { return true; }
  const h = window.location.hostname;
  return h.includes("id-preview--") || h.includes("lovableproject.com") || h.includes("lovable.app");
};

export default function AppInstallerButton() {
  const [prompt, setPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [open, setOpen] = useState(false);
  const [dock, setDock] = useState(false);
  const [installed, setInstalled] = useState(false);
  const [countdown, setCountdown] = useState(Math.round(AUTO_HIDE / 1000));
  const armed = useRef(false);
  const timers = useRef<number[]>([]);

  const clearTimers = () => { timers.current.forEach(clearTimeout); timers.current = []; };

  useEffect(() => {
    if (isPreview() || isWebView()) return;
    if (isStandalone() || store.get(KEYS.INSTALLED) === "1") { setInstalled(true); return; }

    const last = Number(store.get(KEYS.LAST) || 0);
    if (Date.now() - last < COOLDOWN_MS && store.get(KEYS.DISMISSED) === "1") return;

    const onBIP = (e: Event) => { e.preventDefault(); setPrompt(e as BeforeInstallPromptEvent); };
    const onInstalled = () => { setInstalled(true); setOpen(false); setDock(false); store.set(KEYS.INSTALLED, "1"); };

    window.addEventListener("beforeinstallprompt", onBIP);
    window.addEventListener("appinstalled", onInstalled);

    const trigger = () => {
      if (armed.current) return;
      if (window.scrollY < SCROLL_TRIGGER) return;
      armed.current = true;
      window.removeEventListener("scroll", trigger);

      const isDesktop = window.innerWidth >= 900;
      timers.current.push(window.setTimeout(() => {
        if (isDesktop && prompt) { setDock(true); }
        else { setOpen(true); store.set(KEYS.LAST, String(Date.now())); }
      }, SHOW_DELAY));
    };
    window.addEventListener("scroll", trigger, { passive: true });
    // Fallback: se ninguém rolar
    timers.current.push(window.setTimeout(trigger, 12000));

    return () => {
      window.removeEventListener("scroll", trigger);
      window.removeEventListener("beforeinstallprompt", onBIP);
      window.removeEventListener("appinstalled", onInstalled);
      clearTimers();
    };
  }, [prompt]);

  // countdown enquanto o card estiver aberto
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

  const dismiss = () => {
    setOpen(false); setDock(false);
    store.set(KEYS.DISMISSED, "1");
    store.set(KEYS.LAST, String(Date.now()));
  };

  if (installed || isPreview()) return null;

  const iosMode = isIOS() && !prompt;

  return (
    <>
      {/* ─── Corner Dock (desktop) ─────────────────────────────── */}
      <AnimatePresence>
        {dock && !open && (
          <motion.button
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.9 }}
            transition={{ type: "spring", stiffness: 300, damping: 26 }}
            onClick={() => { setOpen(true); setDock(false); }}
            className="fixed bottom-6 left-6 z-[9998] group"
            aria-label="Instalar SevenDevX"
          >
            <span className="absolute inset-0 rounded-2xl bg-gradient-to-br from-white/20 via-white/5 to-transparent blur-xl opacity-70 group-hover:opacity-100 transition-opacity" />
            <span className="relative flex items-center gap-2.5 px-4 py-3 rounded-2xl bg-black/80 backdrop-blur-xl border border-white/15 text-white text-xs uppercase tracking-[0.18em] font-semibold shadow-2xl hover:bg-white hover:text-black transition-colors">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Instalar app
              <ArrowUpRight className="w-3.5 h-3.5" />
            </span>
          </motion.button>
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
            {/* halo */}
            <div className="absolute -inset-[1px] rounded-[22px] bg-gradient-to-br from-white/25 via-white/5 to-white/20 opacity-60 blur-md pointer-events-none" />
            {/* card */}
            <div className="relative overflow-hidden rounded-[20px] border border-white/12 bg-[#050505]/95 backdrop-blur-2xl shadow-[0_30px_80px_-20px_rgba(0,0,0,0.9)]">
              {/* ring gradient hairline */}
              <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/40 to-transparent" />
              {/* scanline sutil */}
              <div className="absolute inset-0 opacity-[0.03] pointer-events-none [background-image:linear-gradient(0deg,rgba(255,255,255,0.5)_1px,transparent_1px)] [background-size:100%_3px]" />

              <div className="relative p-5 sm:p-6">
                <div className="flex items-start gap-4">
                  {/* Logo mark */}
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
                    onClick={dismiss}
                    aria-label="Dispensar"
                    className="shrink-0 p-1.5 rounded-lg text-white/50 hover:text-white hover:bg-white/5 transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {/* iOS steps */}
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
                      onClick={dismiss}
                      className="px-4 py-3 rounded-xl border border-white/15 text-white/70 hover:text-white hover:bg-white/5 text-[12px] font-semibold uppercase tracking-[0.18em] transition-colors"
                    >
                      Depois
                    </button>
                  </div>
                )}

                {/* progress + countdown */}
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
