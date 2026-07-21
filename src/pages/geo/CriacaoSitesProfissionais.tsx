import { Link } from "react-router-dom";
import { Helmet } from "react-helmet";
import { motion, useMotionValue, useSpring, useTransform, useInView } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import {
  Rocket, ShieldCheck, ArrowRight, ExternalLink, Zap, Trophy, TrendingUp, CheckCircle2, ArrowRight as ArrowRightIcon,
} from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Container } from "@/components/layout/Container";
import { Section } from "@/components/layout/Section";
import GlassCard from "@/components/GlassCard";
import BreadcrumbSchema from "@/components/BreadcrumbSchema";
import LucideIconRender from "@/components/ui/LucideIconRender";
import DiagnosticoModal from "@/components/DiagnosticoModal";
import { useSitePage } from "@/hooks/useSitePage";
import { projects as fallbackProjects } from "@/data/projects";
import { resolveProjectImage } from "@/data/projectImages";
import { TechIconCDN } from "@/components/TechIconCDN";

const CANONICAL = "https://www.sevendevx.com/criacao-de-sites-profissionais";

// Fallbacks (garantem que a página nunca fica em branco)
const FB_METRICS = [
  { value: 17, prefix: "", suffix: "+", label: "Projetos entregues" },
  { value: 98, prefix: "", suffix: "", label: "Lighthouse médio" },
  { value: 7,  prefix: "", suffix: "d", label: "Prazo mínimo" },
];
const FB_DIFFS = [
  { icon: "Code2", title: "Código próprio, não template", description: "Arquitetura React/TypeScript feita para escalar." },
  { icon: "Gauge", title: "Performance 90+ Lighthouse", description: "LCP < 2s, CLS zero, imagens otimizadas." },
  { icon: "Search", title: "SEO técnico completo", description: "Meta tags dinâmicas, Schema.org, sitemap, robots." },
  { icon: "ShieldCheck", title: "Segurança enterprise", description: "HTTPS, CSP, rate limiting, RLS." },
  { icon: "Layers", title: "Design system exclusivo", description: "Identidade visual única." },
  { icon: "Sparkles", title: "IA integrada de fábrica", description: "Chatbot e automações prontas." },
];
const FB_STACK = ["React 18","TypeScript","Vite","Tailwind CSS","Framer Motion","Supabase","PostgreSQL","Edge Functions","PWA"];
const FB_COMP = [
  { criterion: "Performance (Lighthouse)", value_a: "90–100", value_b: "40–65" },
  { criterion: "Customização", value_a: "Ilimitada", value_b: "Limitada ao tema" },
  { criterion: "SEO técnico", value_a: "Completo e auditável", value_b: "Plugin dependente" },
  { criterion: "Escalabilidade", value_a: "Cloud-native", value_b: "Trava com tráfego" },
  { criterion: "Custo mensal", value_a: "Hospedagem enxuta", value_b: "Licenças + plugins" },
  { criterion: "Propriedade do código", value_a: "100% sua", value_b: "Preso à plataforma" },
];
const FB_PROC = [
  { step_number: "01", title: "Diagnóstico", description: "Reunião de 30min." },
  { step_number: "02", title: "Design & Prototipagem", description: "Wireframes e protótipo." },
  { step_number: "03", title: "Desenvolvimento", description: "Sprints com preview ao vivo." },
  { step_number: "04", title: "Launch & Growth", description: "Deploy CDN + monitoramento." },
];
const FB_ROI = [
  { value: "27", prefix: "+", suffix: "%", title: "Aumento em conversão", description: "Sites com LCP < 2.5s convertem mais.", source_label: "web.dev" },
  { value: "2", prefix: "", suffix: "×", title: "Retorno em SEO técnico", description: "SEO bem executado dobra tráfego em 12 meses.", source_label: "Ahrefs" },
  { value: "16", prefix: "−", suffix: "%", title: "Redução em bounce rate", description: "Cada segundo a mais aumenta bounce.", source_label: "Deloitte" },
];
const FB_FAQ = [
  { question: "Quanto custa um site profissional sob medida?", answer: "Projetos a partir de R$ 4.900. Orçamento definido após diagnóstico gratuito." },
  { question: "Qual o prazo médio de entrega?", answer: "Landing: 7-14 dias. Institucional: 3-5 semanas. Plataformas: 6-12 semanas." },
  { question: "Por que não usar Wix, WordPress ou template pronto?", answer: "Templates travam com crescimento: performance cai, SEO fica limitado, marca fica genérica." },
  { question: "Vocês cuidam de SEO e hospedagem também?", answer: "Sim. Entregamos SEO técnico, deploy em CDN e monitoramento contínuo." },
  { question: "O site é responsivo e otimizado para mobile?", answer: "Todos os projetos são mobile-first com PWA opcional e acessibilidade WCAG AA." },
];

