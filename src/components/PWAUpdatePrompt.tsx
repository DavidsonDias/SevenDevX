/**
 * PWAUpdatePrompt — Detects SW updates via registration events (injectManifest compatible)
 */
import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Download, X } from 'lucide-react';

const PWAUpdatePrompt = () => {
  const [needRefresh, setNeedRefresh] = useState(false);
  const [waitingSW, setWaitingSW] = useState<ServiceWorker | null>(null);

  useEffect(() => {
    if (!('serviceWorker' in navigator)) return;

    // Don't run in iframe/preview
    try {
      if (window.self !== window.top) return;
    } catch { return; }
    if (
      window.location.hostname.includes('id-preview--') ||
      window.location.hostname.includes('lovableproject.com') ||
      window.location.hostname.includes('lovable.app')
    ) return;

    const handleRegistration = (registration: ServiceWorkerRegistration) => {
      // If there's already a waiting SW
      if (registration.waiting) {
        setWaitingSW(registration.waiting);
        setNeedRefresh(true);
      }

      // Listen for new SW installing
      registration.addEventListener('updatefound', () => {
        const newSW = registration.installing;
        if (!newSW) return;

        newSW.addEventListener('statechange', () => {
          if (newSW.state === 'installed' && navigator.serviceWorker.controller) {
            setWaitingSW(newSW);
            setNeedRefresh(true);
          }
        });
      });
    };

    // Check existing registration
    navigator.serviceWorker.getRegistration().then((reg) => {
      if (reg) handleRegistration(reg);
    });

    // Listen for controller change (another tab triggered skipWaiting)
    let refreshing = false;
    navigator.serviceWorker.addEventListener('controllerchange', () => {
      if (refreshing) return;
      refreshing = true;
      window.location.reload();
    });
  }, []);

  const close = () => setNeedRefresh(false);

  const update = () => {
    if (waitingSW) {
      waitingSW.postMessage({ type: 'SKIP_WAITING' });
    }
    setNeedRefresh(false);
  };

  return (
    <AnimatePresence>
      {needRefresh && (
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 50 }}
          className="fixed bottom-4 right-4 z-50 max-w-md"
        >
          <div className="bg-card text-card-foreground p-6 rounded-xl shadow-2xl border border-border/30 backdrop-blur-sm">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Download size={20} className="text-primary" />
                </div>
                <div>
                  <h3 className="font-bold text-base">Nova Versão Disponível</h3>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Atualize para aproveitar as melhorias
                  </p>
                </div>
              </div>
              <button
                onClick={close}
                className="text-muted-foreground hover:text-foreground transition-colors"
                aria-label="Fechar"
              >
                <X size={18} />
              </button>
            </div>
            
            <div className="flex space-x-3">
              <button
                onClick={update}
                className="flex-1 bg-primary text-primary-foreground px-4 py-2.5 rounded-lg text-sm font-semibold hover:opacity-90 transition-opacity"
              >
                Atualizar Agora
              </button>
              <button
                onClick={close}
                className="px-4 py-2.5 border border-border rounded-lg text-sm font-semibold hover:bg-muted/20 transition-colors"
              >
                Depois
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default PWAUpdatePrompt;