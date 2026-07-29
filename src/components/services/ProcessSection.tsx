/**
 * ProcessSection.tsx — SevenDevX
 * ─────────────────────────────────────────────────────────────────────
 * @file src/components/services/ProcessSection.tsx
 * @module Public/Services
 *
 * @description
 * Linha do tempo do processo de trabalho.
 *
 * @see docs/architecture/MODULE_MAP.md
 * ─────────────────────────────────────────────────────────────────────
 */

/**
 * 🧭 ProcessSection — How It Works (Enterprise v3.0)
 * - 6 etapas expansíveis (Descoberta → Lançamento)
 * - Reveal de entregáveis, duração e ferramentas
 * - Timeline visual + numeração gigante translúcida
 * - Tracking: process_expand, process_step_focus, process_cta_click
 * - 100% i18n + a11y (button real, aria-expanded)
 */
import { useState, useCallback, useMemo } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { ChevronDown, Clock, Package, Wrench, ArrowRight } from "lucide-react";
import { useLanguage } from "@/i18n/LanguageContext";
import { useAnalytics } from "@/hooks/useAnalytics";
import { useDefaultProcessTemplate } from "@/hooks/useEcosystem";

const ProcessSection = () => {
  const { t } = useLanguage();
  const { trackEvent } = useAnalytics();
  const reduce = useReducedMotion();
  const data = t.servicesPage.process;
  const { data: tpl } = useDefaultProcessTemplate();

  // DB-first hybrid: build steps from process_template_stages, fallback to i18n
  const steps = useMemo(() => {
    const dbStages = (tpl?.stages || []).filter((s: any) => s.is_visible_on_site !== false);
    if (dbStages.length > 0) {
      return dbStages.map((s: any, i: number) => {
        // Try to merge with same-index i18n step for labels we don't have in DB
        const fallback: any = data.steps[i] || data.steps[0] || {};
        const deliverables = (s.default_deliverables as any[]) || [];
        return {
          n: String(i + 1).padStart(2, "0"),
          t: s.name,
          d: s.description || fallback.d || "",
          duration: fallback.duration || "",
          deliverables: deliverables.length > 0
            ? deliverables.map((d: any) => (typeof d === "string" ? d : d.title || d.name || ""))
            : (fallback.deliverables || []),
          tools: fallback.tools || [],
          cta: fallback.cta || data.deliverablesLabel,
        };
      });
    }
    return data.steps;
  }, [tpl, data]);

  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const handleToggle = useCallback(
    (i: number, n: string) => {
      const willOpen = openIndex !== i;
      setOpenIndex(willOpen ? i : null);
      if (willOpen) {
        trackEvent({
          event_type: "process_expand",
          event_data: { step: n, index: i },
        });
      }
    },
    [openIndex, trackEvent]
  );

  const handleCtaClick = useCallback(
    (n: string, cta: string) => {
      trackEvent({
        event_type: "process_cta_click",
        event_data: { step: n, cta },
      });
    },
    [trackEvent]
  );

  return (
    <section
      className="relative py-24 md:py-32 px-4 md:px-8 lg:px-16 bg-background overflow-hidden"
      aria-labelledby="process-heading"
      role="region"
    >
      {/* Decorative glow */}
      <div
        aria-hidden="true"
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[60rem] h-[60rem] rounded-full bg-primary/5 blur-3xl pointer-events-none"
      />

      <div className="container mx-auto relative z-10">
        {/* Heading */}
        <motion.div
          initial={reduce ? false : { opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16 md:mb-20"
        >
          <span className="inline-block text-xs md:text-sm font-mono uppercase tracking-[0.3em] text-primary mb-4">
            METHOD
          </span>
          <h2
            id="process-heading"
            className="text-3xl md:text-4xl lg:text-5xl font-bold uppercase tracking-tight mb-4"
          >
            {data.title}
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto text-base md:text-lg leading-relaxed">
            {data.subtitle}
          </p>
        </motion.div>

        {/* Timeline (vertical em mobile, grid em desktop pequeno, lista expansível em todos) */}
        <div className="relative max-w-5xl mx-auto">
          {/* Linha conectora vertical */}
          <div
            aria-hidden="true"
            className="absolute left-6 md:left-8 top-0 bottom-0 w-px bg-gradient-to-b from-transparent via-foreground/15 to-transparent"
          />

          <ul className="space-y-4 md:space-y-6">
            {steps.map((step, i) => {
              const isOpen = openIndex === i;
              return (
                <motion.li
                  key={step.n}
                  initial={reduce ? false : { opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.15 }}
                  transition={{
                    duration: 0.5,
                    delay: reduce ? 0 : i * 0.08,
                    ease: [0.25, 0.46, 0.45, 0.94],
                  }}
                  className="relative pl-16 md:pl-20"
                >
                  {/* Dot na timeline */}
                  <div
                    aria-hidden="true"
                    className={`absolute left-3 md:left-5 top-7 w-6 h-6 rounded-full border-2 transition-all duration-300 ${
                      isOpen
                        ? "bg-primary border-primary shadow-[0_0_0_6px_hsl(var(--background)),0_0_24px_hsl(var(--primary)/0.6)]"
                        : "bg-background border-foreground/30 group-hover:border-primary/60"
                    }`}
                  />

                  <div
                    className={`group relative rounded-2xl border bg-gradient-to-br from-foreground/[0.04] to-transparent backdrop-blur-sm overflow-hidden transition-all duration-500 ${
                      isOpen
                        ? "border-primary/40 shadow-[0_20px_60px_-20px_hsl(var(--primary)/0.4)]"
                        : "border-foreground/10 hover:border-primary/30"
                    }`}
                  >
                    {/* Número gigante de fundo */}
                    <span
                      aria-hidden="true"
                      className={`absolute -top-4 -right-2 text-[7rem] md:text-[9rem] leading-none font-bold select-none pointer-events-none transition-colors duration-500 ${
                        isOpen ? "text-primary/10" : "text-foreground/[0.04]"
                      }`}
                    >
                      {step.n}
                    </span>

                    {/* Header clicável */}
                    <button
                      type="button"
                      onClick={() => handleToggle(i, step.n)}
                      aria-expanded={isOpen}
                      aria-controls={`process-panel-${i}`}
                      className="relative z-10 w-full text-left p-5 md:p-7 flex items-start gap-4 md:gap-6 cursor-pointer"
                    >
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 mb-2 flex-wrap">
                          <span className="text-xs font-mono uppercase tracking-widest text-primary">
                            Step {step.n}
                          </span>
                          <span className="inline-flex items-center gap-1.5 text-xs font-mono text-muted-foreground bg-foreground/5 px-2 py-0.5 rounded-full">
                            <Clock className="w-3 h-3" />
                            {step.duration}
                          </span>
                        </div>
                        <h3 className="text-lg md:text-xl font-bold mb-2 leading-tight">
                          {step.t}
                        </h3>
                        <p className="text-sm md:text-[0.95rem] text-muted-foreground leading-relaxed pr-6">
                          {step.d}
                        </p>
                      </div>
                      <motion.div
                        animate={{ rotate: isOpen ? 180 : 0 }}
                        transition={{ duration: 0.3 }}
                        className="shrink-0 mt-1 w-9 h-9 rounded-full border border-foreground/15 flex items-center justify-center text-foreground/70 group-hover:border-primary/50 group-hover:text-primary transition-colors"
                      >
                        <ChevronDown className="w-4 h-4" />
                      </motion.div>
                    </button>

                    {/* Painel expansível */}
                    <AnimatePresence initial={false}>
                      {isOpen && (
                        <motion.div
                          id={`process-panel-${i}`}
                          key="panel"
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{
                            height: { duration: 0.35, ease: [0.4, 0, 0.2, 1] },
                            opacity: { duration: 0.25, delay: 0.05 },
                          }}
                          className="relative z-10 overflow-hidden"
                        >
                          <div className="px-5 md:px-7 pb-6 md:pb-7 pt-2 grid gap-6 md:grid-cols-2">
                            {/* Entregáveis */}
                            <div>
                              <h4 className="flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-primary mb-3">
                                <Package className="w-3.5 h-3.5" />
                                {data.deliverablesLabel}
                              </h4>
                              <ul className="space-y-1.5">
                                {step.deliverables.map((d) => (
                                  <li
                                    key={d}
                                    className="text-sm text-muted-foreground flex items-start gap-2"
                                  >
                                    <span
                                      aria-hidden="true"
                                      className="mt-1.5 w-1 h-1 rounded-full bg-primary shrink-0"
                                    />
                                    {d}
                                  </li>
                                ))}
                              </ul>
                            </div>

                            {/* Ferramentas */}
                            <div>
                              <h4 className="flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-primary mb-3">
                                <Wrench className="w-3.5 h-3.5" />
                                {data.toolsLabel}
                              </h4>
                              <div className="flex flex-wrap gap-2">
                                {step.tools.map((tool) => (
                                  <span
                                    key={tool}
                                    className="text-xs font-mono px-2.5 py-1 rounded-full border border-foreground/15 bg-foreground/5 text-foreground/80"
                                  >
                                    {tool}
                                  </span>
                                ))}
                              </div>

                              {/* CTA por etapa */}
                              <a
                                href="#contact"
                                onClick={() => handleCtaClick(step.n, step.cta)}
                                className="inline-flex items-center gap-2 mt-5 text-sm font-semibold text-primary hover:text-primary/80 transition-colors group/cta"
                              >
                                {step.cta}
                                <ArrowRight className="w-4 h-4 transition-transform group-hover/cta:translate-x-1" />
                              </a>
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </motion.li>
              );
            })}
          </ul>
        </div>
      </div>
    </section>
  );
};

export default ProcessSection;
