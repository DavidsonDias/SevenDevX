import { useEffect, useRef, useState } from "react";
import { useAnalytics } from "@/hooks/useAnalytics";
import { motion, useInView } from "framer-motion";
import { useLanguage } from "@/i18n/LanguageContext";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import SEOHead from "@/components/SEOHead";
import ServiceCard3D from "@/components/ServiceCard3D";
import {
  Target, Eye, Heart, Rocket, Users, Award, CheckCircle, Calendar,
  Code, Globe, Zap, TrendingUp
} from "lucide-react";

// ─── Animated Counter Hook ───
const useCounter = (target: number, isInView: boolean, duration = 2000) => {
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (!isInView) return;
    let start = 0;
    const step = target / (duration / 16);
    const timer = setInterval(() => {
      start += step;
      if (start >= target) { setCount(target); clearInterval(timer); }
      else setCount(Math.floor(start));
    }, 16);
    return () => clearInterval(timer);
  }, [isInView, target, duration]);
  return count;
};

// ─── Stats Counter Component ───
const StatCounter = ({ value, suffix, label, icon: Icon }: { value: number; suffix: string; label: string; icon: any }) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });
  const count = useCounter(value, isInView);
  return (
    <motion.div ref={ref} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
      transition={{ duration: 0.6 }} className="text-center group">
      <div className="w-14 h-14 mx-auto mb-4 bg-foreground/5 border border-border flex items-center justify-center group-hover:bg-foreground/10 transition-colors">
        <Icon className="w-6 h-6 text-foreground/70" />
      </div>
      <div className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight mb-1">
        {count}{suffix}
      </div>
      <div className="text-xs sm:text-sm text-muted-foreground uppercase tracking-widest">{label}</div>
    </motion.div>
  );
};

