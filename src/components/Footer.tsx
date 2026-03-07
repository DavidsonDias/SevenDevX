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
    { name: "BLOG", path: "/blog" },
    { name: t.footer.privacy, path: "/privacy-policy" },
    { name: t.footer.suppliers, path: "/fornecedores" },
  ];

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "SevenDevX",
    url: "https://sevendevx.com",
    logo: "https://sevendevx.com/assets/img/logo.svg",
    sameAs: socialLinks.map(l => l.url),
  };

  return (
    <footer role="contentinfo" aria-label="Footer" className="relative bg-background border-t border-border">
      <script type="application/ld+json">{JSON.stringify(structuredData)}</script>

      <div className="max-w-7xl mx-auto px-6 py-16 md:py-20">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-8 mb-16">
          {/* Brand */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="lg:col-span-1"
          >
            <Link to="/" className="inline-block mb-6">
              <img src={logo} alt="SevenDevX" className="h-10 w-auto" />
            </Link>
            <p className="text-sm text-muted-foreground leading-relaxed max-w-xs">
              Desenvolvimento web com inovação, design e performance. Transformamos visões em experiências digitais.
            </p>
          </motion.div>

          {/* Site Links */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            <h3 className="text-xs uppercase tracking-[0.3em] font-semibold text-foreground mb-6">
              Navegação
            </h3>
            <ul className="space-y-3">
              {siteLinks.map(link => (
                <li key={link.path}>
                  <Link
                    to={link.path}
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors inline-flex items-center gap-1 group"
                  >
                    {link.name}
                    <ArrowUpRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
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
          >
            <h3 className="text-xs uppercase tracking-[0.3em] font-semibold text-foreground mb-6">
              Social
            </h3>
            <ul className="space-y-3">
              {socialLinks.map(link => (
                <li key={link.name}>
                  <a
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors inline-flex items-center gap-1 group"
                  >
                    {link.name}
                    <ArrowUpRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
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
          >
            <h3 className="text-xs uppercase tracking-[0.3em] font-semibold text-foreground mb-6">
              Contato
            </h3>
            <ul className="space-y-4">
              <li className="flex items-start gap-3">
                <Mail className="w-4 h-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                <a href="mailto:contato@sevendevx.com" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  contato@sevendevx.com
                </a>
              </li>
              <li className="flex items-start gap-3">
                <Phone className="w-4 h-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                <a href="tel:+5531984740625" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  +55 (31) 98474-0625
                </a>
              </li>
              <li className="flex items-start gap-3">
                <MapPin className="w-4 h-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                <span className="text-sm text-muted-foreground">
                  Belo Horizonte, MG — Brasil
                </span>
              </li>
            </ul>
          </motion.div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-border pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-muted-foreground/60 tracking-wider uppercase">
            {t.footer.copyright} © {currentYear}
          </p>
          <p className="text-[10px] text-muted-foreground/30 tracking-[0.3em] uppercase font-mono">
            DESIGNED & BUILT WITH PRECISION
          </p>
        </div>
      </div>
    </footer>
  );
}
