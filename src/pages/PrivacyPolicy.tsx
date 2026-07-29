/**
 * PrivacyPolicy.tsx — SevenDevX
 * ─────────────────────────────────────────────────────────────────────
 * @file src/pages/PrivacyPolicy.tsx
 * @module Public
 * @route /privacy-policy
 *
 * @description
 * Política de privacidade.
 *
 * @see src/pages/README.md
 * ─────────────────────────────────────────────────────────────────────
 */

/**
 * 🧩 PrivacyPolicy.tsx — SevenDevX v1.0 PRO++ (i18n)
 * -------------------------------------------------------------
 * ✅ Versão mesclada e otimizada - Conteúdo expandido LGPD
 * ✅ SEO dinâmico integrado via <SEOHead />
 * ✅ Estrutura responsiva, semântica e mobile-first
 * ✅ Conformidade total com LGPD e boas práticas de acessibilidade
 * ✅ Design consistente com o sistema global (index.css v1.5)
 * ✅ Código limpo, modular e com animações suaves (Framer Motion)
 * -------------------------------------------------------------
 */

import { motion } from "framer-motion";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import SEOHead from "@/components/SEOHead";
import { useLanguage } from "@/i18n/LanguageContext";

const PrivacyPolicy = () => {
  const { t, language } = useLanguage();

  // Formatação da data de última atualização baseada no idioma
  const getFormattedDate = () => {
    const date = new Date();
    const localeMap = { pt: "pt-BR", en: "en-US", es: "es-ES" };
    return date.toLocaleDateString(localeMap[language], {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  return (
    <>
      <SEOHead
        title={`${t.privacy.title} - SevenDevX`}
        description={t.privacy.intro.slice(0, 160)}
        keywords="política de privacidade, LGPD, proteção de dados, privacidade, SevenDevX, segurança digital"
        url="https://www.sevendevx.com/privacy-policy"
        type="article"
      />

      <div className="min-h-screen bg-background text-foreground">
        <Header />

        <main
          id="main-content"
          className="pt-20 focus:outline-none"
          tabIndex={-1}
          aria-label={t.privacy.title}
        >
          <section className="py-20 md:py-32">
            <div className="container mx-auto px-6 max-w-4xl">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
              >
                {/* Título principal */}
                <h1 className="text-4xl md:text-6xl font-bold mb-8 uppercase tracking-tight text-center">
                  {t.privacy.title}
                </h1>

                {/* Introdução */}
                <div className="mb-16 text-center">
                  <p className="text-muted-foreground text-lg leading-relaxed max-w-3xl mx-auto">
                    {t.privacy.intro}
                  </p>
                </div>

                {/* Conteúdo da política */}
                <div className="space-y-12 text-muted-foreground leading-relaxed">
                  
                  {/* Seção 1 - Compromisso */}
                  <section>
                    <h2 className="text-2xl font-bold mb-4 text-foreground uppercase tracking-tight">
                      {t.privacy.sections.commitment.title}
                    </h2>
                    <p>{t.privacy.sections.commitment.content}</p>
                  </section>

                  {/* Seção 2 - Dados Coletados */}
                  <section>
                    <h2 className="text-2xl font-bold mb-4 text-foreground uppercase tracking-tight">
                      {t.privacy.sections.dataCollected.title}
                    </h2>
                    <div className="mb-4">
                      <h3 className="text-xl font-semibold mb-3 text-foreground/90">
                        {t.privacy.sections.dataCollected.dataLabel}
                      </h3>
                      <ul className="list-disc list-inside space-y-2 ml-4">
                        {t.privacy.sections.dataCollected.dataItems.map((item, i) => (
                          <li key={i}>{item}</li>
                        ))}
                      </ul>
                    </div>
                    <div className="mt-6">
                      <h3 className="text-xl font-semibold mb-3 text-foreground/90">
                        {t.privacy.sections.dataCollected.purposesLabel}
                      </h3>
                      <ul className="list-disc list-inside space-y-2 ml-4">
                        {t.privacy.sections.dataCollected.purposes.map((item, i) => (
                          <li key={i}>{item}</li>
                        ))}
                      </ul>
                    </div>
                  </section>

                  {/* Seção 3 - Bases Legais */}
                  <section>
                    <h2 className="text-2xl font-bold mb-4 text-foreground uppercase tracking-tight">
                      {t.privacy.sections.legalBasis.title}
                    </h2>
                    <p className="mb-4">{t.privacy.sections.legalBasis.content}</p>
                    <ul className="list-disc list-inside space-y-2 ml-4">
                      {t.privacy.sections.legalBasis.items.map((item, i) => (
                        <li key={i}>{item}</li>
                      ))}
                    </ul>
                  </section>

                  {/* Seção 4 - Como Coletamos */}
                  <section>
                    <h2 className="text-2xl font-bold mb-4 text-foreground uppercase tracking-tight">
                      {t.privacy.sections.collection.title}
                    </h2>
                    <p className="mb-4">{t.privacy.sections.collection.content}</p>
                    <ul className="list-disc list-inside space-y-2 ml-4">
                      {t.privacy.sections.collection.items.map((item, i) => (
                        <li key={i}>{item}</li>
                      ))}
                    </ul>
                  </section>

                  {/* Seção 5 - Compartilhamento */}
                  <section>
                    <h2 className="text-2xl font-bold mb-4 text-foreground uppercase tracking-tight">
                      {t.privacy.sections.sharing.title}
                    </h2>
                    <p className="mb-4">{t.privacy.sections.sharing.content}</p>
                    <ul className="list-disc list-inside space-y-2 ml-4">
                      {t.privacy.sections.sharing.items.map((item, i) => (
                        <li key={i}>{item}</li>
                      ))}
                    </ul>
                  </section>

                  {/* Seção 6 - Armazenamento */}
                  <section>
                    <h2 className="text-2xl font-bold mb-4 text-foreground uppercase tracking-tight">
                      {t.privacy.sections.storage.title}
                    </h2>
                    <p>{t.privacy.sections.storage.content}</p>
                  </section>

                  {/* Seção 7 - Segurança */}
                  <section>
                    <h2 className="text-2xl font-bold mb-4 text-foreground uppercase tracking-tight">
                      {t.privacy.sections.security.title}
                    </h2>
                    <p>{t.privacy.sections.security.content}</p>
                  </section>

                  {/* Seção 8 - Crianças */}
                  <section>
                    <h2 className="text-2xl font-bold mb-4 text-foreground uppercase tracking-tight">
                      {t.privacy.sections.children.title}
                    </h2>
                    <p>{t.privacy.sections.children.content}</p>
                  </section>

                  {/* Seção 9 - Direitos */}
                  <section>
                    <h2 className="text-2xl font-bold mb-4 text-foreground uppercase tracking-tight">
                      {t.privacy.sections.rights.title}
                    </h2>
                    <p className="mb-4">{t.privacy.sections.rights.content}</p>
                    <ul className="list-disc list-inside space-y-2 ml-4">
                      {t.privacy.sections.rights.items.map((item, i) => (
                        <li key={i}>{item}</li>
                      ))}
                    </ul>
                    <p className="mt-6 mb-2">{t.privacy.sections.rights.contactPrompt}</p>
                    <div className="space-y-2">
                      <p>
                        📧{" "}
                        <a
                          href="mailto:contato@sevendevx.com"
                          className="text-primary hover:underline transition-colors"
                        >
                          contato@sevendevx.com
                        </a>
                      </p>
                      <p>
                        💬{" "}
                        <a
                          href="https://wa.me/5531984740625"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-primary hover:underline transition-colors"
                        >
                          (31) 98474-0625
                        </a>
                      </p>
                    </div>
                  </section>

                  {/* Seção 10 - Cookies */}
                  <section>
                    <h2 className="text-2xl font-bold mb-4 text-foreground uppercase tracking-tight">
                      {t.privacy.sections.cookies.title}
                    </h2>
                    <p>{t.privacy.sections.cookies.content}</p>
                  </section>

                  {/* Seção 11 - Alterações */}
                  <section>
                    <h2 className="text-2xl font-bold mb-4 text-foreground uppercase tracking-tight">
                      {t.privacy.sections.changes.title}
                    </h2>
                    <p>{t.privacy.sections.changes.content}</p>
                  </section>

                  {/* Seção 12 - Contato */}
                  <section>
                    <h2 className="text-2xl font-bold mb-4 text-foreground uppercase tracking-tight">
                      {t.privacy.sections.contact.title}
                    </h2>
                    <p className="mb-4">{t.privacy.sections.contact.content}</p>
                    <ul className="space-y-2">
                      <li>
                        <strong>{t.privacy.sections.contact.companyName}</strong>
                      </li>
                      <li>📍 {t.privacy.sections.contact.location}</li>
                      <li>
                        📧{" "}
                        <a
                          href="mailto:contato@sevendevx.com"
                          className="text-primary hover:underline transition-colors"
                        >
                          contato@sevendevx.com
                        </a>
                      </li>
                      <li>
                        📱{" "}
                        <a
                          href="https://wa.me/5531984740625"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-primary hover:underline transition-colors"
                        >
                          (31) 98474-0625
                        </a>
                      </li>
                    </ul>
                  </section>

                  {/* Rodapé da política */}
                  <div className="pt-8 mt-8 border-t border-border">
                    <p className="text-sm text-muted-foreground/70 text-center tracking-wider uppercase">
                      🔐 {t.privacy.lastUpdate}: {getFormattedDate()}
                    </p>
                  </div>
                </div>
              </motion.div>
            </div>
          </section>
        </main>

        <Footer />
      </div>
    </>
  );
};

export default PrivacyPolicy;

