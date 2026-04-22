/**
 * ❓ FAQSection — Enterprise v3.0 (Categorizado + Search + Tracking)
 * - 6 categorias: Investimento, Prazo, Processo, Tecnologia, Segurança, Pós-Entrega
 * - Filtro por categoria + busca em tempo real
 * - Accordion (1 aberto por vez) + tracking (faq_open, faq_search, faq_cta_click)
 * - JSON-LD FAQPage com TODAS as perguntas (SEO dominante)
 * - i18n total + a11y completo
 */
import { useState, useMemo, useCallback } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { Search, MessageCircle, ArrowRight } from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { useLanguage } from "@/i18n/LanguageContext";
import { useAnalytics } from "@/hooks/useAnalytics";

const FAQSection = () => {
  const { t } = useLanguage();
  const { trackEvent } = useAnalytics();
  const reduce = useReducedMotion();
  const data = t.servicesPage.faq;

  const [activeCategory, setActiveCategory] = useState<string>("all");
  const [search, setSearch] = useState("");

  // Flatten all items para JSON-LD e busca global
  const allItems = useMemo(
    () =>
      data.categories.flatMap((cat) =>
        cat.items.map((it) => ({ ...it, categoryId: cat.id, categoryLabel: cat.label }))
      ),
    [data.categories]
  );

  // Items filtrados (categoria + busca)
  const filteredItems = useMemo(() => {
    const term = search.trim().toLowerCase();
    return allItems.filter((it) => {
      const matchCat = activeCategory === "all" || it.categoryId === activeCategory;
      const matchSearch =
        !term ||
        it.q.toLowerCase().includes(term) ||
        it.a.toLowerCase().includes(term);
      return matchCat && matchSearch;
    });
  }, [allItems, activeCategory, search]);

  const handleSearchChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value;
      setSearch(value);
      if (value.length >= 3) {
        trackEvent({
          event_type: "faq_search",
          event_data: { term: value, category: activeCategory },
        });
      }
    },
    [activeCategory, trackEvent]
  );

  const handleAccordionChange = useCallback(
    (value: string) => {
      if (value) {
        const [, idxStr] = value.split("-");
        const idx = parseInt(idxStr, 10);
        const item = filteredItems[idx];
        if (item) {
          trackEvent({
            event_type: "faq_open",
            event_data: { question: item.q, category: item.categoryId },
          });
        }
      }
    },
    [filteredItems, trackEvent]
  );

  const handleCtaClick = useCallback(() => {
    trackEvent({ event_type: "faq_cta_click", event_data: { source: "faq_bottom" } });
  }, [trackEvent]);

  // JSON-LD FAQPage com TODAS perguntas
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: allItems.map((item) => ({
      "@type": "Question",
      name: item.q,
      acceptedAnswer: { "@type": "Answer", text: item.a },
    })),
  };

  return (
    <section
      className="relative py-24 md:py-32 px-4 md:px-8 lg:px-16 bg-background overflow-hidden"
      aria-labelledby="faq-heading"
      role="region"
    >
      {/* Glow decorativo */}
      <div
        aria-hidden="true"
        className="absolute top-0 right-0 w-[40rem] h-[40rem] rounded-full bg-primary/5 blur-3xl pointer-events-none"
      />
      <div
        aria-hidden="true"
        className="absolute bottom-0 left-0 w-[30rem] h-[30rem] rounded-full bg-primary/5 blur-3xl pointer-events-none"
      />

      <div className="container mx-auto max-w-5xl relative z-10">
        {/* Heading */}
        <motion.div
          initial={reduce ? false : { opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12 md:mb-14"
        >
          <span className="inline-block text-xs md:text-sm font-mono uppercase tracking-[0.3em] text-primary mb-4">
            FAQ
          </span>
          <h2
            id="faq-heading"
            className="text-3xl md:text-4xl lg:text-5xl font-bold uppercase tracking-tight mb-4"
          >
            {data.title}
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto text-base md:text-lg leading-relaxed">
            {data.subtitle}
          </p>
        </motion.div>

        {/* Search bar */}
        <motion.div
          initial={reduce ? false : { opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.5, delay: 0.05 }}
          className="relative max-w-xl mx-auto mb-8"
        >
          <Search
            aria-hidden="true"
            className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground"
          />
          <input
            type="search"
            value={search}
            onChange={handleSearchChange}
            placeholder={data.searchPlaceholder}
            aria-label={data.searchPlaceholder}
            className="w-full h-12 pl-11 pr-4 rounded-full border border-foreground/15 bg-foreground/[0.03] backdrop-blur-sm text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/20 transition-all"
          />
        </motion.div>

        {/* Category filters */}
        <motion.div
          initial={reduce ? false : { opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="flex flex-wrap justify-center gap-2 mb-10 md:mb-12"
          role="tablist"
          aria-label="FAQ categories"
        >
          <button
            type="button"
            role="tab"
            aria-selected={activeCategory === "all"}
            onClick={() => setActiveCategory("all")}
            className={`px-4 py-2 rounded-full text-xs md:text-sm font-medium transition-all border ${
              activeCategory === "all"
                ? "bg-primary text-primary-foreground border-primary shadow-[0_4px_20px_-4px_hsl(var(--primary)/0.5)]"
                : "border-foreground/15 text-muted-foreground hover:border-primary/40 hover:text-foreground"
            }`}
          >
            {data.allLabel} ({allItems.length})
          </button>
          {data.categories.map((cat) => (
            <button
              key={cat.id}
              type="button"
              role="tab"
              aria-selected={activeCategory === cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`px-4 py-2 rounded-full text-xs md:text-sm font-medium transition-all border inline-flex items-center gap-1.5 ${
                activeCategory === cat.id
                  ? "bg-primary text-primary-foreground border-primary shadow-[0_4px_20px_-4px_hsl(var(--primary)/0.5)]"
                  : "border-foreground/15 text-muted-foreground hover:border-primary/40 hover:text-foreground"
              }`}
            >
              <span aria-hidden="true">{cat.icon}</span>
              {cat.label}
            </button>
          ))}
        </motion.div>

        {/* Accordion */}
        <motion.div
          key={activeCategory + search}
          initial={reduce ? false : { opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          {filteredItems.length === 0 ? (
            <p className="text-center text-muted-foreground py-12">{data.noResults}</p>
          ) : (
            <Accordion
              type="single"
              collapsible
              className="space-y-4"
              onValueChange={handleAccordionChange}
            >
              {filteredItems.map((item, i) => (
                <AccordionItem
                  key={`${item.categoryId}-${i}-${item.q}`}
                  value={`item-${i}`}
                  className="group rounded-2xl border border-foreground/10 bg-gradient-to-br from-foreground/[0.04] to-transparent backdrop-blur-sm px-5 md:px-6 transition-all duration-300 hover:border-primary/30 data-[state=open]:border-primary/40 data-[state=open]:shadow-[0_10px_40px_-10px_hsl(var(--primary)/0.3)]"
                >
                  <AccordionTrigger className="text-left text-base md:text-lg font-semibold py-5 md:py-6 hover:no-underline gap-4 [&[data-state=open]]:text-primary transition-colors">
                    <span className="flex items-start gap-3 md:gap-4 flex-1">
                      <span className="text-xs md:text-sm font-mono text-primary/70 mt-1 shrink-0">
                        {String(i + 1).padStart(2, "0")}
                      </span>
                      <span className="leading-snug">{item.q}</span>
                    </span>
                  </AccordionTrigger>
                  <AccordionContent className="text-sm md:text-base text-muted-foreground leading-relaxed pb-6 pl-9 md:pl-11 pr-2">
                    {item.a}
                    <div className="mt-3 inline-flex items-center gap-1.5 text-[0.7rem] font-mono uppercase tracking-wider text-primary/70">
                      <span aria-hidden="true">#</span>
                      {item.categoryLabel}
                    </div>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          )}
        </motion.div>

        {/* CTA pós-FAQ */}
        <motion.div
          initial={reduce ? false : { opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="mt-16 md:mt-20 text-center rounded-3xl border border-primary/20 bg-gradient-to-br from-primary/[0.06] via-foreground/[0.02] to-transparent backdrop-blur-sm p-8 md:p-12"
        >
          <MessageCircle
            aria-hidden="true"
            className="w-10 h-10 md:w-12 md:h-12 text-primary mx-auto mb-5"
          />
          <h3 className="text-xl md:text-2xl font-bold mb-3">{data.ctaTitle}</h3>
          <p className="text-muted-foreground max-w-md mx-auto mb-6 text-sm md:text-base">
            {data.ctaSubtitle}
          </p>
          <a
            href="#contact"
            onClick={handleCtaClick}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 transition-all shadow-[0_8px_30px_-8px_hsl(var(--primary)/0.5)] hover:shadow-[0_12px_40px_-8px_hsl(var(--primary)/0.7)] hover:-translate-y-0.5"
          >
            {data.ctaButton}
            <ArrowRight className="w-4 h-4" />
          </a>
        </motion.div>
      </div>

      {/* JSON-LD FAQPage Schema */}
      <script
        type="application/ld+json"
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
    </section>
  );
};

export default FAQSection;
