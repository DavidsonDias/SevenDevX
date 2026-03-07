import { motion } from "framer-motion";
import { ArrowRight, ArrowUpRight } from "lucide-react";
import { Link } from "react-router-dom";
import { useLanguage } from "@/i18n/LanguageContext";

import projectEcommerce from "@/assets/project-ecommerce.jpg";
import projectManagement from "@/assets/project-management.jpg";
import projectAnalytics from "@/assets/project-analytics.jpg";
import projectErp from "@/assets/project-erp.jpg";

const projects = [
  {
    title: "E-Commerce Platform",
    category: "WEB APP",
    image: projectEcommerce,
    tech: ["React", "Node.js", "PostgreSQL"],
  },
  {
    title: "Project Management",
    category: "SaaS",
    image: projectManagement,
    tech: ["TypeScript", "React", "Supabase"],
  },
  {
    title: "Analytics Dashboard",
    category: "DASHBOARD",
    image: projectAnalytics,
    tech: ["React", "D3.js", "Tailwind"],
  },
  {
    title: "ERP System",
    category: "ENTERPRISE",
    image: projectErp,
    tech: ["React", "Node.js", "MongoDB"],
  },
];

const ProjectsPreview = () => {
  const { t } = useLanguage();

  return (
    <section className="relative bg-background py-20 md:py-32">
      <div className="w-full px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="max-w-7xl mx-auto"
        >
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between mb-12 md:mb-16 gap-4">
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-[0.3em] mb-3">PORTFÓLIO</p>
              <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold uppercase tracking-tight leading-tight">
                {t.projects.title || "Projetos em Destaque"}
              </h2>
            </div>
            <Link to="/projects" className="flex-shrink-0">
              <motion.span
                whileHover={{ scale: 1.05 }}
                className="inline-flex items-center gap-2 border-2 border-foreground px-6 py-3 text-xs tracking-widest uppercase font-semibold hover:bg-foreground hover:text-background transition-all duration-300"
              >
                {t.projects.viewProject || "Ver Todos"}
                <ArrowRight size={14} />
              </motion.span>
            </Link>
          </div>

          {/* Projects Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
            {projects.map((project, index) => (
              <motion.div
                key={project.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="group relative aspect-[4/3] overflow-hidden border border-border bg-secondary cursor-pointer"
              >
                {/* Image */}
                <img
                  src={project.image}
                  alt={project.title}
                  loading="lazy"
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                />

                {/* Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent opacity-60 group-hover:opacity-80 transition-opacity duration-300" />

                {/* Content */}
                <div className="absolute inset-0 flex flex-col justify-end p-6 md:p-8">
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="text-[10px] text-muted-foreground uppercase tracking-[0.3em] block mb-2">
                        {project.category}
                      </span>
                      <h3 className="text-xl md:text-2xl font-bold uppercase tracking-tight mb-3">
                        {project.title}
                      </h3>
                      <div className="flex flex-wrap gap-2">
                        {project.tech.map(t => (
                          <span key={t} className="text-[10px] uppercase tracking-wider text-muted-foreground border border-border px-2 py-1">
                            {t}
                          </span>
                        ))}
                      </div>
                    </div>
                    <ArrowUpRight className="w-5 h-5 text-foreground/50 group-hover:text-foreground transition-colors flex-shrink-0 mt-1" />
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default ProjectsPreview;
