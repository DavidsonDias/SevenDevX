import { Link } from "react-router-dom";
import { Helmet } from "react-helmet";
import { motion, useMotionValue, useSpring, useTransform, useInView } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import {
  Rocket,
  ShieldCheck,
  Gauge,
  Search,
  Sparkles,
  Layers,
  Code2,
  TrendingUp,
  CheckCircle2,
  ArrowRight,
  ExternalLink,
  Zap,
  Trophy,
} from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Container } from "@/components/layout/Container";
import { Section } from "@/components/layout/Section";
import GlassCard from "@/components/GlassCard";
import BreadcrumbSchema from "@/components/BreadcrumbSchema";
import { projects } from "@/data/projects";

const URL = "https://www.sevendevx.com/criacao-de-sites-profissionais";
const TITLE = "Criação de Sites Profissionais | SevenDevX";
const DESCRIPTION =
  "Criação de sites profissionais sob medida: código próprio, performance 90+ no Lighthouse, SEO técnico, segurança enterprise e ROI mensurável. Alternativa real a templates genéricos.";

const differentials = [
  { icon: Code2, title: "Código próprio, não template", text: "Arquitetura React/TypeScript feita para escalar — sem plugins pesados, sem lock-in de plataforma." },
  { icon: Gauge, title: "Performance 90+ Lighthouse", text: "LCP < 2s, CLS zero, imagens otimizadas e cache inteligente. Google recompensa velocidade." },
  { icon: Search, title: "SEO técnico completo", text: "Meta tags dinâmicas, Schema.org, sitemap, robots, canonical e otimização para AI Overviews." },
  { icon: ShieldCheck, title: "Segurança enterprise", text: "HTTPS, CSP, rate limiting, RLS no banco e políticas OWASP aplicadas por padrão." },
  { icon: Layers, title: "Design system exclusivo", text: "Identidade visual única — nada de aparência genérica de tema comprado." },
  { icon: Sparkles, title: "IA integrada de fábrica", text: "Chatbot, geração de conteúdo e automações prontas para converter mais leads." },
];

const stack = [
  "React 18", "TypeScript", "Vite", "Tailwind CSS", "Framer Motion",
  "Supabase", "PostgreSQL", "Edge Functions", "PWA", "Service Workers",
  "Vercel", "Cloudflare", "Node.js", "OpenAI", "Stripe",
];

const compare = [
  { feature: "Performance (Lighthouse)", pro: "90–100", template: "40–65" },
  { feature: "Customização", pro: "Ilimitada", template: "Limitada ao tema" },
  { feature: "SEO técnico", pro: "Completo e auditável", template: "Plugin dependente" },
  { feature: "Escalabilidade", pro: "Cloud-native, elástica", template: "Trava com tráfego" },
  { feature: "Custo mensal", pro: "Hospedagem enxuta", template: "Licenças + plugins premium" },
  { feature: "Propriedade do código", pro: "100% sua", template: "Preso à plataforma" },
];

const process = [
  { step: "01", title: "Diagnóstico", text: "Reunião de 30min para entender objetivo, público e métricas de sucesso." },
  { step: "02", title: "Design & Prototipagem", text: "Wireframes, identidade visual e protótipo navegável em Figma." },
  { step: "03", title: "Desenvolvimento", text: "Sprints semanais com preview ao vivo, código próprio e code review contínuo." },
  { step: "04", title: "Launch & Growth", text: "Deploy em CDN global, SEO técnico auditado e monitoramento 24/7." },
];

