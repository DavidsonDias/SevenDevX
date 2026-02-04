// 📂 src/components/Footer.tsx
// 🧱 Versão 1.1 PRO++ — SevenDevX (i18n)
// • Animações suaves GSAP + Framer Motion
// • SEO estruturado (Schema.org)
// • Acessibilidade e ARIA Roles
// • Design responsivo e leve
// • i18n completo (PT/EN/ES)

import { useEffect, useRef } from "react";
import { motion } from "framer-motion";
import gsap from "gsap";
import { useLanguage } from "@/i18n/LanguageContext";

export default function Footer() {
  const { t } = useLanguage();
  const footerRef = useRef<HTMLDivElement | null>(null);
  const currentYear = new Date().getFullYear();

  // 🎬 Animação de entrada dos elementos do footer
  useEffect(() => {
    if (footerRef.current) {
      gsap.fromTo(
        footerRef.current.children,
        { opacity: 0, y: 30 },
        {
          opacity: 1,
          y: 0,
          duration: 1.2,
          ease: "power3.out",
          stagger: 0.12,
        }
      );
    }
  }, []);

  // 🔗 Links de redes sociais e institucionais
  const links = [
    { name: "TWITTER", url: "https://twitter.com/sevendevx", ariaLabel: "Twitter" },
    { name: "YOUTUBE", url: "https://www.youtube.com/@SevenDevXX", ariaLabel: "YouTube" },
    { name: "INSTAGRAM", url: "https://www.instagram.com/sevendevx", ariaLabel: "Instagram" },
    { name: "LINKEDIN", url: "https://www.linkedin.com/company/sevendevx", ariaLabel: "LinkedIn" },
    { name: t.footer.privacy, url: "/privacy-policy", ariaLabel: t.footer.privacy },
    { name: t.footer.suppliers, url: "/fornecedores", ariaLabel: t.footer.suppliers },
  ];

  // 🧠 Schema.org — Marca semântica para SEO (reconhecida pelo Google)
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "WPFooter",
    name: "SevenDevX Footer",
    url: "https://sevendevx.com",
    copyrightHolder: {
      "@type": "Organization",
      name: "SevenDevX",
      url: "https://sevendevx.com",
      logo: "https://sevendevx.com/assets/img/logo.svg",
    },
    datePublished: "2024-01-10",
    dateModified: new Date().toISOString(),
  };

  return (
    <footer
      ref={footerRef}
      role="contentinfo"
      aria-label="Footer"
      className="relative flex flex-col items-center justify-center py-10 sm:py-12 md:py-14 text-center text-white bg-black"
    >
      {/* 📜 JSON-LD para SEO (injetado no DOM de forma semântica) */}
      <script type="application/ld+json">
        {JSON.stringify(structuredData)}
      </script>

      {/* 🪶 Marca principal */}
      <motion.p
        className="text-xs xs:text-sm tracking-widest text-gray-400 mb-4 sm:mb-6 font-light uppercase select-none"
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
      >
        {t.footer.copyright} © {currentYear}
      </motion.p>

      {/* 🔗 Links sociais e institucionais */}
      <ul
        className="flex flex-wrap justify-center items-center gap-4 xs:gap-5 sm:gap-6 md:gap-8 text-xs xs:text-sm uppercase tracking-wide px-4"
        aria-label="Links"
      >
        {links.map((link, index) => (
          <motion.li
            key={index}
            className="hover:text-gray-400 transition-colors duration-300"
            whileHover={{ scale: 1.05 }}
          >
            <a
              href={link.url}
              target={link.url.startsWith("http") ? "_blank" : "_self"}
              rel={link.url.startsWith("http") ? "noopener noreferrer" : ""}
              aria-label={link.ariaLabel}
            >
              {link.name}
            </a>
          </motion.li>
        ))}
      </ul>

      {/* 🌙 Modo claro/escuro opcional (detecta tema automaticamente) */}
      <style>
        {`
          @media (prefers-color-scheme: light) {
            footer {
              background: #fafafa;
              color: #111;
            }
            footer a {
              color: #222;
            }
            footer a:hover {
              color: #000;
            }
          }
        `}
      </style>
    </footer>
  );
}