import { Link } from "react-router-dom";
import { Helmet } from "react-helmet";
import { motion } from "framer-motion";
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
} from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Container } from "@/components/layout/Container";
import { Section } from "@/components/layout/Section";
import GlassCard from "@/components/GlassCard";
import BreadcrumbSchema from "@/components/BreadcrumbSchema";

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
];

const compare = [
  { feature: "Performance (Lighthouse)", pro: "90–100", template: "40–65" },
  { feature: "Customização", pro: "Ilimitada", template: "Limitada ao tema" },
  { feature: "SEO técnico", pro: "Completo e auditável", template: "Plugin dependente" },
  { feature: "Escalabilidade", pro: "Cloud-native, elástica", template: "Trava com tráfego" },
  { feature: "Custo mensal", pro: "Hospedagem enxuta", template: "Licenças + plugins premium" },
  { feature: "Propriedade do código", pro: "100% sua", template: "Preso à plataforma" },
];

const faq = [
  {
    q: "Quanto custa um site profissional sob medida?",
    a: "Projetos SevenDevX começam a partir de R$ 4.900 para landing pages de alta conversão e evoluem conforme escopo (institucional, e-commerce, portal, SaaS). O orçamento é fechado após diagnóstico gratuito.",
  },
  {
    q: "Qual o prazo médio de entrega?",
    a: "Landing pages: 7 a 14 dias. Sites institucionais: 3 a 5 semanas. Plataformas com painel e integrações: 6 a 12 semanas. Todo cronograma é entregue com marcos semanais.",
  },
  {
    q: "Por que não usar Wix, Wordpress ou template pronto?",
    a: "Templates resolvem no curto prazo, mas travam quando o negócio cresce: performance cai, SEO fica limitado, personalização exige gambiarra e a marca fica igual a milhares de outras. Código próprio elimina esses tetos.",
  },
  {
    q: "Vocês cuidam de SEO e hospedagem também?",
    a: "Sim. Entregamos SEO técnico completo, deploy em CDN global (Vercel/Cloudflare), monitoramento contínuo e opção de manutenção mensal.",
  },
  {
    q: "O site é responsivo e otimizado para mobile?",
    a: "Todos os projetos são mobile-first, com PWA opcional (funciona offline e pode ser instalado como app), acessibilidade WCAG AA e testes reais em iOS/Android.",
  },
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

export default function CriacaoSitesProfissionais() {
  return (
    <>
      <Helmet>
        <title>{TITLE}</title>
        <meta name="description" content={DESCRIPTION} />
        <meta
          name="keywords"
          content="criação de sites profissionais, desenvolvimento de sites, sites sob medida, site institucional, landing page, react, next.js, seo técnico"
        />
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
      <main className="min-h-screen bg-background text-foreground pt-24">
        {/* HERO */}
        <Section>
          <Container>
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
              <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground mb-4">
                Serviço · Web Development
              </p>
              <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-6 max-w-4xl leading-[1.05]">
                Criação de sites profissionais que{" "}
                <span className="bg-gradient-to-r from-primary to-foreground bg-clip-text text-transparent">
                  vendem, escalam e ranqueiam
                </span>
                .
              </h1>
              <p className="text-lg md:text-xl text-muted-foreground max-w-2xl leading-relaxed mb-8">
                Código próprio, performance 90+ no Lighthouse, SEO técnico completo e design sob medida.
                A alternativa real a templates genéricos e plataformas engessadas.
              </p>
              <div className="flex flex-wrap gap-3">
                <Link
                  to="/#contact"
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-foreground text-background text-sm font-bold uppercase tracking-wider hover:opacity-90 transition"
                >
                  <Rocket className="w-4 h-4" /> Solicitar diagnóstico gratuito
                </Link>
                <Link
                  to="/projects"
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-xl border border-border text-sm font-bold uppercase tracking-wider hover:bg-white/5 transition"
                >
                  Ver projetos entregues <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </motion.div>
          </Container>
        </Section>

        {/* DIFERENCIAIS */}
        <Section className="pt-0">
          <Container>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
              {differentials.map((d, i) => {
                const Icon = d.icon;
                return (
                  <motion.div
                    key={d.title}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.05 }}
                  >
                    <GlassCard className="p-6 h-full">
                      <Icon className="w-6 h-6 text-primary mb-4" />
                      <h3 className="text-lg font-bold mb-2">{d.title}</h3>
                      <p className="text-sm text-muted-foreground leading-relaxed">{d.text}</p>
                    </GlassCard>
                  </motion.div>
                );
              })}
            </div>
          </Container>
        </Section>

        {/* COMPARATIVO */}
        <Section>
          <Container>
            <div className="max-w-3xl mb-10">
              <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground mb-3">Comparativo</p>
              <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4">
                Site profissional sob medida vs. template genérico
              </h2>
              <p className="text-muted-foreground">
                O template resolve o "estar online". O código próprio resolve o "estar competitivo".
              </p>
            </div>
            <div className="rounded-2xl border border-border overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-white/5">
                  <tr>
                    <th className="text-left p-4 font-semibold">Critério</th>
                    <th className="text-left p-4 font-semibold">Site profissional (SevenDevX)</th>
                    <th className="text-left p-4 font-semibold text-muted-foreground">Template genérico</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {compare.map((row) => (
                    <tr key={row.feature}>
                      <td className="p-4 font-medium">{row.feature}</td>
                      <td className="p-4 text-primary flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4" /> {row.pro}
                      </td>
                      <td className="p-4 text-muted-foreground">{row.template}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Container>
        </Section>

        {/* STACK */}
        <Section className="pt-0">
          <Container>
            <div className="max-w-3xl mb-8">
              <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground mb-3">Stack</p>
              <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4">
                Tecnologias enterprise por trás de cada projeto
              </h2>
            </div>
            <div className="flex flex-wrap gap-2">
              {stack.map((t) => (
                <span
                  key={t}
                  className="px-4 py-2 rounded-full border border-border text-sm bg-white/[0.02]"
                >
                  {t}
                </span>
              ))}
            </div>
          </Container>
        </Section>

        {/* ROI */}
        <Section>
          <Container>
            <GlassCard className="p-8 md:p-12">
              <div className="flex items-center gap-2 mb-4">
                <TrendingUp className="w-5 h-5 text-primary" />
                <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">ROI real</p>
              </div>
              <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-6 max-w-3xl">
                Por que investir em um site profissional paga a conta rapidamente
              </h2>
              <div className="grid md:grid-cols-3 gap-6">
                {[
                  { n: "+68%", t: "de conversão média vs. templates prontos, quando LCP cai abaixo de 2s." },
                  { n: "3–5×", t: "mais tráfego orgânico em 6 meses com SEO técnico bem estruturado." },
                  { n: "–40%", t: "de custo com anúncios pagos ao melhorar Quality Score no Google Ads." },
                ].map((s) => (
                  <div key={s.n}>
                    <div className="text-4xl font-bold mb-2 bg-gradient-to-r from-primary to-foreground bg-clip-text text-transparent">
                      {s.n}
                    </div>
                    <p className="text-sm text-muted-foreground leading-relaxed">{s.t}</p>
                  </div>
                ))}
              </div>
            </GlassCard>
          </Container>
        </Section>

        {/* FAQ */}
        <Section className="pt-0">
          <Container narrow>
            <div className="mb-8">
              <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground mb-3">Perguntas frequentes</p>
              <h2 className="text-3xl md:text-4xl font-bold tracking-tight">Dúvidas comuns sobre criação de sites profissionais</h2>
            </div>
            <div className="space-y-3">
              {faq.map((f) => (
                <details key={f.q} className="group p-5 rounded-xl border border-border bg-card">
                  <summary className="cursor-pointer font-semibold list-none flex justify-between items-center gap-4">
                    <span>{f.q}</span>
                    <span className="text-muted-foreground group-open:rotate-45 transition text-xl leading-none">+</span>
                  </summary>
                  <p className="mt-3 text-sm text-muted-foreground leading-relaxed">{f.a}</p>
                </details>
              ))}
            </div>
          </Container>
        </Section>

        {/* CTA FINAL */}
        <Section>
          <Container>
            <div className="text-center max-w-2xl mx-auto">
              <h2 className="text-3xl md:text-5xl font-bold tracking-tight mb-6">
                Pronto para tirar seu projeto do template?
              </h2>
              <p className="text-muted-foreground mb-8">
                Diagnóstico gratuito de 30 minutos com nosso time técnico. Sem compromisso.
              </p>
              <Link
                to="/#contact"
                className="inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-foreground text-background text-sm font-bold uppercase tracking-wider hover:opacity-90 transition"
              >
                Solicitar diagnóstico <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </Container>
        </Section>
      </main>
      <Footer />
    </>
  );
}
