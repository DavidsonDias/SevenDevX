/**
 * Testimonials.tsx — SevenDevX
 * ─────────────────────────────────────────────────────────────────────
 * @file src/components/Testimonials.tsx
 * @module UI
 *
 * @description
 * Depoimentos em grade.
 *
 * @see src/components/README.md
 * ─────────────────────────────────────────────────────────────────────
 */

import { motion } from "framer-motion";
import { Star, Quote } from "lucide-react";

// Avatar images
import avatarCarlos from "@/assets/avatar-carlos.jpg";
import avatarMaria from "@/assets/avatar-maria.jpg";
import avatarJoao from "@/assets/avatar-joao.jpg";

const Testimonials = () => {
  const testimonials = [
    {
      name: "Carlos Silva",
      role: "CEO, TechStart",
      content: "A SevenDevX transformou nossa visão em realidade. O site entregue superou todas as expectativas em design e performance.",
      rating: 5,
      image: avatarCarlos
    },
    {
      name: "Maria Santos",
      role: "Diretora de Marketing, InnovaHub",
      content: "Profissionalismo impecável. Entregaram o projeto antes do prazo e com qualidade excepcional. Altamente recomendado!",
      rating: 5,
      image: avatarMaria
    },
    {
      name: "João Oliveira",
      role: "Fundador, StartupBR",
      content: "Excelente comunicação e resultado final incrível. A equipe entendeu perfeitamente nossa necessidade e entregou além.",
      rating: 5,
      image: avatarJoao
    }
  ];

  return (
    <section className="relative py-20 md:py-32 bg-black overflow-hidden">
      {/* Background Effect */}
      <div className="absolute inset-0 bg-gradient-to-b from-black via-zinc-950 to-black opacity-50" />
      
      <div className="w-full px-4 sm:px-6 lg:px-8 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-center mb-10 sm:mb-12 md:mb-16"
        >
          <h2 className="text-2xl xs:text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-4 sm:mb-6 uppercase tracking-tight leading-tight">
            O Que Nossos Clientes Dizem
          </h2>
          <p className="text-xs xs:text-sm sm:text-base text-white/60 max-w-2xl mx-auto leading-relaxed uppercase tracking-wider">
            Depoimentos reais de quem confia em nosso trabalho
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8 max-w-7xl mx-auto">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              whileHover={{ y: -8, transition: { duration: 0.3 } }}
              className="group relative bg-zinc-950/40 backdrop-blur-sm border border-white/10 p-6 sm:p-8 hover:border-white/30 transition-all duration-300"
            >
              {/* Quote Icon */}
              <Quote className="absolute top-4 sm:top-6 right-4 sm:right-6 w-10 h-10 sm:w-12 sm:h-12 text-white/5 group-hover:text-white/10 transition-colors" />

              {/* Rating */}
              <div className="flex gap-1 mb-4 sm:mb-6">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <Star
                    key={i}
                    className="w-3.5 h-3.5 sm:w-4 sm:h-4 fill-yellow-400 text-yellow-400"
                  />
                ))}
              </div>

              {/* Content */}
              <p className="text-xs xs:text-sm text-white/80 mb-6 sm:mb-8 leading-relaxed italic">
                "{testimonial.content}"
              </p>

              {/* Author */}
              <div className="flex items-center gap-3 sm:gap-4 mt-auto">
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full overflow-hidden border-2 border-white/20 group-hover:border-white/40 transition-colors flex-shrink-0">
                  <img
                    src={testimonial.image}
                    alt={testimonial.name}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                </div>
                <div>
                  <p className="text-xs sm:text-sm font-semibold text-white uppercase tracking-wide">
                    {testimonial.name}
                  </p>
                  <p className="text-[10px] xs:text-xs text-white/60 uppercase tracking-wider">
                    {testimonial.role}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Trust Badge */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="text-center mt-10 sm:mt-12 md:mt-16"
        >
          <div className="inline-flex items-center gap-2 sm:gap-3 bg-white/5 backdrop-blur-sm border border-white/10 px-6 sm:px-8 py-3 sm:py-4">
            <Star className="w-4 h-4 sm:w-5 sm:h-5 fill-yellow-400 text-yellow-400" />
            <span className="text-xs sm:text-sm uppercase tracking-widest font-semibold">
              5.0 Avaliação Média
            </span>
            <Star className="w-4 h-4 sm:w-5 sm:h-5 fill-yellow-400 text-yellow-400" />
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default Testimonials;
