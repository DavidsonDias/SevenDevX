/**
 * OrcamentoButton.tsx — SevenDevX
 * ─────────────────────────────────────────────────────────────────────
 * @file src/components/OrcamentoButton.tsx
 * @module UI
 *
 * @description
 * Gatilho flutuante do fluxo de orçamento.
 *
 * @see src/components/README.md
 * ─────────────────────────────────────────────────────────────────────
 */

/**
 * 🧩 OrcamentoButton.tsx — SevenDevX v1.3 PRO++
 * -------------------------------------------------------------
 * ✅ Abre o OrcamentoModal.tsx ao clicar
 * ✅ Passa automaticamente o nome do plano
 * ✅ Design consistente com botões do site (SpaceX-style)
 * ✅ Usa Framer Motion para hover suave
 * ✅ Totalmente isolado (não depende de estado global)
 * -------------------------------------------------------------
 */

import React, { useState } from "react";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import OrcamentoModal from "@/components/OrcamentoModal";

interface OrcamentoButtonProps {
  planName: string;
  label?: string; // texto do botão
  className?: string; // estilos extras
}

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

export default OrcamentoButton;