/**
 * LanguageSwitcher.tsx — SevenDevX
 * ─────────────────────────────────────────────────────────────────────
 * @file src/components/LanguageSwitcher.tsx
 * @module UI
 *
 * @description
 * Alternador de idioma conectado ao LanguageContext (pt/en/es).
 *
 * @see src/components/README.md
 * ─────────────────────────────────────────────────────────────────────
 */

/**
 * 🌐 Language Switcher - SevenDevX Enterprise
 * Seletor de idioma premium com SVG flags otimizadas para cross-platform
 * Compatível com: Android, iOS, Desktop (Chrome, Safari, Edge)
 */

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, Globe, Check } from "lucide-react";
import { useLanguage, Language } from "@/i18n/LanguageContext";

/**
 * FlagContainer - Container enterprise para bandeiras
 * Garante aspect-ratio correto e renderização consistente cross-platform
 */
const FlagContainer = ({ children }: { children: React.ReactNode }) => (
  <div 
    className="relative flex-shrink-0"
    style={{ 
      width: '28px', 
      height: '20px',
      borderRadius: '3px',
      overflow: 'hidden',
      boxShadow: '0 1px 3px rgba(0,0,0,0.3), inset 0 0 0 1px rgba(255,255,255,0.1)'
    }}
  >
    {children}
    {/* Overlay sutil para profundidade */}
    <div 
      className="absolute inset-0 pointer-events-none"
      style={{ 
        background: 'linear-gradient(180deg, rgba(255,255,255,0.1) 0%, transparent 50%, rgba(0,0,0,0.1) 100%)',
        borderRadius: '3px'
      }} 
    />
  </div>
);

/**
 * 🇧🇷 Brazil Flag - SVG Otimizado
 * ViewBox normalizado 3:2, preserveAspectRatio para cross-platform
 */
const FlagBR = () => (
  <svg 
    viewBox="0 0 30 21" 
    preserveAspectRatio="xMidYMid slice"
    style={{ 
      width: '100%', 
      height: '100%', 
      display: 'block'
    }}
    xmlns="http://www.w3.org/2000/svg"
  >
    {/* Fundo verde */}
    <rect width="30" height="21" fill="#009c3b"/>
    {/* Losango amarelo */}
    <polygon 
      points="15,2 28,10.5 15,19 2,10.5" 
      fill="#ffdf00"
    />
    {/* Círculo azul */}
    <circle cx="15" cy="10.5" r="5.5" fill="#002776"/>
    {/* Faixa branca curva */}
    <path 
      d="M9.5 10.5 Q15 7, 20.5 10.5" 
      fill="none" 
      stroke="#fff" 
      strokeWidth="0.8"
      strokeLinecap="round"
    />
    {/* Estrelas simplificadas */}
    <g fill="#fff">
      <circle cx="12" cy="9" r="0.4"/>
      <circle cx="14" cy="8.5" r="0.5"/>
      <circle cx="16" cy="8.8" r="0.4"/>
      <circle cx="18" cy="9.2" r="0.4"/>
      <circle cx="15" cy="12" r="0.6"/>
      <circle cx="13" cy="11.5" r="0.35"/>
      <circle cx="17" cy="11.5" r="0.35"/>
      <circle cx="14.5" cy="13.5" r="0.35"/>
      <circle cx="15.5" cy="13.5" r="0.35"/>
    </g>
  </svg>
);

/**
 * 🇺🇸 USA Flag - SVG Otimizado
 * ViewBox normalizado 30:21, preserveAspectRatio para cross-platform
 */
