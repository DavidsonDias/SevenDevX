import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import logo from "@/assets/logo.svg";
import LanguageSwitcher from "./LanguageSwitcher";
import { useLanguage } from "@/i18n/LanguageContext";

/**
 * 🌌 Header.tsx — SevenDevX v1.1 PRO++ i18n
 * -------------------------------------------------------------
 * ✅ Swipe lateral (abrir/fechar menu)
 * ✅ Compatível com touch e mouse
 * ✅ UX fluida estilo aplicativo nativo
 * ✅ Design futurista SpaceX-style
 * ✅ Responsivo mobile-first
 * ✅ Animações premium com Framer Motion
 * ✅ Suporte a i18n (PT/EN/ES)
 * -------------------------------------------------------------
 */


const Header = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();
  const { t } = useLanguage();

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      setIsScrolled(currentScrollY > 50);
      setIsVisible(!(currentScrollY > lastScrollY && currentScrollY > 100));
      setLastScrollY(currentScrollY);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [lastScrollY]);

  useEffect(() => {
    // Lock scroll when menu is open
    if (isMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isMenuOpen]);

  const navLinks = [
    { name: t.header.about, path: "/about" },
    { name: t.header.services, path: "/services" },
    { name: t.header.projects, path: "/projects" },
    { name: t.header.contact, path: "/#contact" },
    { name: t.header.store, path: "/store" },
    { name: "BLOG", path: "/blog" },
    { name: "LOGIN", path: "/auth" },
  ];

  const handleLinkClick = () => {
    setIsMenuOpen(false);
  };

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          isScrolled ? "bg-black/95 backdrop-blur-sm" : "bg-transparent"
        } ${isVisible ? "translate-y-0" : "-translate-y-full"}`}
      >
        <div className="w-full px-4 sm:px-6">
          <div className="flex items-center justify-between h-16 sm:h-20">
            {/* Logo - Centralizada em mobile/tablet, esquerda em desktop */}
            <Link
              to="/"
              className="flex items-center lg:static absolute left-1/2 lg:left-0 -translate-x-1/2 lg:translate-x-0 z-[60]"
            >
              <img
                src={logo}
                alt="SevenDevX"
                className="h-10 sm:h-12 lg:h-14 w-auto transition-all duration-300"
              />
            </Link>

            {/* Links de navegação no desktop (hidden em mobile/tablet) */}
            <nav className="hidden lg:flex items-center gap-8 ml-auto mr-4">
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`text-xs tracking-[0.2em] font-light transition-colors ${
                    location.pathname === link.path
                      ? "text-white"
                      : "text-white/70 hover:text-white"
                  }`}
                >
                  {link.name}
                </Link>
              ))}
              <LanguageSwitcher />
            </nav>

            {/* Ícone do menu hambúrguer - Sempre à direita */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-white p-2 ml-auto lg:ml-0 relative z-[60]"
              aria-label={isMenuOpen ? "Fechar menu" : "Abrir menu"}
            >
              {isMenuOpen ? (
                <X size={28} className="sm:w-8 sm:h-8" strokeWidth={1.5} />
              ) : (
                <Menu size={24} className="sm:w-7 sm:h-7" strokeWidth={1.5} />
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Menu overlay fullscreen */}
      <AnimatePresence>
        {isMenuOpen && (
          <>
            {/* Backdrop com blur */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="fixed inset-0 bg-black/80 backdrop-blur-md z-40"
              onClick={() => setIsMenuOpen(false)}
            />

            {/* Menu lateral com links */}
            <motion.nav
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
              className="fixed top-20 right-0 bottom-0 w-full md:w-[500px] bg-black z-50 overflow-y-auto"
            >
              <div className="flex flex-col items-end px-8 md:px-12 py-8">
                {navLinks.map((link, index) => (
                  <motion.div
                    key={link.path}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 20 }}
                    transition={{
                      duration: 0.3,
                      delay: 0.1 + index * 0.08,
                      ease: [0.22, 1, 0.36, 1],
                    }}
                    className="w-full"
                  >
                    <Link
                      to={link.path}
                      onClick={handleLinkClick}
                      className={`block py-6 text-right text-base md:text-lg tracking-[0.3em] font-light border-b border-white/10 transition-colors ${
                        location.pathname === link.path
                          ? "text-white"
                          : "text-white/80 hover:text-white"
                      }`}
                    >
                      {link.name}
                    </Link>
                  </motion.div>
                ))}

                {/* Language Switcher no menu mobile */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 20 }}
                  transition={{
                    duration: 0.3,
                    delay: 0.1 + navLinks.length * 0.08,
                    ease: [0.22, 1, 0.36, 1],
                  }}
                  className="w-full py-6 flex justify-end"
                >
                  <LanguageSwitcher />
                </motion.div>
              </div>
            </motion.nav>
          </>
        )}
      </AnimatePresence>
    </>
  );
};

export default Header;
