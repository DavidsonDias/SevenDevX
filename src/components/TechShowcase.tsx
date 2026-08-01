/**
 * TechShowcase.tsx — SevenDevX
 * ─────────────────────────────────────────────────────────────────────
 * @file src/components/TechShowcase.tsx
 * @module UI
 *
 * @description
 * Marquee infinito de tecnologias em duas faixas contínuas.
 *
 * @see src/components/README.md
 * ─────────────────────────────────────────────────────────────────────
 */

/**
 * ⭐ TECH SHOWCASE — Version 1.0 PRO++
 * --------------------------------------------------------------
 * 🔥 Versão mais estável, performática e limpa produzida até agora.
 *
 * Melhorias principais:
 * ✔ GSAP Context API (isolamento completo do escopo do componente)
 * ✔ Animations Cleanup PRO (ctx.revert → remove triggers, listeners e tweens)
 * ✔ ScrollTrigger otimizado para não duplicar animações ao trocar categorias
 * ✔ Grid altamente responsivo + hover 3D glow
 * ✔ Comentários DOCUMENTADOS padrão PRO++
 * ✔ Transições suaves usando Framer Motion
 * ✔ Modal dinâmico e acessível (TechModal)
 * --------------------------------------------------------------
 */

// ============================================================================
// 📦 IMPORTS
// ============================================================================

import { motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { techData, categories } from "@/utils/techData";
import TechModal from "./TechModal";
import TechIcon from "./TechIcon";
import type { Technology } from "@/utils/techData";

gsap.registerPlugin(ScrollTrigger);

// ============================================================================
// 🏗️ MAIN COMPONENT
// ============================================================================

// =====================================================================
// 🔮 COMPONENT: TechShowcase
// =====================================================================
const TechShowcase = () => {
  const sectionRef = useRef<HTMLElement>(null);

  // Estado da tecnologia selecionada (para o modal)
  const [selectedTech, setSelectedTech] = useState<Technology | null>(null);

  // Categoria ativa
  const [activeCategory, setActiveCategory] = useState<string>("Todas");

  // =====================================================================
  // 🎬 ANIMAÇÃO GSAP — ENTRADA DOS CARDS (ScrollTrigger)
  // =====================================================================
  useEffect(() => {
    if (!sectionRef.current) return;

    // Seleciona todos os cards filtrados
    const cards = sectionRef.current.querySelectorAll(".tech-card");

    // Contexto GSAP isolado (100% compatível com React/Next)
    const ctx = gsap.context(() => {
      gsap.fromTo(
        cards,
        {
          opacity: 0,
          y: 30,
          scale: 0.95,
        },
        {
          opacity: 1,
          y: 0,
          scale: 1,
          duration: 0.5,
          stagger: 0.05,
          ease: "power2.out",

          // ScrollTrigger PRO++
          scrollTrigger: {
            trigger: sectionRef.current,
            start: "top 80%",
            end: "bottom 20%",
            toggleActions: "play none none reverse",
          },
        }
      );
    }, sectionRef);

    // 🧹 Cleanup completo — cancela tweens + triggers + listeners
    return () => ctx.revert();
  }, [activeCategory]);

  // =====================================================================
  // 🎚 FILTRO DE TECNOLOGIAS
  // =====================================================================
  const filteredTechs =
    activeCategory === "Todas"
      ? techData
      : techData.filter((tech) => tech.category === activeCategory);

  // =====================================================================
  // 🎨 RENDERIZAÇÃO PRINCIPAL
  // =====================================================================
  return (
    <>
      {/* ============================================================
          🎯 SECTION WRAPPER
          ============================================================ */}
      <section
        ref={sectionRef}
        className="relative min-h-screen flex items-center bg-black py-20 md:py-32"
      >
        <div className="container mx-auto px-6">
          {/* ============================================================
              🏁 TÍTULO + SUBTÍTULO
              ============================================================ */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="max-w-7xl mx-auto"
          >
            <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-4 uppercase tracking-tight text-center">
              Stack Tecnológica Completa
            </h2>

            <p className="text-white/60 text-center mb-12 text-sm md:text-base uppercase tracking-wider">
              Dominamos as principais tecnologias do mercado
            </p>

            {/* ============================================================
                🎛 FILTROS DE CATEGORIAS (Tabs)
                ============================================================ */}
            <div className="flex flex-wrap justify-center gap-3 md:gap-4 mb-16">
              {categories.map((category) => (
                <button
                  key={category}
                  onClick={() => setActiveCategory(category)}
                  className={`px-4 md:px-6 py-2 md:py-3 text-xs md:text-sm uppercase tracking-wider font-semibold border transition-all duration-300
                    ${
                      activeCategory === category
                        ? "bg-white text-black border-white"
                        : "bg-transparent text-white/80 border-white/30 hover:border-white hover:bg-white/10"
                    }`}
                >
                  {category}
                </button>
              ))}
            </div>

            {/* ============================================================
                🧩 GRID DE TECNOLOGIAS
                ============================================================ */}
            <motion.div
              className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 md:gap-6"
              layout
            >
              {filteredTechs.map((tech, index) => (
                <motion.button
                  key={tech.name}
                  onClick={() => setSelectedTech(tech)}
                  className="tech-card relative group border border-white/20 p-6 md:p-8 text-center hover:border-white hover:bg-white/5 transition-all duration-300 cursor-pointer overflow-hidden"
                  layout
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  transition={{ duration: 0.3, delay: index * 0.02 }}
                  whileHover={{ scale: 1.08, y: -5 }}
                  whileTap={{ scale: 0.95 }}
                >
                  {/* --------------------------------------------------------
                      💠 GLOW EFFECT (cor dinâmica baseada na tech)
                      -------------------------------------------------------- */}
                  <div
                    className="absolute inset-0 opacity-0 group-hover:opacity-20 transition-opacity duration-300 blur-xl"
                    style={{ backgroundColor: tech.color }}
                  />

                  {/* --------------------------------------------------------
                      📍 BADGE de categoria (bolinha)
                      -------------------------------------------------------- */}
                  <div
                    className="absolute top-2 right-2 w-2 h-2 rounded-full opacity-60"
                    style={{ backgroundColor: tech.color }}
                  />

                  {/* --------------------------------------------------------
                      🧱 CONTEÚDO PRINCIPAL DO CARD
                      -------------------------------------------------------- */}
                  <div className="relative z-10">
                    <div className="text-4xl md:text-5xl mb-3 transform group-hover:scale-110 group-hover:rotate-3 transition-all duration-300 flex items-center justify-center">
                      <TechIcon
                        icon={tech.icon}
                        size={48}
                        color={tech.color}
                        aria-label={`${tech.name} logo`}
                      />
                    </div>

                    <span className="text-xs sm:text-sm tracking-wider font-medium uppercase block mb-1">
                      {tech.name}
                    </span>

                    <span
                      className="text-[10px] uppercase tracking-wider opacity-70"
                      style={{ color: tech.color }}
                    >
                      {tech.category}
                    </span>
                  </div>
                </motion.button>
              ))}
            </motion.div>

            {/* ============================================================
                📊 STATS — MÉTRICAS VISUAIS
                ============================================================ */}
            <motion.div
              className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-20"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.3 }}
            >
              <div className="text-center border border-white/20 p-6">
                <div className="text-3xl md:text-4xl font-bold mb-2">
                  {techData.length}+
                </div>
                <div className="text-xs md:text-sm text-white/60 uppercase tracking-wider">
                  Tecnologias
                </div>
              </div>

              <div className="text-center border border-white/20 p-6">
                <div className="text-3xl md:text-4xl font-bold mb-2">5</div>
                <div className="text-xs md:text-sm text-white/60 uppercase tracking-wider">
                  Categorias
                </div>
              </div>

              <div className="text-center border border-white/20 p-6">
                <div className="text-3xl md:text-4xl font-bold mb-2">100%</div>
                <div className="text-xs md:text-sm text-white/60 uppercase tracking-wider">
                  Full Stack
                </div>
              </div>

              <div className="text-center border border-white/20 p-6">
                <div className="text-3xl md:text-4xl font-bold mb-2">24/7</div>
                <div className="text-xs md:text-sm text-white/60 uppercase tracking-wider">
                  Suporte
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* ============================================================
          🎬 MODAL DE DETALHES DA TECNOLOGIA
          ============================================================ */}
      <TechModal tech={selectedTech} onClose={() => setSelectedTech(null)} />
    </>
  );
};

// ============================================================================
// 📤 EXPORTS
// ============================================================================

export default TechShowcase;