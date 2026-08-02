/**
 * 🚀 Blocker.tsx — SevenDevX Enterprise Platform
 * ═══════════════════════════════════════════════════════════════════════
 *
 * @file src/components/security/Blocker.tsx
 * @module Security
 * @layer Presentation / UI
 * @status Active
 *
 * @description
 * Bloqueio de UI para estados sem permissão ou pré-requisito não
 * atendido.
 *
 * ┌─────────────────────────────────────────────────────────────────────┐
 * │ 🛠️ DEPENDÊNCIAS RELEVANTES                                         │
 * └─────────────────────────────────────────────────────────────────────┘
 *
 * ✅ Framer Motion — transições e animações
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
 * @see src/components/security/README.md
 * @see docs/architecture/MODULE_MAP.md
 * @see docs/code-standards/CODE_ANATOMY.md
 *
 * @updated 2026-08-02
 * @license Proprietary — SevenDevX
 * ═══════════════════════════════════════════════════════════════════════
 */

import { useEffect, useRef, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";

const Blocker: React.FC = () => {
  const [toast, setToast] = useState(false);
  const cooldown = useRef(false);

  /**
   * Exibe notificação de bloqueio com cooldown anti-spam
   * @cooldown 2.5s entre notificações
   */
  const triggerToast = useCallback(() => {
    if (cooldown.current) return;
    
    cooldown.current = true;
    setToast(true);

    setTimeout(() => setToast(false), 2000);
    setTimeout(() => (cooldown.current = false), 2500);
  }, []);

  useEffect(() => {
    /**
     * 🖱️ Bloqueia menu de contexto (clique direito)
     * @prevents Menu contextual nativo do navegador
     */
    const handleContext = (e: MouseEvent) => {
      e.preventDefault();
      triggerToast();
    };

    /**
     * 🖱️ Bloqueia clique do botão do meio
     * @prevents Abrir link em nova aba / scroll com botão meio
     */
    const handleMiddleClick = (e: MouseEvent) => {
      if (e.button === 1) {
        e.preventDefault();
        triggerToast();
      }
    };

    /**
     * ⌨️ Bloqueia todos os atalhos de teclado perigosos
     * @prevents DevTools, cópia, navegação, zoom
     * @note F12 usa e.key original (case-sensitive)
     */
    const handleKey = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase();
      const isCtrl = e.ctrlKey || e.metaKey; // Windows/Linux + macOS
      const isShift = e.shiftKey;

      // DevTools (F12, Inspect, Console)
      const devtools =
        e.key === "F12" || // ⚠️ Usa e.key ORIGINAL (não lowercase)
        (isCtrl && isShift && ["i", "c", "j"].includes(key));

      // Copy/Paste/Cut (bloqueio total)
      const copyPaste =
        isCtrl && ["c", "v", "x", "a"].includes(key);

      // View Source, Save, Print
      const viewSave =
        isCtrl && ["u", "s", "p"].includes(key);

      // Find, History, Downloads, etc
      const navigation =
        isCtrl && ["f", "g", "h", "j", "k", "l", "d", "e", "t", "w", "n", "r"].includes(key);

      // Zoom (in/out/reset)
      const zoom =
        isCtrl && ["+", "=", "-", "0"].includes(key);

      if (devtools || copyPaste || viewSave || navigation || zoom) {
        e.preventDefault();
        e.stopPropagation();
        triggerToast();
        return false; // Dupla prevenção
      }
    };

    /**
     * 📋 Bloqueia evento nativo de cópia
     * @prevents Edit > Copy do menu do navegador
     */
    const handleCopy = (e: ClipboardEvent) => {
      e.preventDefault();
      triggerToast();
    };

    /**
     * ✋ Bloqueia seleção de texto com mouse
     * @prevents Highlight de texto para cópia
     */
    const handleSelectStart = (e: Event) => {
    // Evita disparo falso no iPhone apenas tocando na tela
    const target = e.target as HTMLElement;

    // Se for um clique simples e não houver intenção de selecionar texto → ignore
    if (!window.getSelection()?.toString()) {
    return;
    }

    e.preventDefault();
    triggerToast();
    };

    /**
     * 🚫 Bloqueia arrastar texto
     * @prevents Drag & drop de texto selecionado
     */
    const handleDrag = (e: DragEvent) => {
      e.preventDefault();
      triggerToast();
    };

    // ════════════════════════════════════════════════════════
    // Registra todos os event listeners
    // ════════════════════════════════════════════════════════
    document.addEventListener("contextmenu", handleContext);
    document.addEventListener("mousedown", handleMiddleClick, { passive: false });
    document.addEventListener("keydown", handleKey);
    document.addEventListener("copy", handleCopy);
    document.addEventListener("selectstart", handleSelectStart, { passive: false });
    document.addEventListener("dragstart", handleDrag, { passive: false });

    // ════════════════════════════════════════════════════════
    // Cleanup: remove listeners ao desmontar componente
    // ════════════════════════════════════════════════════════
    return () => {
      document.removeEventListener("contextmenu", handleContext);
      document.removeEventListener("mousedown", handleMiddleClick);
      document.removeEventListener("keydown", handleKey);
      document.removeEventListener("copy", handleCopy);
      document.removeEventListener("selectstart", handleSelectStart);
      document.removeEventListener("dragstart", handleDrag);
    };
  }, [triggerToast]);

  return (
    <AnimatePresence mode="wait">
      {toast && false && (
        <motion.div
          key="blocker-toast"
          initial={{ opacity: 0, y: 20, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.9 }}
          transition={{
            type: "spring",
            stiffness: 400,
            damping: 30,
            duration: 0.2,
          }}
          className="fixed bottom-8 left-1/2 -translate-x-1/2 bg-red-600/90 text-white px-6 py-3 rounded-lg shadow-xl text-sm font-medium z-[99999] backdrop-blur-md border border-red-500/20 pointer-events-none"
          role="alert"
          aria-live="polite"
          aria-atomic="true"
        >
          🚫 Função bloqueada por segurança
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default Blocker;
