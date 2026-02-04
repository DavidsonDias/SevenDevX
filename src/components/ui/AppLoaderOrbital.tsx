/**
 * 🌌 AppLoaderOrbital.tsx — SevenDevX Orbital Loader v1.0 PRO++
 * -------------------------------------------------------------
 * ✅ Logo flutuante com animação realista (Framer Motion)
 * ✅ Partículas orbitando em canvas (leve e dinâmico)
 * ✅ Feedback visual premium SpaceX-style
 * ✅ Responsivo e acessível
 * ✅ Nenhuma dependência extra além do Framer Motion
 * -------------------------------------------------------------
 */

import { useEffect, useRef } from "react";
import { motion } from "framer-motion";
import logo from "@/assets/logo.svg";

const AppLoaderOrbital = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrame: number;
    const particles: { x: number; y: number; radius: number; speed: number; angle: number }[] = [];

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      particles.length = 0;
      const total = Math.min(120, Math.floor((canvas.width * canvas.height) / 12000));
      for (let i = 0; i < total; i++) {
        particles.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          radius: Math.random() * 1.5 + 0.2,
          speed: 0.2 + Math.random() * 0.4,
          angle: Math.random() * Math.PI * 2,
        });
      }
    };

    const animate = () => {
      if (!ctx) return;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      for (const p of particles) {
        p.angle += p.speed * 0.02;
        p.x += Math.cos(p.angle) * 0.3;
        p.y += Math.sin(p.angle) * 0.3;

        if (p.x < 0) p.x = canvas.width;
        if (p.x > canvas.width) p.x = 0;
        if (p.y < 0) p.y = canvas.height;
        if (p.y > canvas.height) p.y = 0;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(255,255,255,0.7)";
        ctx.fill();
      }

      animationFrame = requestAnimationFrame(animate);
    };

    resize();
    animate();
    window.addEventListener("resize", resize);
    return () => {
      cancelAnimationFrame(animationFrame);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <div className="fixed inset-0 bg-black flex flex-col items-center justify-center overflow-hidden z-[9999]">
      {/* 🔭 Canvas das partículas */}
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />

      {/* 🚀 Logo flutuante */}
      <motion.img
        src={logo}
        alt="SevenDevX Logo"
        className="w-28 sm:w-36 md:w-44 drop-shadow-[0_0_20px_rgba(255,255,255,0.2)]"
        initial={{ opacity: 0, y: 30, scale: 0.9 }}
        animate={{
          opacity: [0.8, 1, 0.8],
          y: [10, -10, 10],
          scale: [0.95, 1, 0.95],
        }}
        transition={{
          duration: 3,
          ease: "easeInOut",
          repeat: Infinity,
        }}
      />

      {/* ⚡ Brilho pulsante */}
      <motion.div
        className="absolute w-64 h-64 bg-white/10 rounded-full blur-3xl"
        animate={{
          opacity: [0.3, 0.7, 0.3],
          scale: [0.9, 1.05, 0.9],
        }}
        transition={{
          duration: 4,
          ease: "easeInOut",
          repeat: Infinity,
        }}
      />

      {/* 🛰️ Texto interativo */}
      <motion.p
        className="mt-10 text-white/70 text-xs sm:text-sm uppercase tracking-[0.35em] z-10"
        animate={{ opacity: [0.4, 1, 0.4] }}
        transition={{
          duration: 2,
          ease: "easeInOut",
          repeat: Infinity,
        }}
      >
        Preparando decolagem...
      </motion.p>
    </div>
  );
};

export default AppLoaderOrbital;