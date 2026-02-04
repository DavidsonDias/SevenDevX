/**
 * 🪐 AppLoaderOrbitalLogo.tsx — SevenDevX v1.2 PRO++
 * -------------------------------------------------------------
 * ✅ Tela de carregamento futurista com LOGO orbital (SpaceX vibe)
 * ✅ Logo SVG SevenDevX central girando suavemente
 * ✅ Animação orbital + barra shimmer + texto pulsante
 * ✅ Framer Motion + animações CSS ultraleves
 * ✅ Totalmente acessível e responsivo
 * -------------------------------------------------------------
 */

import { motion } from "framer-motion";
import Logo from "@/assets/logo.svg"; // 🧩 substitua pelo caminho real da sua logo SVG

const AppLoaderOrbitalLogo = () => {
  return (
    <div
      className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-black text-white text-center select-none"
      role="status"
      aria-label="Inicializando SevenDevX"
    >
      {/* 🌌 Orbital animation container */}
      <div className="relative w-28 h-28 mb-10">
        {/* 🌐 Orbital ring */}
        <motion.div
          className="absolute inset-0 rounded-full border-t-2 border-white/20 animate-spin-slow"
          style={{ animationDuration: "4s" }}
        />

        {/* ✨ Central Logo (orbitando levemente) */}
        <motion.img
          src={Logo}
          alt="SevenDevX Logo"
          className="absolute inset-0 m-auto w-16 h-16 object-contain opacity-90"
          initial={{ rotate: -10, scale: 0.9, opacity: 0 }}
          animate={{ rotate: 360, scale: 1, opacity: 1 }}
          transition={{ rotate: { duration: 10, repeat: Infinity, ease: "linear" }, duration: 1.2 }}
        />

        {/* 🛰️ Orbiting dot */}
        <motion.div
          className="absolute top-0 left-1/2 w-3 h-3 bg-white rounded-full shadow-[0_0_10px_rgba(255,255,255,0.9)]"
          animate={{ rotate: 360 }}
          transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
          style={{ transformOrigin: "center 56px" }}
        />
      </div>

      {/* 🧠 Texto principal pulsante */}
      <motion.p
        className="text-sm md:text-base uppercase tracking-[0.3em] text-white/90 animate-pulse"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1 }}
      >
        Inicializando SevenDevX...
      </motion.p>

      {/* 🌈 Barra shimmer */}
      <div className="mt-8 w-48 h-0.5 bg-white/10 relative overflow-hidden rounded-full">
        <div className="absolute inset-0 bg-white/50 animate-shimmer" />
      </div>
    </div>
  );
};

export default AppLoaderOrbitalLogo;