/**
 * IntegrationsMarketplace.tsx — SevenDevX
 * ─────────────────────────────────────────────────────────────────────
 * @file src/pages/IntegrationsMarketplace.tsx
 * @module Public
 * @route /integracoes
 *
 * @description
 * Vitrine pública de integrações suportadas.
 *
 * @see src/pages/README.md
 * ─────────────────────────────────────────────────────────────────────
 */

// ============================================================================
// 📦 IMPORTS
// ============================================================================

/**
 * 🛒 IntegrationsMarketplace — vitrine pública + 1-click install (admin).
 */
import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Search, Sparkles, ArrowRight, Check, Loader2, Plus } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import SEOHead from "@/components/SEOHead";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PROVIDER_CATALOG, CATEGORY_LABEL, type ProviderCategory } from "@/modules/integrations/providerCatalog";
import ProviderLogo from "@/modules/integrations/ProviderLogo";
import { useAuthContext } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

// ============================================================================
// ⚙️ CONSTANTS & CONFIGURATION
// ============================================================================

const CATS = Object.keys(CATEGORY_LABEL) as ProviderCategory[];

// ============================================================================
// 🏗️ MAIN COMPONENT
// ============================================================================

export default function IntegrationsMarketplace() {
  const { user, isAdmin } = useAuthContext();
  const [q, setQ] = useState("");
  const [cat, setCat] = useState<ProviderCategory | "all">("all");
  const [installing, setInstalling] = useState<string | null>(null);

  const install = async (p: typeof PROVIDER_CATALOG[number]) => {
    if (!user) { toast({ title: "Faça login para instalar", variant: "destructive" }); return; }
    setInstalling(p.id);
    try {
      // Admins: cria registro real em integration_providers
      if (isAdmin) {
        const { error } = await supabase.from("integration_providers" as any).upsert({
          id: p.id, name: p.name, category: p.category, description: p.description,
          color: p.color, is_active: false, is_connected: false,
          health_status: "unknown", required_secrets: p.secrets,
        }, { onConflict: "id" });
        if (error) throw error;
        await supabase.from("marketplace_installs" as any).insert({
          provider_slug: p.id, provider_name: p.name, installed_by: user.id,
          requested_secrets: p.secrets, status: "installed",
        });
        toast({ title: `${p.name} instalado`, description: "Configure em /admin/integrations" });
      } else {
        // Não-admins: solicita instalação
        await supabase.from("marketplace_installs" as any).insert({
          provider_slug: p.id, provider_name: p.name, installed_by: user.id,
          requested_secrets: p.secrets, status: "requested",
        });
        toast({ title: "Solicitação enviada", description: "Um admin será notificado." });
      }
    } catch (e: any) {
      toast({ title: "Falha", description: e?.message, variant: "destructive" });
    } finally { setInstalling(null); }
  };


  const filtered = useMemo(() => {
    return PROVIDER_CATALOG.filter((p) => {
      if (cat !== "all" && p.category !== cat) return false;
      if (!q) return true;
      const t = q.toLowerCase();
      return p.name.toLowerCase().includes(t) || p.description.toLowerCase().includes(t);
    });
  }, [q, cat]);

  const totalsByCat = useMemo(() => {
    const m: Record<string, number> = {};
    for (const p of PROVIDER_CATALOG) m[p.category] = (m[p.category] || 0) + 1;
    return m;
  }, []);

  return (
    <>
      <SEOHead
        title="Marketplace de Integrações | SevenDevX"
        description={`Conectamos seu produto a ${PROVIDER_CATALOG.length}+ ferramentas enterprise. GitHub, Vercel, Stripe, OpenAI, Slack, WhatsApp e muito mais.`}
      />
      <Header />
      <main className="min-h-screen bg-background pt-24 pb-24">
        {/* Hero */}
        <section className="container mx-auto px-4 mb-12">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center max-w-3xl mx-auto">
            <Badge variant="outline" className="mb-4 border-white/15 text-white/70">
              <Sparkles className="w-3 h-3 mr-1" /> {PROVIDER_CATALOG.length}+ integrações enterprise
            </Badge>
            <h1 className="text-4xl sm:text-6xl font-bold tracking-tight mb-6 bg-gradient-to-br from-white to-white/40 bg-clip-text text-transparent">
              Marketplace de Integrações
            </h1>
            <p className="text-lg text-white/60 leading-relaxed">
              Conectamos seu produto a todo o ecossistema que sua operação precisa. Deploy, IA, pagamentos, comunicação, observabilidade — entregue chave-na-mão pela SevenDevX.
            </p>
            <div className="flex flex-wrap justify-center gap-2 mt-6 text-xs text-white/40">
              <span className="flex items-center gap-1"><Check className="w-3 h-3 text-emerald-400" /> OAuth & API key</span>
              <span className="flex items-center gap-1"><Check className="w-3 h-3 text-emerald-400" /> Webhooks com retry/DLQ</span>
              <span className="flex items-center gap-1"><Check className="w-3 h-3 text-emerald-400" /> Logs e observabilidade</span>
            </div>
          </motion.div>
        </section>

        {/* Filtros */}
        <section className="container mx-auto px-4 mb-8">
          <div className="relative max-w-xl mx-auto mb-6">
            <Search className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-white/40" />
            <Input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder={`Buscar entre ${PROVIDER_CATALOG.length} integrações…`}
              className="pl-11 h-12 bg-white/5 border-white/10"
            />
          </div>

          <div className="flex flex-wrap justify-center gap-2">
            <button
              onClick={() => setCat("all")}
              className={`px-3 py-1.5 rounded-full text-xs uppercase tracking-wider transition ${
                cat === "all" ? "bg-white text-black" : "bg-white/5 text-white/60 hover:bg-white/10"
              }`}
            >
              Todas · {PROVIDER_CATALOG.length}
            </button>
            {CATS.map((c) => (
              <button
                key={c}
                onClick={() => setCat(c)}
                className={`px-3 py-1.5 rounded-full text-xs uppercase tracking-wider transition ${
                  cat === c ? "bg-white text-black" : "bg-white/5 text-white/60 hover:bg-white/10"
                }`}
              >
                {CATEGORY_LABEL[c]} · {totalsByCat[c] || 0}
              </button>
            ))}
          </div>
        </section>

        {/* Grid */}
        <section className="container mx-auto px-4">
          {filtered.length === 0 ? (
            <div className="text-center text-white/50 py-24">Nenhuma integração encontrada para "{q}".</div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
              {filtered.map((p, i) => (
                <motion.div
                  key={p.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: Math.min(i * 0.01, 0.3) }}
                  className="group relative bg-white/[0.03] hover:bg-white/[0.06] border border-white/10 hover:border-white/20 rounded-xl p-4 transition-all"
                >
                  <div className="flex items-center gap-2.5 mb-2">
                    <div className="w-10 h-10 rounded-lg bg-white/5 border border-white/10 grid place-items-center overflow-hidden shrink-0">
                      <ProviderLogo slug={p.slug} color={p.color} name={p.name} size={28} />
                    </div>
                    <div className="min-w-0">
                      <div className="text-sm font-semibold truncate">{p.name}</div>
                      <div className="text-[10px] uppercase tracking-wider text-white/40 truncate">{CATEGORY_LABEL[p.category]}</div>
                    </div>
                  </div>
                  <p className="text-xs text-white/55 line-clamp-2 leading-relaxed">{p.description}</p>
                  {p.badges && p.badges.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-1">
                      {p.badges.slice(0, 2).map((b) => (
                        <Badge key={b} variant="outline" className="text-[9px] border-white/10 text-white/50 px-1.5 py-0">
                          {b}
                        </Badge>
                      ))}
                    </div>
                  )}
                  <button
                    onClick={() => install(p)}
                    disabled={installing === p.id}
                    className="mt-3 w-full inline-flex items-center justify-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-white/10 hover:bg-white text-white hover:text-black text-[11px] font-medium transition-colors disabled:opacity-50"
                  >
                    {installing === p.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <Plus className="w-3 h-3" />}
                    {isAdmin ? "Instalar" : "Solicitar"}
                  </button>
                </motion.div>
              ))}
            </div>
          )}
        </section>

        {/* CTA */}
        <section className="container mx-auto px-4 mt-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-white/[0.06] to-white/[0.02] p-8 sm:p-14 text-center"
          >
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(59,130,246,0.15),transparent_60%)] pointer-events-none" />
            <h2 className="text-3xl sm:text-4xl font-bold mb-4 tracking-tight">Não viu sua ferramenta?</h2>
            <p className="text-white/60 max-w-xl mx-auto mb-8">
              Construímos integrações sob demanda. Webhooks customizados, OAuth, sync bidirecional, automações complexas — diga o que você precisa.
            </p>
            <Link to="/store">
              <Button size="lg" className="bg-white text-black hover:bg-white/90">
                Solicitar integração customizada <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          </motion.div>
        </section>
      </main>
      <Footer />
    </>
  );
}
