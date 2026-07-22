import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowUpRight, Mail, MapPin, Phone } from "lucide-react";
import { useLanguage } from "@/i18n/LanguageContext";
import logo from "@/assets/logo.svg";

export default function Footer() {
  const { t } = useLanguage();
  const currentYear = new Date().getFullYear();

  const socialLinks = [
    { name: "TWITTER", url: "https://twitter.com/sevendevx" },
    { name: "YOUTUBE", url: "https://www.youtube.com/@SevenDevXX" },
    { name: "INSTAGRAM", url: "https://www.instagram.com/sevendevx" },
    { name: "LINKEDIN", url: "https://www.linkedin.com/company/sevendevx" },
  ];

  const siteLinks = [
    { name: t.header.about, path: "/about" },
    { name: t.header.services, path: "/services" },
    { name: t.header.projects, path: "/projects" },
    { name: "CASES", path: "/cases" },
    { name: "BLOG", path: "/blog" },
    { name: "AI HUB", path: "/ai" },
    { name: "SOLUÇÕES", path: "/solucoes" },
    { name: "CRIAÇÃO DE SITES", path: "/criacao-de-sites-profissionais" },
    { name: "ANSWERS", path: "/answers" },
    { name: "CLUSTERS", path: "/clusters" },
    { name: t.footer.privacy, path: "/privacy-policy" },
    { name: t.footer.suppliers, path: "/fornecedores" },
  ];

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "SevenDevX",
    url: "https://sevendevx.com",
    logo: "https://sevendevx.com/assets/img/logo.svg",
    sameAs: socialLinks.map((link) => link.url),
  };

  return (
    <footer
      role="contentinfo"
      aria-label="Footer"
      className="relative border-t border-border bg-background"
    >
      <script type="application/ld+json">
        {JSON.stringify(structuredData)}
      </script>

      <div className="mx-auto max-w-7xl px-6 py-16 md:py-20">
        <div className="mb-16 grid grid-cols-2 gap-12 md:grid-cols-2 lg:grid-cols-12 lg:gap-8">
          {/* Brand */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="col-span-2 text-center md:col-span-1 md:text-left lg:col-span-3"
          >
            <Link to="/" className="mb-6 inline-block">
              <img 
                src={logo} 
                alt="SevenDevX" 
                className="mx-auto h-10 w-auto md:mx-0" />
            </Link>

            <p className="mx-auto max-w-xs text-sm leading-relaxed text-muted-foreground md:mx-0">
              Desenvolvimento web com inovação, design e performance.
              Transformamos visões em experiências digitais.
            </p>

            <p className="mx-auto mt-2 max-w-xs text-sm leading-relaxed text-muted-foreground md:mx-0">
              • Codificando o amanhã, hoje!
            </p>
          </motion.div>

          {/* Navigation */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="col-span-2 md:col-span-1 lg:col-span-4"
          >
            <h3 className="mb-6 text-xs font-semibold uppercase tracking-[0.3em] text-foreground">
              Navegação
            </h3>
            {/* Links */}
            <ul className="grid grid-cols-2 gap-x-8 gap-y-3">
              {siteLinks.map((link) => (
                <li key={link.path}>
                  <Link
                    to={link.path}
                    className="group inline-flex items-start gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
                  >
                    <span>{link.name}</span>

                    <ArrowUpRight className="mt-0.5 h-3 w-3 shrink-0 opacity-0 transition-opacity group-hover:opacity-100" />
                  </Link>
                </li>
              ))}
            </ul>
          </motion.div>

          {/* Social */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="col-span-1 lg:col-span-2"
          >
            <h3 className="mb-6 text-xs font-semibold uppercase tracking-[0.3em] text-foreground">
              Social
            </h3>

            <ul className="space-y-3">
              {socialLinks.map((link) => (
                <li key={link.name}>
                  <a
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group inline-flex items-center gap-1 text-sm text-muted-foreground transition-colors hover:text-foreground"
                  >
                    {link.name}

                    <ArrowUpRight className="h-3 w-3 opacity-0 transition-opacity group-hover:opacity-100" />
                  </a>
                </li>
              ))}
            </ul>
          </motion.div>

          {/* Contact Info */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="col-span-1 lg:col-span-3"
          >
            <h3 className="mb-6 text-xs font-semibold uppercase tracking-[0.3em] text-foreground">
              Contato
            </h3>

            <ul className="space-y-4">
              <li className="flex items-start gap-3">
                <Mail className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />

                <a
                  href="mailto:contato@sevendevx.com"
                  className="break-all text-sm text-muted-foreground transition-colors hover:text-foreground"
                >
                  contato@sevendevx.com
                </a>
              </li>

              <li className="flex items-start gap-3">
                <Phone className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />

                <a
                  href="tel:+5531984740625"
                  className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                >
                  +55 (31) 98474-0625
                </a>
              </li>

              <li className="flex items-start gap-3">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />

                <span className="text-sm text-muted-foreground">
                  Belo Horizonte, MG — Brasil
                </span>
              </li>
            </ul>
          </motion.div>
        </div>

        {/* Bottom Bar */}
        <div className="flex flex-col items-center justify-between gap-4 border-t border-border pt-8 sm:flex-row">
          <p className="text-xs uppercase tracking-wider text-muted-foreground/60">
            {t.footer.copyright} © {currentYear}
          </p>

          <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-muted-foreground/30">
            DESIGNED & BUILT WITH PRECISION
          </p>
        </div>
      </div>
    </footer>
  );
}
