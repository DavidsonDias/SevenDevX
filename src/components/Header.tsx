import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Menu, X, LogOut, Shield, UserCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import logo from "@/assets/logo.svg";
import LanguageSwitcher from "./LanguageSwitcher";
import { useLanguage } from "@/i18n/LanguageContext";
import { useAuthContext } from "@/contexts/AuthContext";

const Header = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { t } = useLanguage();
  const { user, isAdmin, isLoading: authLoading, signOut } = useAuthContext();

  const handleLogout = async () => {
    setIsMenuOpen(false);
    await signOut();
    navigate("/");
  };

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
    document.body.style.overflow = isMenuOpen ? "hidden" : "unset";
    return () => { document.body.style.overflow = "unset"; };
  }, [isMenuOpen]);

  const navLinks = [
    { name: t.header.about, path: "/about" },
    { name: t.header.services, path: "/services" },
    { name: t.header.projects, path: "/projects" },
    { name: t.header.contact, path: "/#contact" },
    { name: t.header.store, path: "/store" },
    { name: "BLOG", path: "/blog" },
  ];

  // Auth-aware items for desktop
  const authLinks = () => {
    if (authLoading) return null;
    if (!user) {
      return (
        <Link to="/auth" className="text-xs tracking-[0.2em] font-light text-white/70 hover:text-white transition-colors">
          LOGIN
        </Link>
      );
    }
    return (
      <div className="flex items-center gap-6">
        {isAdmin && (
          <Link to="/admin" className="flex items-center gap-1.5 text-xs tracking-[0.2em] font-light text-amber-400/90 hover:text-amber-300 transition-colors">
            <Shield className="w-3.5 h-3.5" />
            ADMIN
          </Link>
        )}
        <Link to="/profile" className="flex items-center gap-1.5 text-xs tracking-[0.2em] font-light text-white/70 hover:text-white transition-colors">
          <UserCircle className="w-3.5 h-3.5" />
          PERFIL
        </Link>
        <button type="button" onClick={handleLogout} className="flex items-center gap-1.5 text-xs tracking-[0.2em] font-light text-white/70 hover:text-red-400 transition-colors">
          <LogOut className="w-3.5 h-3.5" />
          SAIR
        </button>
      </div>
    );
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
            <Link to="/" className="flex items-center lg:static absolute left-1/2 lg:left-0 -translate-x-1/2 lg:translate-x-0 z-[60]">
              <img src={logo} alt="SevenDevX" className="h-10 sm:h-12 lg:h-14 w-auto transition-all duration-300" />
            </Link>

            <nav className="hidden lg:flex items-center gap-8 ml-auto mr-4">
              {navLinks.map((link) => {
                const active = location.pathname === link.path;
                return (
                  <Link
                    key={link.path}
                    to={link.path}
                    className={`relative group text-xs tracking-[0.2em] font-light transition-colors ${
                      active ? "text-white" : "text-white/70 hover:text-white"
                    }`}
                  >
                    {link.name}
                    <span
                      className={`pointer-events-none absolute left-0 -bottom-1 h-px bg-gradient-to-r from-white/0 via-white to-white/0 transition-all duration-500 ease-out ${
                        active ? "w-full" : "w-0 group-hover:w-full"
                      }`}
                      style={active ? { boxShadow: "0 0 8px rgba(255,255,255,0.6)" } : undefined}
                    />
                  </Link>
                );
              })}
              <LanguageSwitcher />
              {authLinks()}
            </nav>

            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-white p-2 ml-auto lg:ml-0 relative z-[60]"
              aria-label={isMenuOpen ? "Fechar menu" : "Abrir menu"}
            >
              {isMenuOpen ? <X size={28} className="sm:w-8 sm:h-8" strokeWidth={1.5} /> : <Menu size={24} className="sm:w-7 sm:h-7" strokeWidth={1.5} />}
            </button>
          </div>
        </div>
      </header>

      <AnimatePresence>
        {isMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="fixed inset-0 bg-black/80 backdrop-blur-md z-40"
              onClick={() => setIsMenuOpen(false)}
            />
            <motion.nav
              initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }}
              transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
              className="fixed top-20 right-0 bottom-0 w-full md:w-[500px] bg-black z-50 overflow-y-auto"
            >
              <div className="flex flex-col items-end px-8 md:px-12 py-8">
                {navLinks.map((link, index) => (
                  <motion.div
                    key={link.path}
                    initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 20 }}
                    transition={{ duration: 0.3, delay: 0.1 + index * 0.08, ease: [0.22, 1, 0.36, 1] }}
                    className="w-full"
                  >
                    <Link
                      to={link.path} onClick={() => setIsMenuOpen(false)}
                      className={`block py-6 text-right text-base md:text-lg tracking-[0.3em] font-light border-b border-white/10 transition-colors ${
                        location.pathname === link.path ? "text-white" : "text-white/80 hover:text-white"
                      }`}
                    >
                      {link.name}
                    </Link>
                  </motion.div>
                ))}

                {/* Auth section in mobile menu */}
                {!authLoading && (
                  <>
                    {isAdmin && (
                      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 20 }}
                        transition={{ duration: 0.3, delay: 0.1 + navLinks.length * 0.08 }} className="w-full">
                        <Link to="/admin" onClick={() => setIsMenuOpen(false)}
                          className="flex items-center justify-end gap-2 py-6 text-right text-base md:text-lg tracking-[0.3em] font-light border-b border-white/10 text-amber-400/90 hover:text-amber-300 transition-colors">
                          <Shield className="w-4 h-4" /> ADMIN
                        </Link>
                      </motion.div>
                    )}
                    {user && (
                      <>
                        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 20 }}
                          transition={{ duration: 0.3, delay: 0.1 + (navLinks.length + 1) * 0.08 }} className="w-full">
                          <Link to="/profile" onClick={() => setIsMenuOpen(false)}
                            className="flex items-center justify-end gap-2 py-6 text-right text-base md:text-lg tracking-[0.3em] font-light border-b border-white/10 text-white/80 hover:text-white transition-colors">
                            <UserCircle className="w-4 h-4" /> PERFIL
                          </Link>
                        </motion.div>
                        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 20 }}
                          transition={{ duration: 0.3, delay: 0.1 + (navLinks.length + 2) * 0.08 }} className="w-full">
                          <button type="button" onClick={handleLogout}
                            className="w-full flex items-center justify-end gap-2 py-6 text-right text-base md:text-lg tracking-[0.3em] font-light border-b border-white/10 text-white/80 hover:text-red-400 transition-colors">
                            <LogOut className="w-4 h-4" /> SAIR
                          </button>
                        </motion.div>
                      </>
                    )}
                    {!user && (
                      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 20 }}
                        transition={{ duration: 0.3, delay: 0.1 + navLinks.length * 0.08 }} className="w-full">
                        <Link to="/auth" onClick={() => setIsMenuOpen(false)}
                          className="block py-6 text-right text-base md:text-lg tracking-[0.3em] font-light border-b border-white/10 text-white/80 hover:text-white transition-colors">
                          LOGIN
                        </Link>
                      </motion.div>
                    )}
                  </>
                )}

                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 20 }}
                  transition={{ duration: 0.3, delay: 0.1 + (navLinks.length + 3) * 0.08 }}
                  className="w-full py-6 flex justify-end">
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
