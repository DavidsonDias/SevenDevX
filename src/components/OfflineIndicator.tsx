/**
 * 📡 OfflineIndicator — Banner de conexão + toast de reconexão
 * Detecta online/offline, mostra estado do SW e contagem de mutations
 * em fila aguardando sincronização (background sync).
 */
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { WifiOff, Wifi, CloudOff, RefreshCw } from "lucide-react";
import { getQueueSize, flushQueue, subscribeQueue } from "@/utils/offlineQueue";

export default function OfflineIndicator() {
  const [online, setOnline] = useState(navigator.onLine);
  const [justReconnected, setJustReconnected] = useState(false);
  const [queueSize, setQueueSize] = useState(0);
  const [flushing, setFlushing] = useState(false);

  useEffect(() => {
    const onOnline = async () => {
      setOnline(true);
      setJustReconnected(true);
      setFlushing(true);
      await flushQueue();
      setFlushing(false);
      setTimeout(() => setJustReconnected(false), 3500);
    };
    const onOffline = () => {
      setOnline(false);
      setJustReconnected(false);
    };
    window.addEventListener("online", onOnline);
    window.addEventListener("offline", onOffline);
    getQueueSize().then(setQueueSize);
    const unsub = subscribeQueue(setQueueSize);

    const onSwMessage = (e: MessageEvent) => {
      if (e.data?.type === "FLUSH_OFFLINE_QUEUE") {
        flushQueue().then(() => getQueueSize().then(setQueueSize));
      }
    };
    navigator.serviceWorker?.addEventListener("message", onSwMessage);

    return () => {
      window.removeEventListener("online", onOnline);
      window.removeEventListener("offline", onOffline);
      navigator.serviceWorker?.removeEventListener("message", onSwMessage);
      unsub();
    };
  }, []);

  return (
    <AnimatePresence>
      {!online && (
        <motion.div
          key="offline-banner"
          initial={{ y: -60, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -60, opacity: 0 }}
          transition={{ type: "spring", stiffness: 220, damping: 24 }}
          className="fixed top-0 inset-x-0 z-[9999] pointer-events-none flex justify-center pt-2 px-3"
        >
          <div className="pointer-events-auto flex items-center gap-2 px-4 py-2 rounded-full bg-yellow-500/95 text-black text-xs font-bold uppercase tracking-wider shadow-2xl backdrop-blur-sm border border-yellow-300">
            <WifiOff size={14} />
            <span>Modo Offline</span>
            {queueSize > 0 && (
              <span className="ml-1 px-2 py-0.5 rounded-full bg-black/20 text-[10px]">
                <CloudOff size={10} className="inline mr-1" />
                {queueSize} pendente{queueSize > 1 ? "s" : ""}
              </span>
            )}
          </div>
        </motion.div>
      )}

      {online && justReconnected && (
        <motion.div
          key="online-toast"
          initial={{ y: -60, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -60, opacity: 0 }}
          transition={{ type: "spring", stiffness: 220, damping: 24 }}
          className="fixed top-0 inset-x-0 z-[9999] pointer-events-none flex justify-center pt-2 px-3"
        >
          <div className="pointer-events-auto flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/95 text-black text-xs font-bold uppercase tracking-wider shadow-2xl backdrop-blur-sm border border-emerald-300">
            {flushing ? <RefreshCw size={14} className="animate-spin" /> : <Wifi size={14} />}
            <span>{flushing ? "Sincronizando…" : "Online de novo"}</span>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
