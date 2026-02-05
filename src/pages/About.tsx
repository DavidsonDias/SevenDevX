import { useEffect } from "react";
import { useAnalytics } from "@/hooks/useAnalytics";
import { motion } from "framer-motion";
import { useLanguage } from "@/i18n/LanguageContext";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import SEOHead from "@/components/SEOHead";
import ServiceCard3D from "@/components/ServiceCard3D";
import { 
  Target, 
  Eye, 
  Heart, 
  Rocket, 
  Users, 
  Award,
  CheckCircle,
  Calendar
} from "lucide-react";

/**
 * 🏢 About.tsx — Página Sobre a SevenDevX
 * Timeline, Missão, Visão e Valores com i18n completo
 */

const About = () => {
  const { t, language } = useLanguage();
  
  // 📊 Track page view
  useAnalytics();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // Timeline data from translations
  const timelineItems = t.aboutPage.timeline.items;

  // Values from translations
  const values = [
    { icon: Target, ...t.aboutPage.values.items[0] },
    { icon: Heart, ...t.aboutPage.values.items[1] },
    { icon: Users, ...t.aboutPage.values.items[2] },
    { icon: Award, ...t.aboutPage.values.items[3] },
    { icon: Rocket, ...t.aboutPage.values.items[4] },
    { icon: CheckCircle, ...t.aboutPage.values.items[5] },
  ];

  // SEO titles per language
  const seoTitles: Record<string, string> = {
    pt: "Sobre Nós | SevenDevX - Nossa História e Valores",
    en: "About Us | SevenDevX - Our Story and Values",
    es: "Sobre Nosotros | SevenDevX - Nuestra Historia y Valores",
  };

  const seoDescriptions: Record<string, string> = {
    pt: "Conheça a história da SevenDevX, nossa missão, visão e valores. Empresa de desenvolvimento web focada em inovação e excelência.",
    en: "Learn about SevenDevX's story, our mission, vision and values. Web development company focused on innovation and excellence.",
    es: "Conoce la historia de SevenDevX, nuestra misión, visión y valores. Empresa de desarrollo web enfocada en innovación y excelencia.",
  };

  return (
    <>
      <SEOHead
        title={seoTitles[language]}
        description={seoDescriptions[language]}
        type="website"
      />

      <div className="min-h-screen bg-background text-foreground">
        <Header />

        {/* Hero Section */}
        <section className="relative pt-32 pb-20 px-4 overflow-hidden">
          {/* Background gradient */}
          <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-transparent to-transparent" />
          
          <div className="max-w-6xl mx-auto relative z-10">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-center"
            >
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 tracking-tight">
                {t.aboutPage.heroTitle}
              </h1>
              <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto">
                {t.aboutPage.heroSubtitle}
              </p>
            </motion.div>
          </div>
        </section>

        {/* Story Section */}
        <section className="py-16 px-4">
          <div className="max-w-4xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="text-center mb-12"
            >
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                {t.aboutPage.storyTitle}
              </h2>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="prose prose-lg prose-invert mx-auto"
            >
              {t.aboutPage.storyContent.map((paragraph, index) => (
                <p key={index} className="text-muted-foreground mb-4 text-center md:text-left">
                  {paragraph}
                </p>
              ))}
            </motion.div>
          </div>
        </section>

        {/* Timeline Section */}
        <section className="py-20 px-4 bg-muted/30">
          <div className="max-w-5xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="text-center mb-16"
            >
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                {t.aboutPage.timeline.title}
              </h2>
              <p className="text-muted-foreground text-lg">
                {t.aboutPage.timeline.subtitle}
              </p>
            </motion.div>

            <div className="relative">
              {/* Timeline line */}
              <div className="absolute left-4 md:left-1/2 top-0 bottom-0 w-0.5 bg-gradient-to-b from-primary via-primary/50 to-primary/20 transform md:-translate-x-1/2" />

              {timelineItems.map((item, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: index % 2 === 0 ? -50 : 50 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className={`relative flex items-center mb-12 ${
                    index % 2 === 0 ? "md:flex-row" : "md:flex-row-reverse"
                  }`}
                >
                  {/* Timeline dot */}
                  <div className="absolute left-4 md:left-1/2 w-4 h-4 bg-primary rounded-full transform md:-translate-x-1/2 z-10 ring-4 ring-background" />

                  {/* Content */}
                  <div className={`ml-12 md:ml-0 md:w-1/2 ${index % 2 === 0 ? "md:pr-12 md:text-right" : "md:pl-12"}`}>
                    <div className="bg-card border border-border rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow">
                      <div className={`flex items-center gap-3 mb-3 ${index % 2 === 0 ? "md:justify-end" : ""}`}>
                        <Calendar className="w-5 h-5 text-primary" />
                        <span className="text-primary font-bold text-lg">{item.year}</span>
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

        {/* Mission, Vision Section */}
        <section className="py-20 px-4">
          <div className="max-w-6xl mx-auto">
            <div className="grid md:grid-cols-2 gap-8">
              {/* Mission */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
                className="bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/20 rounded-2xl p-8"
              >
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-14 h-14 bg-primary/20 rounded-xl flex items-center justify-center">
                    <Target className="w-7 h-7 text-primary" />
                  </div>
                  <h2 className="text-2xl md:text-3xl font-bold">{t.aboutPage.mission.title}</h2>
                </div>
                <p className="text-muted-foreground text-lg leading-relaxed">
                  {t.aboutPage.mission.content}
                </p>
              </motion.div>

              {/* Vision */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.1 }}
                className="bg-gradient-to-br from-secondary/10 to-secondary/5 border border-secondary/20 rounded-2xl p-8"
              >
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-14 h-14 bg-secondary/20 rounded-xl flex items-center justify-center">
                    <Eye className="w-7 h-7 text-secondary-foreground" />
                  </div>
                  <h2 className="text-2xl md:text-3xl font-bold">{t.aboutPage.vision.title}</h2>
                </div>
                <p className="text-muted-foreground text-lg leading-relaxed">
                  {t.aboutPage.vision.content}
                </p>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Values Section */}
        <section className="py-20 px-4 bg-muted/30">
          <div className="max-w-6xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="text-center mb-16"
            >
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                {t.aboutPage.values.title}
              </h2>
              <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
                {t.aboutPage.values.subtitle}
              </p>
            </motion.div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {values.map((value, index) => {
                const Icon = value.icon;
                return (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                     >
                    <ServiceCard3D 
                      tiltIntensity={8} 
                      glowIntensity={0.25}
                      glowColor="34, 197, 94"
                    >
                      <div className="bg-card border border-border rounded-xl p-6 hover:border-primary/50 transition-all hover:shadow-lg group h-full">
                        <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                          <Icon className="w-6 h-6 text-primary" />
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

        {/* CTA Section */}
        <section className="py-20 px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="max-w-4xl mx-auto text-center"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              {t.aboutPage.cta.title}
            </h2>
            <p className="text-muted-foreground text-lg mb-8 max-w-2xl mx-auto">
              {t.aboutPage.cta.subtitle}
            </p>
            <a
              href="/#contact"
              className="inline-flex items-center px-8 py-4 bg-primary text-primary-foreground font-semibold rounded-lg hover:bg-primary/90 transition-colors"
            >
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
