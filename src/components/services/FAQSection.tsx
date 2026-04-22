/**
 * ❓ FAQSection — Enterprise FAQ (Accordion premium + JSON-LD)
 * - Accordion shadcn (Radix) com 1 aberto por vez (type="single", collapsible)
 * - Animação suave (height + opacity via Radix data attrs)
 * - Acessível (button real, aria-expanded, aria-controls)
 * - JSON-LD FAQPage para SEO dominante
 * - i18n total
 */
import { motion, useReducedMotion } from "framer-motion";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { useLanguage } from "@/i18n/LanguageContext";

const FAQSection = () => {
  const { t } = useLanguage();
  const reduce = useReducedMotion();
  const items = t.servicesPage.faq.items;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((item) => ({
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

      <div className="container mx-auto max-w-4xl relative z-10">
        {/* Heading */}
        <motion.div
          initial={reduce ? false : { opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12 md:mb-16"
        >
          <span className="inline-block text-xs md:text-sm font-mono uppercase tracking-[0.3em] text-primary mb-4">
            FAQ
          </span>
          <h2
            id="faq-heading"
            className="text-3xl md:text-4xl lg:text-5xl font-bold uppercase tracking-tight mb-4"
          >
            {t.servicesPage.faq.title}
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto text-base md:text-lg leading-relaxed">
            {t.servicesPage.faq.subtitle}
          </p>
        </motion.div>

        {/* Accordion */}
        <motion.div
          initial={reduce ? false : { opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.1 }}
          transition={{ duration: 0.6, delay: 0.1 }}
        >
          <Accordion type="single" collapsible className="space-y-4">
            {items.map((item, i) => (
              <AccordionItem
                key={i}
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
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
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