function Counter({ to, suffix = "", prefix = "" }: { to: number; suffix?: string; prefix?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-50px" });
  const [val, setVal] = useState(0);
  useEffect(() => {
    if (!inView) return;
    const start = performance.now(); const duration = 1600;
    let raf: number;
    const tick = (now: number) => {
      const p = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - p, 3);
      setVal(Math.round(to * eased));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [inView, to]);
  return <span ref={ref}>{prefix}{val.toLocaleString("pt-BR")}{suffix}</span>;
}

function BrowserMockup3D({ src, alt, url }: { src: string; alt: string; url: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const mx = useMotionValue(0); const my = useMotionValue(0);
  const rx = useSpring(useTransform(my, [-0.5, 0.5], [8, -8]), { stiffness: 150, damping: 20 });
  const ry = useSpring(useTransform(mx, [-0.5, 0.5], [-10, 10]), { stiffness: 150, damping: 20 });
  const onMove = (e: React.MouseEvent) => {
    const r = ref.current?.getBoundingClientRect(); if (!r) return;
    mx.set((e.clientX - r.left) / r.width - 0.5);
    my.set((e.clientY - r.top) / r.height - 0.5);
  };
  const reset = () => { mx.set(0); my.set(0); };
  return (
    <div ref={ref} onMouseMove={onMove} onMouseLeave={reset} style={{ perspective: 1400 }} className="w-full">
      <motion.div style={{ rotateX: rx, rotateY: ry, transformStyle: "preserve-3d" }} className="relative rounded-2xl border border-border bg-card shadow-[0_40px_120px_-20px_rgba(0,0,0,0.6)] overflow-hidden">
        <div className="flex items-center gap-2 px-4 py-3 border-b border-border bg-white/[0.03]">
          <span className="w-2.5 h-2.5 rounded-full bg-red-500/70" />
          <span className="w-2.5 h-2.5 rounded-full bg-yellow-500/70" />
          <span className="w-2.5 h-2.5 rounded-full bg-green-500/70" />
          <div className="ml-4 flex-1 flex items-center gap-2 px-3 py-1 rounded-md bg-white/[0.04] text-[11px] text-muted-foreground font-mono truncate">
            <ShieldCheck className="w-3 h-3 text-primary flex-shrink-0" />
            <span className="truncate">{url}</span>
          </div>
        </div>
        <img src={src} alt={alt} className="w-full h-auto block" loading="eager" />
        <div style={{ transform: "translateZ(1px)" }} className="pointer-events-none absolute inset-0 bg-gradient-to-tr from-transparent via-white/[0.04] to-white/[0.08]" />
      </motion.div>
    </div>
  );
}

export default function CriacaoSitesProfissionais() {
  const { data } = useSitePage();
  const [diagOpen, setDiagOpen] = useState(false);

  // SEO
  const seo = data.config?.seo || {};
  const TITLE = seo.title || "Criação de Sites Profissionais | SevenDevX";
  const DESCRIPTION = seo.description || "Criação de sites profissionais sob medida: código próprio, performance 90+, SEO técnico e ROI mensurável.";
  const KEYWORDS = seo.keywords || "criação de sites profissionais, desenvolvimento de sites, sites sob medida";

  // Hero
  const hero = data.config?.hero_config || {};
  const badgeText = hero.badge_text || "Aceitando Novos Projetos";
  const badgeYear = hero.badge_year || "2026";
  const titlePrefix = hero.title_prefix || "Sites que";
  const titleHighlight = hero.title_highlight || "vendem, escalam";
  const titleSuffix = hero.title_suffix || "e ranqueiam.";
  const heroDesc = hero.description || "Código próprio, performance 90+, SEO técnico e design sob medida.";
  const ctaPrimaryLabel = hero.cta_primary_label || "Diagnóstico gratuito";
  const ctaPrimaryUrl = hero.cta_primary_url || "#diagnostico";
  const ctaPrimaryAction = hero.cta_primary_action || "diagnostico";
  const ctaSecondaryLabel = hero.cta_secondary_label || "Ver projetos";
  const ctaSecondaryUrl = hero.cta_secondary_url || "/projects";
  const showMetrics = hero.show_metrics !== false;
  const showProject = hero.show_project !== false;

  // Métricas
  const metrics = data.metrics.length ? data.metrics : FB_METRICS as any;
  // Diferenciais
  const diffs = data.differentials.length ? data.differentials : FB_DIFFS as any;
  // Processo
  const process = data.process.length ? data.process : FB_PROC as any;
  // Comparativo
  const comp = data.comparison.length ? data.comparison : FB_COMP as any;
  const compTitle = data.config?.comparison_config?.title || "Sob medida vs. template genérico";
  const compColA = data.config?.comparison_config?.col_a_label || "Site SevenDevX";
  const compColB = data.config?.comparison_config?.col_b_label || "Template genérico";
  // ROI
  const roi = data.roi.length ? data.roi : FB_ROI as any;
  const roiCfg = data.config?.roi_config || {};
  // FAQ
  const faqs: { question: string; answer: string }[] = data.faqs.length
    ? data.faqs.map(f => ({ question: f.faq?.question ?? "", answer: f.override_answer || f.faq?.answer || "" }))
    : FB_FAQ;
  // Tech (marquee) — mantém objeto completo p/ ícone oficial colorido
  const techItems: { name: string; slug?: string; color?: string; iconUrl?: string | null }[] =
    data.tech.length
      ? data.tech.map(t => ({
          name: t.custom_label || t.tech?.name || "",
          slug: t.tech?.slug,
          color: t.tech?.color,
          iconUrl: t.tech?.icon_url,
        })).filter(x => x.name)
      : FB_STACK.map(name => ({ name, slug: name.toLowerCase().replace(/[^a-z0-9]/g, "") }));
  const techSpeed = data.config?.tech_config?.speed || 40;
  // Projetos: hero + showcase
  const heroSpProject = data.projects.find(p => p.is_hero);
  const heroProject = heroSpProject?.project ||
    fallbackProjects.find(p => p.title === "PsicoOne") || fallbackProjects[0];
  const showcaseProjects = data.projects.length
    ? data.projects.filter(p => !p.is_hero).slice(0, 6)
    : fallbackProjects.filter(p => p.featured).slice(0, 6).map(p => ({
        id: p.id, project: p, override_title: null, override_description: null,
        override_image_url: null, override_cta_url: null, open_new_tab: true,
      })) as any;
  // CTA
  const cta = data.config?.cta_config || {};
  const ctaTitle = cta.title || "Pronto para tirar seu projeto do template?";
  const ctaDesc = cta.description || "Diagnóstico gratuito de 30 minutos. Sem compromisso.";
  const ctaButton = cta.button_text || "Solicitar diagnóstico";
  const ctaAction = cta.action_type || "diagnostico";
  const ctaUrl = cta.button_url || "#diagnostico";

  const openDiagnostico = (e?: React.MouseEvent) => { e?.preventDefault(); setDiagOpen(true); };

  // JSON-LD dinâmico
  const jsonLd = [
    { "@context":"https://schema.org","@type":"Service", name:"Criação de Sites Profissionais",
      serviceType:"Desenvolvimento Web",
      provider:{ "@type":"Organization", name:"SevenDevX", url:"https://www.sevendevx.com" },
      areaServed:{ "@type":"Country", name:"Brasil" },
      description:DESCRIPTION,
      offers:{ "@type":"Offer", priceCurrency:"BRL", price:"4900", url:CANONICAL } },
    { "@context":"https://schema.org","@type":"FAQPage",
      mainEntity: faqs.map(f => ({ "@type":"Question", name:f.question,
        acceptedAnswer:{ "@type":"Answer", text:f.answer } })) },
  ];

  return (
    <>
      <Helmet>
        <title>{TITLE}</title>
        <meta name="description" content={DESCRIPTION} />
        <meta name="keywords" content={KEYWORDS} />
        <link rel="canonical" href={seo.canonical || CANONICAL} />
        <meta property="og:title" content={TITLE} />
        <meta property="og:description" content={DESCRIPTION} />
        <meta property="og:url" content={seo.canonical || CANONICAL} />
        <meta property="og:type" content="website" />
        <meta name="twitter:card" content="summary_large_image" />
        {jsonLd.map((s, i) => (<script key={i} type="application/ld+json">{JSON.stringify(s)}</script>))}
      </Helmet>
      <BreadcrumbSchema items={[
        { name: "Home", url: "/" },
        { name: "Soluções", url: "/solucoes" },
        { name: "Criação de Sites Profissionais", url: "/criacao-de-sites-profissionais" },
      ]} />
      <Header />
      <main className="min-h-screen bg-background text-foreground pt-24 overflow-x-hidden">
        {/* HERO */}
        <Section>
          <Container>
            <div className="grid lg:grid-cols-[1.05fr,1fr] gap-12 lg:gap-16 items-center">
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }}>
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-border bg-white/[0.03] mb-6">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                  <span className="text-[11px] uppercase tracking-[0.25em] text-muted-foreground">
                    {badgeText} · {badgeYear}
                  </span>
                </div>
                <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight mb-6 leading-[1.02]">
                  {titlePrefix}{" "}
                  <span className="relative inline-block">
                    <span className="bg-gradient-to-r from-primary via-foreground to-primary bg-clip-text text-transparent">
                      {titleHighlight}
                    </span>
                    <motion.span initial={{ scaleX: 0 }} animate={{ scaleX: 1 }} transition={{ delay: 0.6, duration: 0.8, ease: "easeOut" }} className="absolute -bottom-1 left-0 right-0 h-1 bg-gradient-to-r from-primary to-transparent origin-left" />
                  </span>{" "}
                  {titleSuffix}
                </h1>
                <p className="text-lg md:text-xl text-muted-foreground max-w-xl leading-relaxed mb-8">
                  {heroDesc}
                </p>
                <div className="flex flex-wrap gap-3 mb-10">
                  {ctaPrimaryAction === "diagnostico" ? (
                    <button onClick={openDiagnostico} className="group inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-foreground text-background text-sm font-bold uppercase tracking-wider hover:opacity-90 transition">
                      <Rocket className="w-4 h-4 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 transition-transform" />
                      {ctaPrimaryLabel}
                    </button>
                  ) : (
                    <Link to={ctaPrimaryUrl} className="group inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-foreground text-background text-sm font-bold uppercase tracking-wider hover:opacity-90 transition">
                      <Rocket className="w-4 h-4" />
                      {ctaPrimaryLabel}
                    </Link>
                  )}
                  <Link to={ctaSecondaryUrl} className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl border border-border text-sm font-bold uppercase tracking-wider hover:bg-white/5 transition">
                    {ctaSecondaryLabel} <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
                {showMetrics && (
                  <div className="grid grid-cols-3 gap-6 max-w-md">
                    {metrics.map((m: any) => (
                      <div key={m.label}>
                        <div className="text-2xl md:text-3xl font-bold tracking-tight">
                          <Counter to={Number(m.value)} prefix={m.prefix} suffix={m.suffix} />
                        </div>
                        <p className="text-[11px] uppercase tracking-wider text-muted-foreground mt-1">{m.label}</p>
                      </div>
                    ))}
                  </div>
                )}
              </motion.div>

              {showProject && (() => {
                const heroImg = heroSpProject?.override_image_url
                  || resolveProjectImage((heroProject as any).cover_image)
                  || (heroProject as any).image
                  || (heroProject as any).cover_url;
                const heroLive = heroSpProject?.override_cta_url
                  || (heroProject as any).liveUrl
                  || (heroProject as any).live_url;
                const heroUrl = (heroLive || "seudominio.com").replace(/^https?:\/\//, "");
                return (
                  <motion.div initial={{ opacity: 0, scale: 0.95, y: 30 }} animate={{ opacity: 1, scale: 1, y: 0 }} transition={{ duration: 0.9, delay: 0.2 }} className="relative">
                    <div className="absolute -inset-10 bg-gradient-to-tr from-primary/20 via-transparent to-primary/10 blur-3xl opacity-60 -z-10" />
                    <BrowserMockup3D
                      src={heroImg}
                      alt={heroSpProject?.override_title || heroProject.title}
                      url={heroUrl}
                    />
                    {heroLive && (
                      <a href={heroLive} target="_blank" rel="noopener noreferrer" className="mt-4 inline-flex items-center gap-2 text-xs uppercase tracking-[0.25em] text-muted-foreground hover:text-foreground transition">
                        Ver projeto ao vivo <ExternalLink className="w-3 h-3" />
                      </a>
                    )}
                  </motion.div>
                );
              })()}
            </div>
          </Container>
        </Section>

        {/* MARQUEE STACK */}
        <section aria-label="Stack tecnológico" className="border-y border-border py-6 bg-white/[0.02] overflow-hidden">
          <div className="flex gap-12 whitespace-nowrap" style={{ animation: `marquee ${techSpeed}s linear infinite` }}>
            {[...tech, ...tech].map((t, i) => (
              <span key={i} className="text-sm uppercase tracking-[0.3em] text-muted-foreground/60 flex items-center gap-12">
                {t} <span className="text-primary">{techSep}</span>
              </span>
            ))}
          </div>
          <style>{`@keyframes marquee { from { transform: translateX(0); } to { transform: translateX(-50%); } }`}</style>
        </section>

        {/* DIFERENCIAIS */}
        <Section>
          <Container>
            <div className="max-w-3xl mb-12">
              <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground mb-3">Diferenciais</p>
              <h2 className="text-3xl md:text-5xl font-bold tracking-tight">Por que cada detalhe importa</h2>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
              {diffs.map((d: any, i: number) => (
                <motion.div key={d.id || d.title} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-50px" }} transition={{ delay: i * 0.06, duration: 0.5 }} whileHover={{ y: -6 }}>
                  <GlassCard className="p-6 h-full group relative overflow-hidden">
                    <div className="absolute -top-16 -right-16 w-32 h-32 rounded-full bg-primary/10 blur-3xl opacity-0 group-hover:opacity-100 transition-opacity" />
                    <div className="relative">
                      <div className="w-10 h-10 rounded-lg border border-border bg-white/[0.03] flex items-center justify-center mb-4">
                        <LucideIconRender name={d.icon} className="w-5 h-5 text-primary" />
                      </div>
                      <h3 className="text-lg font-bold mb-2">{d.title}</h3>
                      <p className="text-sm text-muted-foreground leading-relaxed">{d.description}</p>
                    </div>
                  </GlassCard>
                </motion.div>
              ))}
            </div>
          </Container>
        </Section>

        {/* PROJETOS */}
        <Section>
          <Container>
            <div className="flex items-end justify-between flex-wrap gap-6 mb-12">
              <div className="max-w-2xl">
                <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground mb-3 flex items-center gap-2">
                  <Trophy className="w-3.5 h-3.5" /> Projetos entregues
                </p>
                <h2 className="text-3xl md:text-5xl font-bold tracking-tight">Sites reais, resultados reais</h2>
              </div>
              <Link to="/projects" className="text-sm uppercase tracking-wider text-muted-foreground hover:text-foreground transition inline-flex items-center gap-2">
                Ver portfólio completo <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {showcaseProjects.map((sp: any, i: number) => {
                const p = sp.project || sp;
                const title = sp.override_title || p.title;
                const desc = sp.override_description || p.description;
                const image = sp.override_image_url || p.image || resolveProjectImage(p.cover_image || p.cover_url);
                const url = sp.override_cta_url || p.liveUrl || p.live_url || p.case_study_url || (p.slug ? `/projects/${p.slug}` : "#");
                const openInTab = sp.open_new_tab !== false && /^https?:/.test(url);
                const category = p.category;
                const tags: string[] = Array.isArray(p.tags) ? p.tags : [];
                const techs: any[] = Array.isArray(p.technologies) ? p.technologies : (p.tech || []);
                const isHighlight = sp.is_featured;
                return (
                  <motion.a
                    key={sp.id || p.id}
                    href={url}
                    target={openInTab ? "_blank" : undefined}
                    rel="noopener noreferrer"
                    initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-50px" }} transition={{ delay: i * 0.08, duration: 0.6 }} whileHover={{ y: -8 }}
                    className={`group block rounded-2xl border ${isHighlight ? "border-primary/40" : "border-border"} bg-card overflow-hidden hover:border-foreground/40 transition-colors relative`}
                  >
                    {isHighlight && (
                      <span className="absolute top-3 right-3 z-10 px-2 py-0.5 rounded-full text-[10px] uppercase tracking-wider bg-primary/90 text-primary-foreground font-bold">Destaque</span>
                    )}
                    <div className="relative aspect-[16/10] overflow-hidden bg-black">
                      {image && (
                        <img src={image} alt={title} loading="lazy" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/10 to-transparent" />
                      {(category || tags.length > 0) && (
                        <div className="absolute top-3 left-3 flex flex-wrap gap-1.5 max-w-[80%]">
                          {category && (
                            <span className="px-2 py-0.5 rounded-md text-[10px] uppercase tracking-wider bg-black/60 backdrop-blur border border-white/20 text-white font-semibold">
                              {category}
                            </span>
                          )}
                          {tags.slice(0, 3).map((t) => (
                            <span key={t} className="px-2 py-0.5 rounded-md text-[10px] uppercase tracking-wider bg-white/10 backdrop-blur border border-white/20 text-white/90 font-medium">
                              {t}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                    <div className="p-5">
                      <h3 className="text-lg font-bold mb-1.5 group-hover:text-primary transition-colors">{title}</h3>
                      <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed mb-4">{desc}</p>
                      {techs.length > 0 && (
                        <div className="pt-4 border-t border-border flex flex-wrap gap-2">
                          {techs.slice(0, 5).map((t: any, ti: number) => {
                            const name = typeof t === "string" ? t : (t.name || t.label);
                            const color = typeof t === "object" ? t.color : undefined;
                            const iconUrl = typeof t === "object" ? (t.iconUrl || t.icon_url) : undefined;
                            return (
                              <span key={`${name}-${ti}`} title={name} className="inline-flex items-center gap-1.5 px-2 py-1 rounded-md text-[11px] font-medium bg-white/[0.04] border border-border">
                                {iconUrl ? (
                                  <img src={iconUrl} alt="" width={14} height={14} loading="lazy" className="w-3.5 h-3.5 object-contain" />
                                ) : color ? (
                                  <span className="w-2 h-2 rounded-full" style={{ background: color }} />
                                ) : null}
                                <span className="text-foreground/80">{name}</span>
                              </span>
                            );
                          })}
                          {techs.length > 5 && (
                            <span className="inline-flex items-center px-2 py-1 rounded-md text-[11px] font-medium text-muted-foreground">
                              +{techs.length - 5}
                            </span>
                          )}
                        </div>
                      )}
                      <div className="mt-4 inline-flex items-center gap-1.5 text-[11px] uppercase tracking-[0.2em] text-muted-foreground group-hover:text-foreground transition-colors">
                        Ver projeto <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                      </div>
                    </div>
                  </motion.a>
                );
              })}
            </div>
          </Container>
        </Section>

        {/* PROCESSO */}
        <Section>
          <Container>
            <div className="max-w-3xl mb-12">
              <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground mb-3 flex items-center gap-2">
                <Zap className="w-3.5 h-3.5" /> Processo
              </p>
              <h2 className="text-3xl md:text-5xl font-bold tracking-tight">Do briefing ao launch</h2>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-5 relative">
              <div className="hidden lg:block absolute top-8 left-[12%] right-[12%] h-px bg-gradient-to-r from-transparent via-border to-transparent" />
              {process.map((p: any, i: number) => (
                <motion.div key={p.id || p.step_number} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }} className="relative">
                  <div className="w-16 h-16 rounded-full border border-border bg-card flex items-center justify-center mb-5 font-mono text-sm text-primary relative z-10">
                    {p.step_number}
                  </div>
                  <h3 className="text-lg font-bold mb-2">{p.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{p.description}</p>
                  {p.estimated_time && <p className="text-[11px] uppercase tracking-wider text-primary/70 mt-2">{p.estimated_time}</p>}
                </motion.div>
              ))}
            </div>
          </Container>
        </Section>

        {/* COMPARATIVO */}
        <Section>
          <Container>
            <div className="max-w-3xl mb-10">
              <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground mb-3">Comparativo</p>
              <h2 className="text-3xl md:text-5xl font-bold tracking-tight mb-4">{compTitle}</h2>
            </div>
            <div className="rounded-2xl border border-border overflow-hidden bg-card">
              <div className="overflow-x-auto">
                <table className="w-full text-sm min-w-[640px]">
                  <thead className="bg-white/[0.03]">
                    <tr>
                      <th className="text-left p-4 font-semibold">Critério</th>
                      <th className="text-left p-4 font-semibold">{compColA}</th>
                      <th className="text-left p-4 font-semibold text-muted-foreground">{compColB}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {comp.map((row: any, i: number) => (
                      <motion.tr key={row.id || row.criterion} initial={{ opacity: 0, x: -10 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.05 }}>
                        <td className="p-4 font-medium">{row.criterion}</td>
                        <td className="p-4 text-primary">
                          <span className="inline-flex items-center gap-2">
                            <CheckCircle2 className="w-4 h-4" /> {row.value_a}
                          </span>
                        </td>
                        <td className="p-4 text-muted-foreground">{row.value_b}</td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </Container>
        </Section>

        {/* ROI */}
        <Section>
          <Container>
            <GlassCard className="p-8 md:p-14 relative overflow-hidden">
              <div className="absolute -top-20 -right-20 w-96 h-96 rounded-full bg-primary/10 blur-3xl" />
              <div className="relative">
                <div className="flex items-center gap-2 mb-4">
                  <TrendingUp className="w-5 h-5 text-primary" />
                  <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">{roiCfg.badge || "ROI real"}</p>
                </div>
                <h2 className="text-3xl md:text-5xl font-bold tracking-tight mb-10 max-w-3xl">
                  {roiCfg.title || "Por que investir em site profissional paga a conta rápido"}
                </h2>
                <div className="grid md:grid-cols-3 gap-8">
                  {roi.map((r: any, i: number) => {
                    const num = parseFloat(String(r.value)) || 0;
                    return (
                      <motion.div key={r.id || r.title} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}>
                        <div className="text-5xl md:text-6xl font-bold mb-3 bg-gradient-to-br from-primary to-foreground bg-clip-text text-transparent">
                          {r.prefix}<Counter to={num} suffix={r.suffix} />
                        </div>
                        <p className="text-lg font-semibold mb-1">{r.title}</p>
                        <p className="text-sm text-muted-foreground leading-relaxed">{r.description}</p>
                        {r.source_label && (
                          <p className="text-[11px] uppercase tracking-wider text-muted-foreground/70 mt-2">
                            Fonte: {r.source_url ? <a href={r.source_url} target="_blank" rel="noopener noreferrer" className="hover:text-foreground underline">{r.source_label}</a> : r.source_label}
                          </p>
                        )}
                      </motion.div>
                    );
                  })}
                </div>
                {roiCfg.source_note && (
                  <p className="text-[11px] text-muted-foreground/60 mt-8 italic">{roiCfg.source_note}</p>
                )}
              </div>
            </GlassCard>
          </Container>
        </Section>

        {/* FAQ */}
        <Section>
          <Container narrow>
            <div className="mb-10">
              <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground mb-3">Perguntas frequentes</p>
              <h2 className="text-3xl md:text-5xl font-bold tracking-tight">Tire suas dúvidas</h2>
            </div>
            <div className="space-y-3">
              {faqs.map((f, i) => (
                <motion.details key={f.question} initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.05 }} className="group p-5 rounded-xl border border-border bg-card hover:border-foreground/30 transition-colors">
                  <summary className="cursor-pointer font-semibold list-none flex justify-between items-center gap-4">
                    <span>{f.question}</span>
                    <span className="text-muted-foreground group-open:rotate-45 transition-transform text-2xl leading-none">+</span>
                  </summary>
                  <p className="mt-4 text-sm text-muted-foreground leading-relaxed">{f.answer}</p>
                </motion.details>
              ))}
            </div>
          </Container>
        </Section>

        {/* CTA FINAL */}
        <Section>
          <Container>
            <motion.div initial={{ opacity: 0, scale: 0.95 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={{ duration: 0.6 }} className="relative rounded-3xl border border-border bg-gradient-to-br from-card via-card to-primary/5 p-10 md:p-16 text-center overflow-hidden">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,hsl(var(--primary)/0.15),transparent_60%)]" />
              <div className="relative">
                <h2 className="text-3xl md:text-6xl font-bold tracking-tight mb-6 max-w-3xl mx-auto">
                  {ctaTitle}
                </h2>
                <p className="text-muted-foreground mb-8 max-w-xl mx-auto">
                  {ctaDesc}
                </p>
                {ctaAction === "diagnostico" ? (
                  <button onClick={openDiagnostico} className="group inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-foreground text-background text-sm font-bold uppercase tracking-wider hover:opacity-90 transition">
                    {ctaButton}
                    <ArrowRightIcon className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </button>
                ) : (
                  <Link to={ctaUrl} className="group inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-foreground text-background text-sm font-bold uppercase tracking-wider hover:opacity-90 transition">
                    {ctaButton}
                    <ArrowRightIcon className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </Link>
                )}
              </div>
            </motion.div>
          </Container>
        </Section>
      </main>
      <Footer />

      {/* Diagnóstico Modal */}
      <DiagnosticoModal
        open={diagOpen}
        onClose={() => setDiagOpen(false)}
        config={{
          title: data.config?.diagnostico?.title,
          description: data.config?.diagnostico?.description,
          consent_text: data.config?.diagnostico?.consent_text,
          redirect_url: data.config?.diagnostico?.redirect_url,
        }}
      />
    </>
  );
}
