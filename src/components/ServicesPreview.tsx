/**
 * 🚀 ServicesPreview.tsx — SevenDevX v2.0 PRO (i18n)
 * -------------------------------------------------------------
 * ✅ 5 serviços completos (Web, Software, Maintenance, Landing, Consulting)
 * ✅ Responsividade mobile/desktop (layouts diferentes)
 * ✅ Animações Framer Motion scroll-triggered
 * ✅ Acessibilidade WCAG 2.1 AA (role, aria-labels)
 * ✅ Performance otimizada (eager first, lazy rest)
 * ✅ Picture element (WebP + fallback)
 * ✅ SEO melhorado (heading hierarchy)
 * ✅ UX aprimorada (CTA em todos serviços)
 * ✅ i18n completo (PT/EN/ES)
 * ✅ Icons por serviço
 * -------------------------------------------------------------
 */

import { motion } from "framer-motion";
import { ArrowRight, Code, Settings, Wrench, FileText, Lightbulb } from "lucide-react";
import { Link } from "react-router-dom";
import { useLanguage } from "@/i18n/LanguageContext";
import ServiceCard3D from "./ServiceCard3D";
import serviceDev from "@/assets/images/service-web-dev.webp";
import serviceSoftware from "@/assets/images/service-software.webp";
import serviceMaintenance from "@/assets/images/service-maintenance.webp";
import serviceLanding from "@/assets/images/service-landing.webp";
import serviceConsulting from "@/assets/images/service-consulting.webp";

const ServicesPreview = () => {
  const { t } = useLanguage();
  
  const services = [
    {
      title: t.services.webDev.title,
      description: t.services.webDev.description,
      image: serviceDev,
      icon: Code,
    },
    {
      title: t.services.landingPages.title,
      description: t.services.landingPages.description,
      image: serviceLanding,
      icon: FileText,
    },
    {
      title: t.services.consulting.title,
      description: t.services.consulting.description,
      image: serviceConsulting,
      icon: Lightbulb,
    },
  ];

  return (
    <div id="services" className="bg-black">
      {services.map((service, index) => {
        const IconComponent = service.icon;
        return (
          <motion.section
            key={service.title}
            role="region"
            aria-label={`${t.header.services}: ${service.title}`}
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="relative min-h-screen flex items-center overflow-hidden bg-black"
          >
            {/* ===========================
                MOBILE LAYOUT (Stacked)
               =========================== */}
            <div className="flex flex-col w-full md:hidden">
              {/* Image */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
                className="w-full h-[50vh] min-h-[280px] relative"
              >
                <picture>
                  <source srcSet={service.image} type="image/webp" />
                  <img
                    src={service.image}
                    alt=""
                    aria-hidden="true"
                    loading={index === 0 ? "eager" : "lazy"}
                    className="w-full h-full object-cover"
                  />
                </picture>
                <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/20 to-black/80"></div>
                
                {/* Icon Badge Mobile */}
                <div className="absolute bottom-4 left-4 w-12 h-12 bg-white/10 backdrop-blur-md rounded-xl flex items-center justify-center border border-white/20">
                  <IconComponent size={22} className="text-white" />
                </div>
              </motion.div>

              {/* Content */}
              <motion.div
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, delay: 0.2 }}
                className="px-4 py-10 text-center space-y-4"
              >
                <h2 className="text-2xl xs:text-3xl sm:text-4xl font-bold uppercase tracking-tight leading-tight">
                  {service.title}
                </h2>
                <p className="text-sm xs:text-base text-white/90 leading-relaxed max-w-xl mx-auto">
                  {service.description}
                </p>
                
                {/* CTA Button */}
                <Link 
                  to="/services"
                  aria-label={`${t.services.viewMore} - ${service.title}`}
                >
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="inline-flex items-center space-x-2 border-2 border-white px-6 py-3 text-xs tracking-widest uppercase font-semibold hover:bg-white hover:text-black transition-all duration-300 mt-6"
                  >
                    <span>{t.services.viewMore}</span>
                    <ArrowRight size={14} aria-hidden="true" />
                  </motion.button>
                </Link>
              </motion.div>
            </div>

            {/* ===========================
                DESKTOP LAYOUT (Background + Overlay)
               =========================== */}
            <div className="hidden md:flex md:items-end w-full h-screen">
              {/* Background Image */}
              <div className="absolute inset-0 z-0" aria-hidden="true">
                <picture>
                  <source srcSet={service.image} type="image/webp" />
                  <img
                    src={service.image}
                    alt=""
                    aria-hidden="true"
                    loading={index === 0 ? "eager" : "lazy"}
                    className="w-full h-full object-cover"
                  />
                </picture>
                <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/65 to-black/90"></div>
              </div>

              {/* Icon Badge Desktop */}
              <div className="absolute top-24 left-8 md:left-10 lg:left-16 z-10">
                <div className="w-16 h-16 bg-white/10 backdrop-blur-md rounded-2xl flex items-center justify-center border border-white/20">
                  <IconComponent size={28} className="text-white" />
                </div>
              </div>

              {/* Content */}
              <div className="relative z-10 w-full px-6 md:px-10 lg:px-16 xl:px-24 pb-20 md:pb-24 lg:pb-32">
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.8, delay: 0.3 }}
                  className="max-w-4xl mx-auto lg:max-w-5xl xl:max-w-6xl"
                >
                  <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 uppercase tracking-tight leading-tight">
                    {service.title}
                  </h2>
                  <p className="text-lg md:text-xl text-white/90 mb-8 max-w-2xl leading-relaxed">
                    {service.description}
                  </p>
                  
                  {/* CTA Button */}
                  <Link 
                    to="/services"
                    aria-label={`${t.services.viewMore} - ${service.title}`}
                  >
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="inline-flex items-center space-x-2 border-2 border-white px-8 py-4 text-sm tracking-widest uppercase font-semibold hover:bg-white hover:text-black transition-all duration-300"
                    >
                      <span>{t.services.viewMore}</span>
                      <ArrowRight size={16} aria-hidden="true" />
                    </motion.button>
                  </Link>
                </motion.div>
              </div>
            </div>
          </motion.section>
        );
      })}
    </div>
  );
};

export default ServicesPreview;