const FlagUS = () => (
  <svg 
    viewBox="0 0 30 21" 
    preserveAspectRatio="xMidYMid slice"
    style={{ 
      width: '100%', 
      height: '100%', 
      display: 'block'
    }}
    xmlns="http://www.w3.org/2000/svg"
  >
    {/* Fundo branco */}
    <rect width="30" height="21" fill="#fff"/>
    
    {/* Listras vermelhas (7 listras) */}
    <g fill="#bf0a30">
      <rect y="0" width="30" height="1.615"/>
      <rect y="3.23" width="30" height="1.615"/>
      <rect y="6.46" width="30" height="1.615"/>
      <rect y="9.69" width="30" height="1.615"/>
      <rect y="12.92" width="30" height="1.615"/>
      <rect y="16.15" width="30" height="1.615"/>
      <rect y="19.38" width="30" height="1.62"/>
    </g>
    
    {/* Cantão azul */}
    <rect width="12" height="11.31" fill="#002868"/>
    
    {/* Estrelas (simplificadas - 5x4 + 4x5 padrão) */}
    <g fill="#fff">
      {/* Linha 1 - 6 estrelas */}
      <circle cx="1" cy="1" r="0.5"/>
      <circle cx="3" cy="1" r="0.5"/>
      <circle cx="5" cy="1" r="0.5"/>
      <circle cx="7" cy="1" r="0.5"/>
      <circle cx="9" cy="1" r="0.5"/>
      <circle cx="11" cy="1" r="0.5"/>
      {/* Linha 2 - 5 estrelas offset */}
      <circle cx="2" cy="2.5" r="0.5"/>
      <circle cx="4" cy="2.5" r="0.5"/>
      <circle cx="6" cy="2.5" r="0.5"/>
      <circle cx="8" cy="2.5" r="0.5"/>
      <circle cx="10" cy="2.5" r="0.5"/>
      {/* Linha 3 - 6 estrelas */}
      <circle cx="1" cy="4" r="0.5"/>
      <circle cx="3" cy="4" r="0.5"/>
      <circle cx="5" cy="4" r="0.5"/>
      <circle cx="7" cy="4" r="0.5"/>
      <circle cx="9" cy="4" r="0.5"/>
      <circle cx="11" cy="4" r="0.5"/>
      {/* Linha 4 - 5 estrelas offset */}
      <circle cx="2" cy="5.5" r="0.5"/>
      <circle cx="4" cy="5.5" r="0.5"/>
      <circle cx="6" cy="5.5" r="0.5"/>
      <circle cx="8" cy="5.5" r="0.5"/>
      <circle cx="10" cy="5.5" r="0.5"/>
      {/* Linha 5 - 6 estrelas */}
      <circle cx="1" cy="7" r="0.5"/>
      <circle cx="3" cy="7" r="0.5"/>
      <circle cx="5" cy="7" r="0.5"/>
      <circle cx="7" cy="7" r="0.5"/>
      <circle cx="9" cy="7" r="0.5"/>
      <circle cx="11" cy="7" r="0.5"/>
      {/* Linha 6 - 5 estrelas offset */}
      <circle cx="2" cy="8.5" r="0.5"/>
      <circle cx="4" cy="8.5" r="0.5"/>
      <circle cx="6" cy="8.5" r="0.5"/>
      <circle cx="8" cy="8.5" r="0.5"/>
      <circle cx="10" cy="8.5" r="0.5"/>
      {/* Linha 7 - 6 estrelas */}
      <circle cx="1" cy="10" r="0.5"/>
      <circle cx="3" cy="10" r="0.5"/>
      <circle cx="5" cy="10" r="0.5"/>
      <circle cx="7" cy="10" r="0.5"/>
      <circle cx="9" cy="10" r="0.5"/>
      <circle cx="11" cy="10" r="0.5"/>
    </g>
  </svg>
);

/**
 * 🇪🇸 Spain Flag - SVG Otimizado
 * ViewBox normalizado 30:20, preserveAspectRatio para cross-platform
 */
const FlagES = () => (
  <svg 
    viewBox="0 0 30 20" 
    preserveAspectRatio="xMidYMid slice"
    style={{ 
      width: '100%', 
      height: '100%', 
      display: 'block'
    }}
    xmlns="http://www.w3.org/2000/svg"
  >
    {/* Faixa vermelha superior */}
    <rect y="0" width="30" height="5" fill="#c60b1e"/>
    {/* Faixa amarela central */}
    <rect y="5" width="30" height="10" fill="#ffc400"/>
    {/* Faixa vermelha inferior */}
    <rect y="15" width="30" height="5" fill="#c60b1e"/>
    
    {/* Escudo simplificado */}
    <g transform="translate(7, 6.5)">
      {/* Base do escudo */}
      <path 
        d="M0,0 h4 v5 c0,1.5 -2,2.5 -2,2.5 c0,0 -2,-1 -2,-2.5 z" 
        fill="#c60b1e" 
        stroke="#ffc400" 
        strokeWidth="0.3"
      />
      {/* Divisões do escudo */}
      <rect x="0" y="0" width="2" height="2.5" fill="#c60b1e"/>
      <rect x="2" y="0" width="2" height="2.5" fill="#fff"/>
      <rect x="0" y="2.5" width="2" height="2.5" fill="#fff"/>
      <rect x="2" y="2.5" width="2" height="2.5" fill="#c60b1e"/>
      {/* Castelo */}
      <rect x="0.4" y="0.5" width="1.2" height="1.5" fill="#ffc400"/>
      {/* Coroa */}
      <rect x="0.8" y="-1" width="2.4" height="0.8" fill="#ffc400" rx="0.1"/>
      <circle cx="1.2" cy="-1.3" r="0.25" fill="#ffc400"/>
      <circle cx="2" cy="-1.4" r="0.3" fill="#ffc400"/>
      <circle cx="2.8" cy="-1.3" r="0.25" fill="#ffc400"/>
    </g>
  </svg>
);

const FLAGS: Record<Language, React.FC> = {
  pt: FlagBR,
  en: FlagUS,
  es: FlagES,
};

