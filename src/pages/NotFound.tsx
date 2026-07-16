import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight, Home, Search } from "lucide-react";

const glitchKeyframes = `
@keyframes glitch-1 {
  0%, 100% { clip-path: inset(40% 0 61% 0); transform: translate(-2px, 2px); }
  20% { clip-path: inset(92% 0 1% 0); transform: translate(1px, -3px); }
  40% { clip-path: inset(43% 0 1% 0); transform: translate(-1px, 3px); }
  60% { clip-path: inset(25% 0 58% 0); transform: translate(3px, 1px); }
  80% { clip-path: inset(54% 0 7% 0); transform: translate(-3px, -2px); }
}
@keyframes glitch-2 {
  0%, 100% { clip-path: inset(65% 0 1% 0); transform: translate(2px, -1px); }
  20% { clip-path: inset(5% 0 82% 0); transform: translate(-3px, 2px); }
  40% { clip-path: inset(70% 0 15% 0); transform: translate(3px, -2px); }
  60% { clip-path: inset(10% 0 75% 0); transform: translate(-2px, 3px); }
  80% { clip-path: inset(30% 0 55% 0); transform: translate(1px, -1px); }
}
@keyframes scan {
  0% { top: -10%; }
  100% { top: 110%; }
}
`;

const NotFound = () => {
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [counter, setCounter] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCounter(prev => (prev + 1) % 9999);
    }, 50);
    return () => clearInterval(interval);
  }, []);

  const handleMouseMove = (e: React.MouseEvent) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setMousePos({
      x: ((e.clientX - rect.left) / rect.width - 0.5) * 20,
      y: ((e.clientY - rect.top) / rect.height - 0.5) * 20,
    });
  };

  return (
    <div
      className="min-h-screen bg-background flex items-center justify-center relative overflow-hidden"
      onMouseMove={handleMouseMove}
    >
      <style>{glitchKeyframes}</style>

      {/* Grid background */}
      <div className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `linear-gradient(hsl(var(--foreground)) 1px, transparent 1px), linear-gradient(90deg, hsl(var(--foreground)) 1px, transparent 1px)`,
          backgroundSize: '60px 60px',
        }}
      />

      {/* Scan line */}
      <div className="absolute left-0 right-0 h-[2px] bg-foreground/10 pointer-events-none"
        style={{ animation: 'scan 3s linear infinite' }}
      />

      {/* Radial glow */}
      <div
        className="absolute w-[600px] h-[600px] rounded-full pointer-events-none"
        style={{
          background: 'radial-gradient(circle, hsl(var(--foreground) / 0.04) 0%, transparent 70%)',
          left: `calc(50% + ${mousePos.x * 2}px)`,
          top: `calc(50% + ${mousePos.y * 2}px)`,
          transform: 'translate(-50%, -50%)',
          transition: 'left 0.3s, top 0.3s',
        }}
      />

      <div className="relative z-10 text-center px-6 max-w-2xl">
        {/* Glitch 404 */}
        <div className="relative mb-8 select-none">
          <motion.h1
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            className="text-[10rem] md:text-[14rem] font-bold font-orbitron leading-none tracking-tighter text-foreground"
            style={{ transform: `translate(${mousePos.x * 0.3}px, ${mousePos.y * 0.3}px)` }}
          >
            404
          </motion.h1>

          {/* Glitch layers */}
          <span
            className="absolute inset-0 text-[10rem] md:text-[14rem] font-bold font-orbitron leading-none tracking-tighter text-foreground/80 pointer-events-none"
            style={{ animation: 'glitch-1 2.5s infinite linear', color: 'hsl(var(--foreground) / 0.6)' }}
            aria-hidden="true"
          >
            404
          </span>
          <span
            className="absolute inset-0 text-[10rem] md:text-[14rem] font-bold font-orbitron leading-none tracking-tighter text-foreground/80 pointer-events-none"
            style={{ animation: 'glitch-2 2.5s infinite linear', color: 'hsl(var(--foreground) / 0.4)' }}
            aria-hidden="true"
          >
            404
          </span>
        </div>

        {/* Error code ticker */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="flex items-center justify-center gap-3 mb-6"
        >
          <span className="text-xs font-mono text-muted-foreground tracking-[0.3em] uppercase">
            ERR_CODE
          </span>
          <span className="font-mono text-xs text-foreground/40 tabular-nums">
            {String(counter).padStart(4, '0')}
          </span>
        </motion.div>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.6 }}
          className="text-lg md:text-xl text-muted-foreground mb-2 tracking-wide uppercase font-light"
        >
          Página não encontrada
        </motion.p>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.6 }}
          className="text-sm text-muted-foreground mb-12 max-w-md mx-auto"
        >
          O destino que você procura não existe neste servidor. Verifique o endereço ou retorne à base.
        </motion.p>

        {/* Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.6 }}
          className="flex flex-col sm:flex-row gap-4 justify-center"
        >
          <Link to="/">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="inline-flex items-center gap-3 border-2 border-foreground px-8 py-4 text-sm tracking-widest uppercase font-semibold hover:bg-foreground hover:text-background transition-all duration-300 group"
            >
              <Home className="w-4 h-4" />
              <span>Voltar ao Início</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </motion.button>
          </Link>

          <Link to="/services">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="inline-flex items-center gap-3 border border-border px-8 py-4 text-sm tracking-widest uppercase font-semibold text-muted-foreground hover:text-foreground hover:border-foreground/50 transition-all duration-300"
            >
              <Search className="w-4 h-4" />
              <span>Nossos Serviços</span>
            </motion.button>
          </Link>
        </motion.div>

        {/* Bottom decoration */}
        <motion.div
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ delay: 0.8, duration: 1, ease: [0.22, 1, 0.36, 1] }}
          className="mt-16 h-px bg-gradient-to-r from-transparent via-foreground/20 to-transparent"
        />
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="mt-4 text-[10px] text-muted-foreground/30 uppercase tracking-[0.4em] font-mono"
        >
          SEVENDEVX • SYSTEM ERROR • HTTP 404
        </motion.p>
      </div>
    </div>
  );
};

export default NotFound;
