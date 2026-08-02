/**
 * 🧩 TechIcon.tsx — SevenDevX
 * ─────────────────────────────────────────────────────────────────────
 *
 * @file src/components/TechIcon.tsx
 * @module UI
 * @layer Presentation / UI
 * @status Active
 *
 * @description
 * Ícone de tecnologia com resolução local (assets do projeto).
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

import { IconType } from "react-icons";
import { useState } from "react";

// ============================================================================
// 🧩 TYPES & CONTRACTS
// ============================================================================

interface TechIconProps {
  icon: IconType | string;
  size?: number;
  color?: string;
  className?: string;
  "aria-label"?: string;
}

// ============================================================================
// 🏗️ MAIN COMPONENT
// ============================================================================

/**
 * Renderiza um ícone de tecnologia que pode ser:
 * - Um componente IconType (react-icons)
 * - Uma URL de imagem SVG (string)
 * 
 * Features:
 * - Fallback visual para imagens que falham ao carregar
 * - Lazy loading para melhor performance
 * - Suporte a ícones de bibliotecas e imagens externas
 */
const TechIcon = ({ 
  icon, 
  size = 48, 
  color, 
  className,
  "aria-label": ariaLabel 
}: TechIconProps) => {
  const [hasError, setHasError] = useState(false);

  // Se for uma string, renderiza como imagem
  if (typeof icon === "string") {
    // Se houve erro, mostra fallback visual
    if (hasError) {
      return (
        <div 
          className={`flex items-center justify-center rounded-lg ${className || ''}`}
          style={{ 
            width: size, 
            height: size, 
            backgroundColor: color ? `${color}20` : 'rgba(255,255,255,0.1)',
            border: `1px solid ${color || 'rgba(255,255,255,0.2)'}`
          }}
          aria-label={ariaLabel}
          role="img"
        >
          <span 
            className="text-xs font-bold uppercase"
            style={{ color: color || 'white' }}
          >
            {ariaLabel?.charAt(0) || '?'}
          </span>
        </div>
      );
    }

    return (
      <img 
        src={icon}
        alt={ariaLabel || "Technology icon"}
        width={size}
        height={size}
        className={className}
        style={{ width: size, height: size }}
        loading="lazy"
        onError={() => setHasError(true)}
      />
    );
  }

  // Se for um IconType, renderiza como componente
  const IconComponent = icon;
  return (
    <IconComponent 
      size={size} 
      style={{ color }} 
      aria-label={ariaLabel}
      className={className}
    />
  );
};

// ============================================================================
// 📤 EXPORTS
// ============================================================================

export default TechIcon;