const languages: { code: Language; label: string; country: string; nativeName: string }[] = [
  { code: "pt", label: "Português", country: "Brasil", nativeName: "PT-BR" },
  { code: "en", label: "English", country: "USA", nativeName: "EN-US" },
  { code: "es", label: "Español", country: "España", nativeName: "ES-ES" },
];

const LanguageSwitcher = () => {
  const { language, setLanguage } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
    }

    return () => {
      document.removeEventListener("keydown", handleEscape);
    };
  }, [isOpen]);

  const CurrentFlag = FLAGS[language];

  return (
    <div className="relative" ref={containerRef}>
      {/* Trigger Button - Premium Enterprise Design */}
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        className="group relative flex items-center gap-2.5 px-3.5 py-2 rounded-xl
                   bg-gradient-to-r from-white/[0.08] to-white/[0.04]
                   border border-white/10 hover:border-white/25
                   backdrop-blur-xl shadow-lg shadow-black/20
                   transition-all duration-300 ease-out
                   hover:shadow-xl hover:shadow-primary/10"
        whileHover={{ scale: 1.03, y: -1 }}
        whileTap={{ scale: 0.97 }}
        aria-label="Selecionar idioma"
        aria-expanded={isOpen}
        aria-haspopup="listbox"
      >
        {/* Glow effect on hover */}
        <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-primary/20 to-accent/20 opacity-0 group-hover:opacity-100 blur-xl transition-opacity duration-500" />
        
        {/* Flag container */}
        <FlagContainer>
          <CurrentFlag />
        </FlagContainer>
        
        {/* Language code badge */}
        <span className="text-xs font-semibold text-white/80 tracking-wider hidden sm:block">
          {languages.find(l => l.code === language)?.nativeName}
        </span>
        
        {/* Animated chevron */}
        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.2, ease: "easeInOut" }}
        >
          <ChevronDown size={14} className="text-white/50 group-hover:text-white/80 transition-colors" />
        </motion.div>
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop blur */}
            <motion.div
              className="fixed inset-0 z-40"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
            />
            
            {/* Dropdown menu - Premium design */}
            <motion.div
              className="absolute top-full right-0 mt-3 z-50
                         bg-gradient-to-b from-[#1a1a1a] to-[#0d0d0d]
                         rounded-2xl overflow-hidden
                         shadow-2xl shadow-black/50
                         border border-white/10
                         backdrop-blur-2xl"
              style={{ width: '220px' }}
              initial={{ opacity: 0, y: -10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
              role="listbox"
              aria-label="Idiomas disponíveis"
            >
              {/* Header */}
              <div className="px-4 py-3 border-b border-white/5 bg-white/[0.02]">
                <div className="flex items-center gap-2">
                  <Globe size={14} className="text-primary/80" />
                  <span className="text-xs font-medium text-white/50 uppercase tracking-widest">
                    Idioma
                  </span>
                </div>
              </div>
              
              {/* Options */}
              <div className="py-2">
                {languages.map((lang, index) => {
                  const LangFlag = FLAGS[lang.code];
                  const isSelected = language === lang.code;
                  
                  return (
                    <motion.button
                      key={lang.code}
                      onClick={() => {
                        setLanguage(lang.code);
                        setIsOpen(false);
                      }}
                      className={`
                        relative w-full flex items-center gap-3 px-4 py-3
                        transition-all duration-200
                        ${isSelected 
                          ? 'bg-white/[0.08]' 
                          : 'hover:bg-white/[0.05]'
                        }
                      `}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      role="option"
                      aria-selected={isSelected}
                    >
                      {/* Selection indicator */}
                      {isSelected && (
                        <motion.div
                          className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-gradient-to-b from-primary to-primary/50 rounded-r-full"
                          layoutId="selectedIndicator"
                          transition={{ duration: 0.2 }}
                        />
                      )}
                      
                      {/* Flag with enterprise container */}
                      <FlagContainer>
                        <LangFlag />
                      </FlagContainer>
                      
                      {/* Text content */}
                      <div className="flex-1 text-left">
                        <div className={`text-sm font-medium ${isSelected ? 'text-white' : 'text-white/80'}`}>
                          {lang.label}
                        </div>
                        <div className="text-xs text-white/40">
                          {lang.country} • {lang.nativeName}
                        </div>
                      </div>
                      
                      {/* Check icon for selected */}
                      {isSelected && (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className="w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center"
                        >
                          <Check size={12} className="text-primary" />
                        </motion.div>
                      )}
                    </motion.button>
                  );
                })}
              </div>
              
              {/* Footer hint */}
              <div className="px-4 py-2.5 border-t border-white/5 bg-white/[0.01]">
                <div className="flex items-center justify-center gap-2 text-[10px] text-white/30">
                  <span>ESC para fechar</span>
                  <span>•</span>
                  <span>↑↓ navegar</span>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

export default LanguageSwitcher;
