import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { useLanguage } from "@/i18n/LanguageContext";

const technologies = [
  "HTML5", "CSS3", "JavaScript", "React",
  "Node.js", "Tailwind", "TypeScript", "Vite",
  "PostgreSQL", "MongoDB", "Firebase", "GitHub",
  "Docker", "Prisma", "Sass", "Bootstrap"
];

const ProjectsPreview = () => {
  const { t } = useLanguage();

  return (
    <section className="relative min-h-screen flex items-center bg-black py-12 sm:py-16 md:py-20 lg:py-32">
      <div className="w-full px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="max-w-6xl mx-auto"
        >
          <h2 className="text-2xl xs:text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold mb-8 sm:mb-10 md:mb-12 uppercase tracking-tight text-center leading-tight">
            {t.tech.sectionTitle}
          </h2>
          <p className="text-sm xs:text-base sm:text-lg md:text-xl text-white/70 mb-10 sm:mb-12 md:mb-16 text-center max-w-3xl mx-auto leading-relaxed">
            {t.tech.sectionSubtitle}
          </p>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 xs:gap-4 mb-10 sm:mb-12 md:mb-16">
            {technologies.map((tech, index) => (
              <motion.div
                key={tech}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: index * 0.05 }}
                className="border border-white/20 p-4 xs:p-5 sm:p-6 text-center hover:border-white hover:bg-white/5 transition-all duration-300"
              >
                <span className="text-xs xs:text-sm tracking-wider font-medium">{tech}</span>
              </motion.div>
            ))}
          </div>

          <div className="text-center">
            <Link to="/projects">
              <button className="inline-flex items-center space-x-2 border-2 border-white px-6 sm:px-8 py-3 sm:py-4 text-xs sm:text-sm tracking-widest uppercase font-semibold hover:bg-white hover:text-black transition-all duration-300">
                <span>{t.projects.viewProject}</span>
                <ArrowRight size={14} className="sm:w-4 sm:h-4" />
              </button>
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default ProjectsPreview;