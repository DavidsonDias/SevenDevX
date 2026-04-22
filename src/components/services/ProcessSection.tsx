/**
 * 🧭 ProcessSection — How It Works (Enterprise Premium)
 * - Timeline visual (linha conectora desktop)
 * - Numeração gigante translúcida no fundo
 * - Glow + border animada no hover
 * - Stagger reveal on scroll
 * - 100% i18n via useLanguage()
 */
import { motion, useReducedMotion } from "framer-motion";
import { useLanguage } from "@/i18n/LanguageContext";

const ProcessSection = () => {
  const { t } = useLanguage();
  const reduce = useReducedMotion();
  const steps = t.servicesPage.process.steps;

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
            {t.servicesPage.process.title.split(" ")[0]}
          </span>
          <h2
            id="process-heading"
            className="text-3xl md:text-4xl lg:text-5xl font-bold uppercase tracking-tight mb-4"
          >
            {t.servicesPage.process.title}
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto text-base md:text-lg leading-relaxed">
            {t.servicesPage.process.subtitle}
          </p>
        </motion.div>

        {/* Timeline grid */}
        <div className="relative">
          {/* Linha conectora horizontal (desktop only) */}
          <div
            aria-hidden="true"
            className="hidden lg:block absolute top-[3.25rem] left-0 right-0 h-px bg-gradient-to-r from-transparent via-foreground/20 to-transparent"
          />

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8 relative">
            {steps.map((step, i) => (
              <motion.article
                key={step.n}
                initial={reduce ? false : { opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{ duration: 0.55, delay: reduce ? 0 : i * 0.12, ease: [0.25, 0.46, 0.45, 0.94] }}
                whileHover={reduce ? undefined : { y: -6 }}
                className="group relative"
              >
                {/* Dot na timeline (desktop) */}
                <div
                  aria-hidden="true"
                  className="hidden lg:block absolute top-[3rem] left-1/2 -translate-x-1/2 w-3 h-3 rounded-full bg-primary shadow-[0_0_0_4px_hsl(var(--background)),0_0_20px_hsl(var(--primary)/0.6)] z-10 transition-transform duration-300 group-hover:scale-125"
                />

                <div className="relative h-full p-6 md:p-7 rounded-2xl border border-foreground/10 bg-gradient-to-br from-foreground/[0.04] to-transparent backdrop-blur-sm overflow-hidden transition-all duration-500 group-hover:border-primary/40 group-hover:shadow-[0_20px_60px_-20px_hsl(var(--primary)/0.4)]">
                  {/* Número gigante de fundo */}
                  <span
                    aria-hidden="true"
                    className="absolute -top-4 -right-2 text-[7rem] md:text-[8rem] leading-none font-bold text-foreground/[0.04] select-none pointer-events-none transition-colors duration-500 group-hover:text-primary/10"
                  >
                    {step.n}
                  </span>

                  {/* Conteúdo */}
                  <div className="relative z-10">
                    <div className="text-xs font-mono uppercase tracking-widest text-primary mb-4">
                      Step {step.n}
                    </div>
                    <h3 className="text-lg md:text-xl font-bold mb-3 leading-tight">
                      {step.t}
                    </h3>
                    <p className="text-sm md:text-[0.95rem] text-muted-foreground leading-relaxed">
                      {step.d}
                    </p>
                  </div>

                  {/* Borda animada (gradient sweep) */}
                  <div
                    aria-hidden="true"
                    className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
                    style={{
                      background:
                        "linear-gradient(135deg, hsl(var(--primary)/0.08) 0%, transparent 60%)",
                    }}
                  />
                </div>
              </motion.article>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default ProcessSection;
