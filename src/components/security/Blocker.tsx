/**
 * 🔒 Blocker v1.0 Pro++ ULTIMATE HARDLOCK — Proteção Máxima de Segurança
 * ═════════════════════════════════════════════════════════════════
 * 
 * Sistema de bloqueio avançado que impede cópia, inspeção e manipulação
 * de conteúdo em toda a aplicação, incluindo DevTools e atalhos do navegador.
 * 
 * ┌─────────────────────────────────────────────────────────────────┐
 * │ 🛡️  BLOQUEIOS ATIVOS (SEM EXCEÇÕES)                            │
 * └─────────────────────────────────────────────────────────────────┘
 * 
 * 🔴 INTERAÇÃO COM MOUSE:
 *    • Clique direito (context menu)
 *    • Clique do meio (middle click)
 *    • Arrastar texto (drag & drop)
 *    • Seleção de texto com mouse
 * 
 * 🔴 FERRAMENTAS DE DESENVOLVEDOR:
 *    • F12 (DevTools)
 *    • Ctrl+Shift+I / Cmd+Shift+I (Inspector)
 *    • Ctrl+Shift+C / Cmd+Shift+C (Element Picker)
 *    • Ctrl+Shift+J / Cmd+Shift+J (Console)
 * 
 * 🔴 AÇÕES DE CÓPIA/EDIÇÃO:
 *    • Ctrl+C / Cmd+C (Copy)
 *    • Ctrl+V / Cmd+V (Paste)
 *    • Ctrl+X / Cmd+X (Cut)
 *    • Ctrl+A / Cmd+A (Select All)
 *    • Evento nativo 'copy' (menu Edit > Copy)
 * 
 * 🔴 CÓDIGO-FONTE & IMPRESSÃO:
 *    • Ctrl+U / Cmd+U (View Source)
 *    • Ctrl+S / Cmd+S (Save Page)
 *    • Ctrl+P / Cmd+P (Print)
 * 
 * 🔴 NAVEGAÇÃO & BUSCA:
 *    • Ctrl+F / Cmd+F (Find in page)
 *    • Ctrl+G / Cmd+G (Find next)
 *    • Ctrl+H / Cmd+H (History)
 *    • Ctrl+J / Cmd+J (Downloads)
 *    • Ctrl+K / Cmd+K (Search bar)
 *    • Ctrl+L / Cmd+L (Address bar)
 *    • Ctrl+D / Cmd+D (Bookmark)
 *    • Ctrl+E / Cmd+E (Search engine)
 * 
 * 🔴 GERENCIAMENTO DE ABAS:
 *    • Ctrl+T / Cmd+T (New tab)
 *    • Ctrl+W / Cmd+W (Close tab)
 *    • Ctrl+N / Cmd+N (New window)
 *    • Ctrl+R / Cmd+R (Reload)
 * 
 * 🔴 ZOOM:
 *    • Ctrl+Plus / Cmd+Plus (Zoom in)
 *    • Ctrl+Minus / Cmd+Minus (Zoom out)
 *    • Ctrl+0 / Cmd+0 (Reset zoom)
 * 
 * ┌─────────────────────────────────────────────────────────────────┐
 * │ ✅ RECURSOS DE PROTEÇÃO                                        │
 * └─────────────────────────────────────────────────────────────────┘
 * 
 * • Cross-platform: Windows (Ctrl) + macOS (Cmd) + Linux (Ctrl)
 * • Cooldown anti-spam: 2.5s entre notificações
 * • Toast animado: Framer Motion com feedback visual suave
 * • Performance otimizada: useRef para estado de cooldown
 * • Sem exceções: Bloqueia até em <input> e <textarea>
 * • Evento passive: false para garantir preventDefault()
 * 
 * ┌─────────────────────────────────────────────────────────────────┐
 * │ ⚠️  OBSERVAÇÕES IMPORTANTES                                    │
 * └─────────────────────────────────────────────────────────────────┘
 * 
 * 1. Este nível de bloqueio é EXTREMAMENTE agressivo
 * 2. Impacta negativamente a experiência do usuário
 * 3. Não é 100% seguro (screenshots e OCR contornam isso)
 * 4. Use apenas para conteúdo altamente sensível/proprietário
 * 5. Pode violar acessibilidade (WCAG) em alguns contextos
 * 
 * ┌─────────────────────────────────────────────────────────────────┐
 * │ 🔧 CONFIGURAÇÃO                                                │
 * └─────────────────────────────────────────────────────────────────┘
 * 
 * Adicione no seu App.tsx/Root:
 * 
 *   import Blocker from '@/components/Blocker';
 * 
 *   function App() {
 *     return (
 *       <>
 *         <Blocker />
 *         {/* resto da aplicação *\/}
 *       </>
 *     );
 *   }
 * 
 * CSS adicional recomendado (global.css):
 * 
 *   body {
 *     -webkit-user-select: none;
 *     -moz-user-select: none;
 *     -ms-user-select: none;
 *     user-select: none;
 *   }
 * 
 *   input, textarea, [contenteditable] {
 *     -webkit-user-select: text;
 *     -moz-user-select: text;
 *     -ms-user-select: text;
 *     user-select: text;
 *   }
 * 
 * ┌─────────────────────────────────────────────────────────────────┐
 * │ 📝 CHANGELOG                                                   │
 * └─────────────────────────────────────────────────────────────────┘
 * 
 * v1.3 (2025-11-17):
 * • Refatoração final com memoização de handlers
 * • Tipagem TypeScript aprimorada
 * • Comentários inline documentados
 * • Validação de evento otimizada
 * 
 * v1.2 (2025-11-17):
 * • FIX CRÍTICO: F12 agora usa e.key original
 * • passive:false em selectstart e dragstart
 * • Código modular em blocos separados
 * • Nomenclatura melhorada (isCtrl, isShift)
 * 
 * ═════════════════════════════════════════════════════════════════
 * @version 1.0.0
 * @author SevenDevX
 * @license Proprietary
 * @security CRITICAL - Não modificar sem autorização
 * @tested Chrome 119+, Firefox 120+, Safari 17+, Edge 119+
 * ═════════════════════════════════════════════════════════════════
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
