import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface WhatsAppButtonProps {
  phone?: string;
  message?: string;
  delay?: number;
  position?: "left" | "right";
  tooltipText?: string;
}

const WhatsAppButton: React.FC<WhatsAppButtonProps> = ({
  phone = "5531984740625",
  message = "Olá, gostaria de saber mais sobre seus serviços!",
  delay = 3000,
  position = "right",
  tooltipText = "Fale conosco no WhatsApp",
}) => {
  const [visible, setVisible] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [shouldShake, setShouldShake] = useState(false);
  const hasShaken = useRef(false);
  const lastScrollTop = useRef(0);

  // Exibe após delay + dispara shake inicial
  useEffect(() => {
    const timer = setTimeout(() => {
      setVisible(true);
      if (!hasShaken.current) {
        hasShaken.current = true;
        setShouldShake(true);
      }
    }, delay);
    return () => clearTimeout(timer);
  }, [delay]);

  // Scroll: mostra ao descer, esconde ao subir
  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
      if (scrollTop > lastScrollTop.current) {
        setVisible(true);
        if (!hasShaken.current) {
          hasShaken.current = true;
          setShouldShake(true);
        }
      } else {
        setVisible(false);
      }
      lastScrollTop.current = Math.max(scrollTop, 0);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleClick = useCallback(() => {
    const url = `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
    window.open(url, "_blank", "noopener,noreferrer");
  }, [phone, message]);

  const positionClass = position === "left" ? "left-6" : "right-6";

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          className={`fixed bottom-6 ${positionClass} z-50 flex items-center gap-3`}
          initial={{ opacity: 0, scale: 0.8, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.8, y: 20 }}
          transition={{ type: "spring", stiffness: 260, damping: 20 }}
          style={{ flexDirection: position === "left" ? "row-reverse" : "row" }}
        >
          {/* Tooltip - desktop only */}
          <AnimatePresence>
            {isHovered && (
              <motion.span
                initial={{ opacity: 0, x: position === "right" ? 10 : -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: position === "right" ? 10 : -10 }}
                transition={{ duration: 0.2 }}
                className="hidden md:block pointer-events-none whitespace-nowrap rounded-lg bg-black/90 px-3 py-2 text-xs font-medium text-white shadow-lg backdrop-blur-sm"
              >
                {tooltipText}
              </motion.span>
            )}
          </AnimatePresence>

          {/* Button */}
          <motion.button
            type="button"
            onClick={handleClick}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            animate={shouldShake
              ? { rotate: [0, -8, 8, -6, 6, -3, 3, 0], transition: { duration: 0.6, ease: "easeInOut" } }
              : { rotate: 0 }
            }
            onAnimationComplete={() => setShouldShake(false)}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            aria-label={tooltipText}
            className="relative flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366] shadow-[0_4px_20px_rgba(37,211,102,0.4)] outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-black transition-shadow duration-300 hover:shadow-[0_4px_30px_rgba(37,211,102,0.6)]"
          >
            {/* Pulse ring */}
            <span className="absolute inset-0 rounded-full animate-[wa-pulse_2s_ease-out_infinite] bg-[#25D366]" />

            {/* Icon */}
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              className="relative z-10 h-7 w-7 fill-white"
            >
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
            </svg>
          </motion.button>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default WhatsAppButton;