const faq = [
  { q: "Quanto custa um site profissional sob medida?", a: "Projetos SevenDevX começam a partir de R$ 4.900 para landing pages de alta conversão e evoluem conforme escopo (institucional, e-commerce, portal, SaaS). O orçamento é fechado após diagnóstico gratuito." },
  { q: "Qual o prazo médio de entrega?", a: "Landing pages: 7 a 14 dias. Sites institucionais: 3 a 5 semanas. Plataformas com painel e integrações: 6 a 12 semanas. Todo cronograma é entregue com marcos semanais." },
  { q: "Por que não usar Wix, Wordpress ou template pronto?", a: "Templates resolvem no curto prazo, mas travam quando o negócio cresce: performance cai, SEO fica limitado, personalização exige gambiarra e a marca fica igual a milhares de outras. Código próprio elimina esses tetos." },
  { q: "Vocês cuidam de SEO e hospedagem também?", a: "Sim. Entregamos SEO técnico completo, deploy em CDN global (Vercel/Cloudflare), monitoramento contínuo e opção de manutenção mensal." },
  { q: "O site é responsivo e otimizado para mobile?", a: "Todos os projetos são mobile-first, com PWA opcional (funciona offline e pode ser instalado como app), acessibilidade WCAG AA e testes reais em iOS/Android." },
];

const jsonLd = [
  {
    "@context": "https://schema.org",
    "@type": "Service",
    name: "Criação de Sites Profissionais",
    serviceType: "Desenvolvimento Web",
    provider: { "@type": "Organization", name: "SevenDevX", url: "https://www.sevendevx.com" },
    areaServed: { "@type": "Country", name: "Brasil" },
    description: DESCRIPTION,
    offers: { "@type": "Offer", priceCurrency: "BRL", price: "4900", url: URL },
  },
  {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faq.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a },
    })),
  },
];