const About = () => {
  const { t, language } = useLanguage();
  useAnalytics();

  useEffect(() => { window.scrollTo(0, 0); }, []);

  const timelineItems = t.aboutPage.timeline.items;
  const values = [
    { icon: Target, ...t.aboutPage.values.items[0] },
    { icon: Heart, ...t.aboutPage.values.items[1] },
    { icon: Users, ...t.aboutPage.values.items[2] },
    { icon: Award, ...t.aboutPage.values.items[3] },
    { icon: Rocket, ...t.aboutPage.values.items[4] },
    { icon: CheckCircle, ...t.aboutPage.values.items[5] },
  ];

  const seoTitles: Record<string, string> = {
    pt: "Sobre Nós | SevenDevX - Nossa História e Valores",
    en: "About Us | SevenDevX - Our Story and Values",
    es: "Sobre Nosotros | SevenDevX - Nuestra Historia y Valores",
  };
  const seoDescriptions: Record<string, string> = {
    pt: "Conheça a história da SevenDevX, nossa missão, visão e valores.",
    en: "Learn about SevenDevX's story, our mission, vision and values.",
    es: "Conoce la historia de SevenDevX, nuestra misión, visión y valores.",
  };

  const statsData = language === "en"
    ? [
        { value: 50, suffix: "+", label: "Projects Delivered", icon: Code },
        { value: 30, suffix: "+", label: "Happy Clients", icon: Users },
        { value: 99, suffix: "%", label: "Satisfaction", icon: TrendingUp },
        { value: 15, suffix: "+", label: "Technologies", icon: Globe },
      ]
    : language === "es"
    ? [
        { value: 50, suffix: "+", label: "Proyectos Entregados", icon: Code },
        { value: 30, suffix: "+", label: "Clientes Satisfechos", icon: Users },
        { value: 99, suffix: "%", label: "Satisfacción", icon: TrendingUp },
        { value: 15, suffix: "+", label: "Tecnologías", icon: Globe },
      ]
    : [
        { value: 50, suffix: "+", label: "Projetos Entregues", icon: Code },
        { value: 30, suffix: "+", label: "Clientes Atendidos", icon: Users },
        { value: 99, suffix: "%", label: "Satisfação", icon: TrendingUp },
        { value: 15, suffix: "+", label: "Tecnologias", icon: Globe },
      ];

  return (
    <>
      <SEOHead title={seoTitles[language]} description={seoDescriptions[language]} type="website" />
      <div className="min-h-screen bg-background text-foreground">
        <Header />

        {/* Hero */}
        <section className="relative pt-32 pb-20 px-4 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-foreground/5 via-transparent to-transparent" />
          <div className="max-w-6xl mx-auto relative z-10">
            <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="text-center">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 tracking-tight">{t.aboutPage.heroTitle}</h1>
              <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto">{t.aboutPage.heroSubtitle}</p>
            </motion.div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="py-16 px-4 border-y border-border">
          <div className="max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12">
            {statsData.map((stat, i) => (
              <StatCounter key={i} {...stat} />
            ))}
          </div>
        </section>

        {/* Story */}
        <section className="py-16 px-4">
          <div className="max-w-4xl mx-auto">
            <motion.h2 initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
              className="text-3xl md:text-4xl font-bold mb-8 text-center">{t.aboutPage.storyTitle}</motion.h2>
            <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} transition={{ delay: 0.2 }}>
              {t.aboutPage.storyContent.map((p, i) => (
                <p key={i} className="text-muted-foreground mb-4 text-center md:text-left leading-relaxed">{p}</p>
              ))}
            </motion.div>
          </div>
        </section>

        {/* Timeline */}
        <section className="py-20 px-4 bg-card/30">
          <div className="max-w-5xl mx-auto">
            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">{t.aboutPage.timeline.title}</h2>
              <p className="text-muted-foreground text-lg">{t.aboutPage.timeline.subtitle}</p>
            </motion.div>
            <div className="relative">
              <div className="absolute left-4 md:left-1/2 top-0 bottom-0 w-0.5 bg-gradient-to-b from-foreground/30 via-foreground/15 to-foreground/5 transform md:-translate-x-1/2" />
              {timelineItems.map((item, index) => (
                <motion.div key={index}
                  initial={{ opacity: 0, x: index % 2 === 0 ? -50 : 50 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className={`relative flex items-center mb-12 ${index % 2 === 0 ? "md:flex-row" : "md:flex-row-reverse"}`}
                >
                  <div className="absolute left-4 md:left-1/2 w-4 h-4 bg-foreground rounded-full transform md:-translate-x-1/2 z-10 ring-4 ring-background" />
                  <div className={`ml-12 md:ml-0 md:w-1/2 ${index % 2 === 0 ? "md:pr-12 md:text-right" : "md:pl-12"}`}>
                    <div className="bg-card border border-border p-6 hover:border-foreground/20 transition-all group">
                      <div className={`flex items-center gap-3 mb-3 ${index % 2 === 0 ? "md:justify-end" : ""}`}>
                        <Calendar className="w-5 h-5 text-foreground/60" />
                        <span className="text-foreground font-bold text-lg">{item.year}</span>
                      </div>
                      <h3 className="text-xl font-semibold mb-2">{item.title}</h3>
                      <p className="text-muted-foreground">{item.description}</p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Mission & Vision */}
        <section className="py-20 px-4">
          <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-8">
            <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
              className="bg-foreground/5 border border-border p-8 hover:border-foreground/20 transition-all">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-14 h-14 bg-foreground/10 flex items-center justify-center">
                  <Target className="w-7 h-7 text-foreground/70" />
                </div>
                <h2 className="text-2xl md:text-3xl font-bold">{t.aboutPage.mission.title}</h2>
              </div>
              <p className="text-muted-foreground text-lg leading-relaxed">{t.aboutPage.mission.content}</p>
            </motion.div>
            <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.1 }}
              className="bg-foreground/5 border border-border p-8 hover:border-foreground/20 transition-all">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-14 h-14 bg-foreground/10 flex items-center justify-center">
                  <Eye className="w-7 h-7 text-foreground/70" />
                </div>
                <h2 className="text-2xl md:text-3xl font-bold">{t.aboutPage.vision.title}</h2>
              </div>
              <p className="text-muted-foreground text-lg leading-relaxed">{t.aboutPage.vision.content}</p>
            </motion.div>
          </div>
        </section>

        {/* Values */}
        <section className="py-20 px-4 bg-card/30">
          <div className="max-w-6xl mx-auto">
            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">{t.aboutPage.values.title}</h2>
              <p className="text-muted-foreground text-lg max-w-2xl mx-auto">{t.aboutPage.values.subtitle}</p>
            </motion.div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {values.map((value, index) => {
                const Icon = value.icon;
                return (
                  <motion.div key={index} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}>
                    <ServiceCard3D tiltIntensity={8} glowIntensity={0.15} glowColor="255, 255, 255">
                      <div className="bg-card border border-border p-6 hover:border-foreground/20 transition-all group h-full">
                        <div className="w-12 h-12 bg-foreground/5 flex items-center justify-center mb-4 group-hover:bg-foreground/10 transition-colors">
                          <Icon className="w-6 h-6 text-foreground/70" />
                        </div>
                        <h3 className="text-xl font-semibold mb-2">{value.title}</h3>
                        <p className="text-muted-foreground">{value.description}</p>
                      </div>
                    </ServiceCard3D>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-20 px-4">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">{t.aboutPage.cta.title}</h2>
            <p className="text-muted-foreground text-lg mb-8 max-w-2xl mx-auto">{t.aboutPage.cta.subtitle}</p>
            <a href="/#contact"
              className="inline-flex items-center gap-2 border-2 border-foreground px-8 py-4 text-sm tracking-widest uppercase font-semibold hover:bg-foreground hover:text-background transition-all duration-300">
              <Zap className="w-4 h-4" />
              {t.aboutPage.cta.button}
            </a>
          </motion.div>
        </section>

        <Footer />
      </div>
    </>
  );
};

export default About;
