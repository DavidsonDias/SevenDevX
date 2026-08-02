/**
 * 🧩 OrcamentoButton.tsx — SevenDevX
 * ─────────────────────────────────────────────────────────────────────
 *
 * @file src/components/OrcamentoButton.tsx
 * @module UI
 * @layer Presentation / UI
 * @status Active
 *
 * @description
 * Gatilho flutuante do fluxo de orçamento.
 *
 * ┌─────────────────────────────────────────────────────────────────────┐
 * │ ✅ RESPONSABILIDADES PRINCIPAIS                                      │
 * └─────────────────────────────────────────────────────────────────────┘
 *
 * ✅ Compõe blocos de UI importados de `@/components` e `@/modules`
 *
 * ┌─────────────────────────────────────────────────────────────────────┐
 * │ 🛠️ DEPENDÊNCIAS RELEVANTES                                         │
 * └─────────────────────────────────────────────────────────────────────┘
 *
 * ✅ Framer Motion — transições e animações
 * ✅ Lucide — iconografia do design system
 *
 * @see src/components/README.md
 * @see docs/architecture/MODULE_MAP.md
 *
 * @updated 2026-08-02
 * @license Proprietary — SevenDevX
 * ─────────────────────────────────────────────────────────────────────
 */

// ============================================================================
// 📦 IMPORTS
// ============================================================================

import React, { useState } from "react";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import OrcamentoModal from "@/components/OrcamentoModal";

// ============================================================================
// 🧩 TYPES & CONTRACTS
// ============================================================================

interface OrcamentoButtonProps {
  planName: string;
  label?: string; // texto do botão
  className?: string; // estilos extras
}

// ============================================================================
// 🏗️ MAIN COMPONENT
// ============================================================================

const OrcamentoButton: React.FC<OrcamentoButtonProps> = ({
  planName,
  label = "Solicitar Orçamento",
  className = "",
}) => {
  const [open, setOpen] = useState(false);

  return (
    <>
      <motion.button
        type="button"
        onClick={() => setOpen(true)}
        whileHover={{ scale: 1.04 }}
        whileTap={{ scale: 0.96 }}
        className={`w-full group relative overflow-hidden border-2 border-white text-white hover:bg-white hover:text-black px-6 py-3 text-sm tracking-widest uppercase font-semibold transition-all duration-300 ${className}`}
      >
        <span className="relative z-10 flex items-center justify-center space-x-2">
          <span>{label}</span>
          <ArrowRight
            size={16}
            className="group-hover:translate-x-1 transition-transform"
          />
        </span>
      </motion.button>

      {/* 🧾 Modal de Orçamento */}
      <OrcamentoModal
        isOpen={open}
        onClose={() => setOpen(false)}
        planName={planName}
        whatsappNumber="5531984740625" // ✅ coloque aqui o número oficial SevenDevX
      />
    </>
  );
};

// ============================================================================
// 📤 EXPORTS
// ============================================================================

export default OrcamentoButton;