// Animated counter
function Counter({ to, suffix = "", prefix = "" }: { to: number; suffix?: string; prefix?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-50px" });
  const [val, setVal] = useState(0);
  useEffect(() => {
    if (!inView) return;
    const start = performance.now();
    const duration = 1600;
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

// 3D tilted browser mockup
function BrowserMockup3D({ src, alt, url }: { src: string; alt: string; url: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const rx = useSpring(useTransform(my, [-0.5, 0.5], [8, -8]), { stiffness: 150, damping: 20 });
  const ry = useSpring(useTransform(mx, [-0.5, 0.5], [-10, 10]), { stiffness: 150, damping: 20 });

  const onMove = (e: React.MouseEvent) => {
    const r = ref.current?.getBoundingClientRect();
    if (!r) return;
    mx.set((e.clientX - r.left) / r.width - 0.5);
    my.set((e.clientY - r.top) / r.height - 0.5);
  };
  const reset = () => { mx.set(0); my.set(0); };

  return (
    <div ref={ref} onMouseMove={onMove} onMouseLeave={reset} style={{ perspective: 1400 }} className="w-full">
      <motion.div
        style={{ rotateX: rx, rotateY: ry, transformStyle: "preserve-3d" }}
        className="relative rounded-2xl border border-border bg-card shadow-[0_40px_120px_-20px_rgba(0,0,0,0.6)] overflow-hidden"
      >
        {/* Browser chrome */}
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
        {/* Glare */}
        <div
          style={{ transform: "translateZ(1px)" }}
          className="pointer-events-none absolute inset-0 bg-gradient-to-tr from-transparent via-white/[0.04] to-white/[0.08]"
        />
      </motion.div>
    </div>
  );
}

export default function CriacaoSitesProfissionais() {
  const showcase = projects.filter((p) => p.featured).slice(0, 6);
  const hero = projects.find((p) => p.title === "PsicoOne") || projects[0];

  return (
    <>
      <Helmet>
        <title>{TITLE}</title>
        <meta name="description" content={DESCRIPTION} />
        <meta name="keywords" content="criação de sites profissionais, desenvolvimento de sites, sites sob medida, site institucional, landing page, react, next.js, seo técnico" />
        <link rel="canonical" href={URL} />
        <meta property="og:title" content={TITLE} />
        <meta property="og:description" content={DESCRIPTION} />
        <meta property="og:url" content={URL} />
        <meta property="og:type" content="website" />
        <meta name="twitter:card" content="summary_large_image" />
        {jsonLd.map((s, i) => (
          <script key={i} type="application/ld+json">{JSON.stringify(s)}</script>
        ))}
      </Helmet>
      <BreadcrumbSchema
        items={[
          { name: "Home", url: "/" },
          { name: "Soluções", url: "/solucoes" },
          { name: "Criação de Sites Profissionais", url: "/criacao-de-sites-profissionais" },
        ]}
      />
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
                    Aceitando 3 novos projetos · 2026
                  </span>
                </div>
                <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight mb-6 leading-[1.02]">
                  Sites que{" "}
                  <span className="relative inline-block">
                    <span className="bg-gradient-to-r from-primary via-foreground to-primary bg-clip-text text-transparent">
                      vendem, escalam
                    </span>
                    <motion.span
                      initial={{ scaleX: 0 }}
                      animate={{ scaleX: 1 }}
                      transition={{ delay: 0.6, duration: 0.8, ease: "easeOut" }}
                      className="absolute -bottom-1 left-0 right-0 h-1 bg-gradient-to-r from-primary to-transparent origin-left"
                    />
                  </span>
                  {" "}e ranqueiam.
                </h1>
                <p className="text-lg md:text-xl text-muted-foreground max-w-xl leading-relaxed mb-8">
                  Código próprio, performance 90+ no Lighthouse, SEO técnico e design sob medida.
                  A alternativa real a templates genéricos e plataformas engessadas.
                </p>
                <div className="flex flex-wrap gap-3 mb-10">
                  <Link
                    to="/#contact"
                    className="group inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-foreground text-background text-sm font-bold uppercase tracking-wider hover:opacity-90 transition"
                  >
                    <Rocket className="w-4 h-4 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 transition-transform" />
                    Diagnóstico gratuito
                  </Link>
                  <Link
                    to="/projects"
                    className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl border border-border text-sm font-bold uppercase tracking-wider hover:bg-white/5 transition"
                  >
                    Ver projetos <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
                {/* Mini stats */}
                <div className="grid grid-cols-3 gap-6 max-w-md">
                  {[
                    { n: 47, s: "+", label: "Projetos entregues" },
                    { n: 98, s: "", label: "Lighthouse médio" },
                    { n: 7, s: "d", label: "Prazo mínimo" },
                  ].map((s) => (
                    <div key={s.label}>
                      <div className="text-2xl md:text-3xl font-bold tracking-tight">
                        <Counter to={s.n} suffix={s.s} />
                      </div>
                      <p className="text-[11px] uppercase tracking-wider text-muted-foreground mt-1">{s.label}</p>
                    </div>
                  ))}
                </div>
              </motion.div>

              {/* 3D Hero Mockup */}
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 30 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ duration: 0.9, delay: 0.2 }}
                className="relative"
              >
                <div className="absolute -inset-10 bg-gradient-to-tr from-primary/20 via-transparent to-primary/10 blur-3xl opacity-60 -z-10" />
                <BrowserMockup3D src={hero.image} alt={hero.title} url="psicoone.vercel.app" />
                {hero.liveUrl && (
                  <a
                    href={hero.liveUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-4 inline-flex items-center gap-2 text-xs uppercase tracking-[0.25em] text-muted-foreground hover:text-foreground transition"
                  >
                    Ver projeto ao vivo <ExternalLink className="w-3 h-3" />
                  </a>
                )}
              </motion.div>
            </div>
          </Container>
        </Section>

        {/* MARQUEE STACK */}
        <section aria-label="Stack tecnológico" className="border-y border-border py-6 bg-white/[0.02] overflow-hidden">
          <div className="flex gap-12 whitespace-nowrap animate-[marquee_40s_linear_infinite]">
            {[...stack, ...stack].map((t, i) => (
              <span key={i} className="text-sm uppercase tracking-[0.3em] text-muted-foreground/60 flex items-center gap-12">
                {t} <span className="text-primary">◆</span>
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
              {differentials.map((d, i) => {
                const Icon = d.icon;
                return (
                  <motion.div
                    key={d.title}
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-50px" }}
                    transition={{ delay: i * 0.06, duration: 0.5 }}
                    whileHover={{ y: -6 }}
                  >
                    <GlassCard className="p-6 h-full group relative overflow-hidden">
                      <div className="absolute -top-16 -right-16 w-32 h-32 rounded-full bg-primary/10 blur-3xl opacity-0 group-hover:opacity-100 transition-opacity" />
                      <div className="relative">
                        <div className="w-10 h-10 rounded-lg border border-border bg-white/[0.03] flex items-center justify-center mb-4">
                          <Icon className="w-5 h-5 text-primary" />
                        </div>
                        <h3 className="text-lg font-bold mb-2">{d.title}</h3>
                        <p className="text-sm text-muted-foreground leading-relaxed">{d.text}</p>
                      </div>
                    </GlassCard>
                  </motion.div>
                );
              })}
            </div>
          </Container>
        </Section>

        {/* PROJETOS REAIS */}
        <Section>
          <Container>
            <div className="flex items-end justify-between flex-wrap gap-6 mb-12">
              <div className="max-w-2xl">
                <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground mb-3 flex items-center gap-2">
                  <Trophy className="w-3.5 h-3.5" /> Projetos entregues
                </p>
                <h2 className="text-3xl md:text-5xl font-bold tracking-tight">
                  Sites reais, resultados reais
                </h2>
              </div>
              <Link to="/projects" className="text-sm uppercase tracking-wider text-muted-foreground hover:text-foreground transition inline-flex items-center gap-2">
                Ver portfólio completo <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {showcase.map((p, i) => (
                <motion.a
                  key={p.id}
                  href={p.liveUrl || "#"}
                  target={p.liveUrl ? "_blank" : undefined}
                  rel="noopener noreferrer"
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-50px" }}
                  transition={{ delay: i * 0.08, duration: 0.6 }}
                  whileHover={{ y: -8 }}
                  className="group block rounded-2xl border border-border bg-card overflow-hidden hover:border-foreground/40 transition-colors"
                >
                  <div className="relative aspect-[16/10] overflow-hidden bg-black">
                    <img
                      src={p.image}
                      alt={p.title}
                      loading="lazy"
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-70" />
                    {p.tags && (
                      <div className="absolute top-3 left-3 flex flex-wrap gap-1.5">
                        {p.tags.slice(0, 2).map((t) => (
                          <span key={t} className="px-2 py-1 rounded-md bg-black/60 backdrop-blur border border-white/10 text-[10px] uppercase tracking-wider">
                            {t}
                          </span>
                        ))}
                      </div>
                    )}
                    {p.liveUrl && (
                      <div className="absolute bottom-3 right-3 w-9 h-9 rounded-full bg-white/95 text-black flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <ArrowRight className="w-4 h-4 -rotate-45" />
                      </div>
                    )}
                  </div>
                  <div className="p-5">
                    <h3 className="text-lg font-bold mb-1.5">{p.title}</h3>
                    <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed">{p.description}</p>
                    <div className="flex items-center gap-3 mt-4 pt-4 border-t border-border">
                      {p.techs.slice(0, 4).map((t) => {
                        const Icon = t.icon;
                        return (
                          <Icon key={t.name} className="w-4 h-4" style={{ color: t.color }} aria-label={t.name} />
                        );
                      })}
                    </div>
                  </div>
                </motion.a>
              ))}
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
              {process.map((p, i) => (
                <motion.div
                  key={p.step}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="relative"
                >
                  <div className="w-16 h-16 rounded-full border border-border bg-card flex items-center justify-center mb-5 font-mono text-sm text-primary relative z-10">
                    {p.step}
                  </div>
                  <h3 className="text-lg font-bold mb-2">{p.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{p.text}</p>
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
              <h2 className="text-3xl md:text-5xl font-bold tracking-tight mb-4">
                Sob medida vs. template genérico
              </h2>
              <p className="text-muted-foreground">
                O template resolve o "estar online". O código próprio resolve o "estar competitivo".
              </p>
            </div>
            <div className="rounded-2xl border border-border overflow-hidden bg-card">
              <div className="overflow-x-auto">
                <table className="w-full text-sm min-w-[640px]">
                  <thead className="bg-white/[0.03]">
                    <tr>
                      <th className="text-left p-4 font-semibold">Critério</th>
                      <th className="text-left p-4 font-semibold">Site SevenDevX</th>
                      <th className="text-left p-4 font-semibold text-muted-foreground">Template genérico</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {compare.map((row, i) => (
                      <motion.tr
                        key={row.feature}
                        initial={{ opacity: 0, x: -10 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: i * 0.05 }}
                      >
                        <td className="p-4 font-medium">{row.feature}</td>
                        <td className="p-4 text-primary">
                          <span className="inline-flex items-center gap-2">
                            <CheckCircle2 className="w-4 h-4" /> {row.pro}
                          </span>
                        </td>
                        <td className="p-4 text-muted-foreground">{row.template}</td>
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
                  <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">ROI real</p>
                </div>
                <h2 className="text-3xl md:text-5xl font-bold tracking-tight mb-10 max-w-3xl">
                  Por que investir em site profissional paga a conta rápido
                </h2>
                <div className="grid md:grid-cols-3 gap-8">
                  {[
                    { n: 68, s: "%", p: "+", t: "de conversão média vs. templates prontos, quando LCP cai abaixo de 2s." },
                    { n: 5, s: "×", p: "", t: "mais tráfego orgânico em 6 meses com SEO técnico bem estruturado." },
                    { n: 40, s: "%", p: "–", t: "de custo com anúncios pagos ao melhorar Quality Score no Google Ads." },
                  ].map((s, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: i * 0.1 }}
                    >
                      <div className="text-5xl md:text-6xl font-bold mb-3 bg-gradient-to-br from-primary to-foreground bg-clip-text text-transparent">
                        {s.p}<Counter to={s.n} suffix={s.s} />
                      </div>
                      <p className="text-sm text-muted-foreground leading-relaxed">{s.t}</p>
                    </motion.div>
                  ))}
                </div>
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
              {faq.map((f, i) => (
                <motion.details
                  key={f.q}
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.05 }}
                  className="group p-5 rounded-xl border border-border bg-card hover:border-foreground/30 transition-colors"
                >
                  <summary className="cursor-pointer font-semibold list-none flex justify-between items-center gap-4">
                    <span>{f.q}</span>
                    <span className="text-muted-foreground group-open:rotate-45 transition-transform text-2xl leading-none">+</span>
                  </summary>
                  <p className="mt-4 text-sm text-muted-foreground leading-relaxed">{f.a}</p>
                </motion.details>
              ))}
            </div>
          </Container>
        </Section>

        {/* CTA FINAL */}
        <Section>
          <Container>
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="relative rounded-3xl border border-border bg-gradient-to-br from-card via-card to-primary/5 p-10 md:p-16 text-center overflow-hidden"
            >
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,hsl(var(--primary)/0.15),transparent_60%)]" />
              <div className="relative">
                <h2 className="text-3xl md:text-6xl font-bold tracking-tight mb-6 max-w-3xl mx-auto">
                  Pronto para tirar seu projeto do template?
                </h2>
                <p className="text-muted-foreground mb-8 max-w-xl mx-auto">
                  Diagnóstico gratuito de 30 minutos com nosso time técnico. Sem compromisso.
                </p>
                <Link
                  to="/#contact"
                  className="group inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-foreground text-background text-sm font-bold uppercase tracking-wider hover:opacity-90 transition"
                >
                  Solicitar diagnóstico
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
            </motion.div>
          </Container>
        </Section>
      </main>
      <Footer />
    </>
  );
}
