// src/components/PWAUpdatePrompt.tsx
import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Download, X } from 'lucide-react';

const PWAUpdatePrompt = () => {
  const [needRefresh, setNeedRefresh] = useState(false);

  useEffect(() => {
    const wb = (window as any).workbox;
    if (wb) {
      wb.addEventListener('waiting', () => {
        setNeedRefresh(true);
      });
    }
  }, []);

  const close = () => {
    setNeedRefresh(false);
  };

  const update = () => {
    const wb = (window as any).workbox;
    if (wb) {
      wb.messageSkipWaiting();
      setNeedRefresh(false);
      window.location.reload();
    }
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
          <div className="bg-white text-black p-6 rounded-lg shadow-2xl border-2 border-black">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center space-x-3">
                <Download size={24} />
                <div>
                  <h3 className="font-bold text-lg">Nova Versão Disponível</h3>
                  <p className="text-sm text-black/60 mt-1">
                    Atualize para aproveitar as melhorias
                  </p>
                </div>
              </div>
              <button
                onClick={close}
                className="text-black/60 hover:text-black transition-colors"
              >
                <X size={20} />
              </button>
            </div>
            
            <div className="flex space-x-3">
              <button
                onClick={update}
                className="flex-1 bg-black text-white px-4 py-2 rounded font-semibold hover:bg-black/90 transition-colors"
              >
                Atualizar Agora
              </button>
              <button
                onClick={close}
                className="px-4 py-2 border-2 border-black rounded font-semibold hover:bg-black/5 transition-colors"
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
