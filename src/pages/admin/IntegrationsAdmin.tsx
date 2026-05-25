/**
 * 🔗 IntegrationsAdmin — Mission Control de Integrações
 */
import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  Activity, AlertTriangle, CheckCircle2, Loader2, Plug, Plus, Search, Webhook, Zap, BookOpen, Sparkles,
} from "lucide-react";
import AdminPageShell from "@/components/admin/AdminPageShell";
import GlassCard from "@/components/GlassCard";
import { useIntegrations, type IntegrationProvider } from "@/hooks/useIntegrations";
import IntegrationDetailsModal from "@/modules/integrations/IntegrationDetailsModal";
import IntegrationMarketplaceModal from "@/modules/integrations/IntegrationMarketplaceModal";
import GuidedConnectionTest from "@/modules/integrations/GuidedConnectionTest";
import SetupGuideDrawer from "@/modules/integrations/SetupGuideDrawer";
import ProviderLogo from "@/modules/integrations/ProviderLogo";
import { findCatalogProvider, CATEGORY_LABEL } from "@/modules/integrations/providerCatalog";

const CATEGORIES: Record<string, { label: string; color: string }> = {
  comunicacao: { label: CATEGORY_LABEL.comunicacao, color: "text-emerald-300" },
  desenvolvimento: { label: CATEGORY_LABEL.desenvolvimento, color: "text-sky-300" },
  design: { label: CATEGORY_LABEL.design, color: "text-pink-300" },
  produtividade: { label: CATEGORY_LABEL.produtividade, color: "text-amber-300" },
  automacao: { label: CATEGORY_LABEL.automacao, color: "text-violet-300" },
  ia: { label: CATEGORY_LABEL.ia, color: "text-fuchsia-300" },
  payments: { label: CATEGORY_LABEL.payments, color: "text-emerald-200" },
  cloud: { label: CATEGORY_LABEL.cloud, color: "text-orange-300" },
  deploy: { label: CATEGORY_LABEL.deploy, color: "text-cyan-300" },
  banco_dados: { label: CATEGORY_LABEL.banco_dados, color: "text-lime-300" },
  monitoring: { label: CATEGORY_LABEL.monitoring, color: "text-purple-300" },
};

const HealthDot = ({ status }: { status: IntegrationProvider["health_status"] }) => {
  const map = {
    operational: { c: "bg-emerald-400 shadow-emerald-400/50", l: "Operacional" },
    warning: { c: "bg-amber-400 shadow-amber-400/50", l: "Atenção" },
    offline: { c: "bg-red-400 shadow-red-400/50", l: "Offline" },
    unknown: { c: "bg-white/30 shadow-white/20", l: "Não testado" },
  } as const;
  const it = map[status] ?? map.unknown;
  return (
    <span className="inline-flex items-center gap-2 text-[11px] uppercase tracking-wider text-white/70">
      <span className={`w-2 h-2 rounded-full ${it.c} shadow-[0_0_10px]`} />
      {it.l}
    </span>
  );
};

const Kpi = ({ icon: Icon, label, value, hint }: any) => (
  <GlassCard padding="md" className="min-w-0">
    <div className="flex items-start justify-between gap-3">
      <div className="min-w-0">
        <p className="text-[10px] uppercase tracking-[0.2em] text-white/50">{label}</p>
        <p className="text-2xl font-bold mt-1.5 tabular-nums">{value}</p>
        {hint && <p className="text-[11px] text-white/40 mt-1">{hint}</p>}
      </div>
      <div className="p-2 rounded-lg border border-white/10 bg-white/5 shrink-0">
        <Icon className="w-4 h-4 text-white/70" />
      </div>
    </div>
  </GlassCard>
);

export default function IntegrationsAdmin() {
  const { list, toggleActive, testConnection } = useIntegrations();
  const [q, setQ] = useState("");
  const [cat, setCat] = useState<string>("all");
  const [selected, setSelected] = useState<IntegrationProvider | null>(null);
  const [marketOpen, setMarketOpen] = useState(false);

  const providers = list.data ?? [];

  useEffect(() => {
    const handler = (e: any) => {
      if (e.detail === "integrations:new") setMarketOpen(true);
      if (e.detail === "integrations:test-all") {
        providers.filter((p) => p.is_active).forEach((p) => testConnection.mutate(p));
      }
    };
    window.addEventListener("sevenos:fab-action", handler);
    return () => window.removeEventListener("sevenos:fab-action", handler);
  }, [providers, testConnection]);

  const stats = useMemo(() => {
    const active = providers.filter((p) => p.is_active).length;
    const offline = providers.filter((p) => p.health_status === "offline").length;
    const operational = providers.filter((p) => p.health_status === "operational").length;
    const lastSync = providers
      .map((p) => p.last_sync_at || p.last_test_at)
      .filter(Boolean)
      .sort()
      .pop();
    return { active, offline, operational, total: providers.length, lastSync };
  }, [providers]);

  const filtered = providers.filter((p) => {
    const matchQ = !q || (p.name + p.description).toLowerCase().includes(q.toLowerCase());
    const matchC = cat === "all" || p.category === cat;
    return matchQ && matchC;
  });

  const grouped = filtered.reduce<Record<string, IntegrationProvider[]>>((acc, p) => {
    (acc[p.category] = acc[p.category] || []).push(p);
    return acc;
  }, {});

  return (
    <AdminPageShell
      title="Integrações"
      subtitle={`Mission Control · ${stats.total} providers · última sincronização: ${
        stats.lastSync ? new Date(stats.lastSync).toLocaleString("pt-BR") : "—"
      }`}
      actions={
        <button onClick={() => setMarketOpen(true)}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-white text-black text-sm font-medium hover:bg-white/90">
          <Plus className="w-4 h-4" /> Nova integração
        </button>
      }
    >
      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-8">
        <Kpi icon={Plug} label="Conectadas" value={stats.active} hint={`${stats.total} totais`} />
        <Kpi icon={CheckCircle2} label="Operacionais" value={stats.operational} />
        <Kpi icon={AlertTriangle} label="Falhas" value={stats.offline} hint="health offline" />
        <Kpi icon={Activity} label="Requests 24h" value="—" hint="em breve" />
      </div>

      {/* Search + filtros */}
      <GlassCard padding="md" className="mb-6">
        <div className="flex flex-col lg:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Buscar integração..."
              className="w-full bg-black/40 border border-white/10 rounded-lg pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:border-white/30"
            />
          </div>
          <div className="flex flex-wrap gap-2">
            {[["all", "Todas"], ...Object.entries(CATEGORIES).map(([k, v]) => [k, v.label])].map(
              ([k, label]) => (
                <button
                  key={k}
                  onClick={() => setCat(k as string)}
                  className={`px-3 py-2 text-[11px] uppercase tracking-wider rounded-lg border transition-all ${
                    cat === k
                      ? "bg-white text-black border-white"
                      : "border-white/10 text-white/70 hover:bg-white/5"
                  }`}
                >
                  {label}
                </button>
              ),
            )}
          </div>
        </div>
      </GlassCard>

      {list.isLoading && (
        <div className="flex items-center justify-center py-20 text-white/40">
          <Loader2 className="w-6 h-6 animate-spin" />
        </div>
      )}

      {/* Grid por categoria */}
      <div className="space-y-10">
        {Object.entries(grouped).map(([category, items]) => (
          <section key={category}>
            <div className="flex items-baseline justify-between mb-4">
              <h3
                className={`text-sm uppercase tracking-[0.3em] ${
                  CATEGORIES[category]?.color ?? "text-white/70"
                }`}
              >
                {CATEGORIES[category]?.label ?? category}
              </h3>
              <span className="text-[11px] text-white/40">{items.length} provider{items.length > 1 ? "s" : ""}</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {items.map((p, i) => {
                const testing =
                  testConnection.isPending && testConnection.variables?.id === p.id;
                return (
                  <motion.div
                    key={p.id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: i * 0.04 }}
                  >
                    <div onClick={() => setSelected(p)} className="cursor-pointer h-full">
                    <GlassCard padding="md" className="h-full flex flex-col gap-4 hover:border-white/30 transition-colors">
                      <div className="flex items-start gap-3">
                        <div
                          className="w-10 h-10 rounded-lg border border-white/10 flex items-center justify-center text-base font-bold shrink-0"
                          style={{ background: `${p.color}22`, color: p.color || undefined }}
                        >
                          {p.name.charAt(0)}
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center justify-between gap-2">
                            <h4 className="font-semibold truncate">{p.name}</h4>
                            <Circle
                              className={`w-2 h-2 fill-current shrink-0 ${
                                p.is_active ? "text-emerald-400" : "text-white/20"
                              }`}
                            />
                          </div>
                          <p className="text-xs text-white/50 mt-0.5 line-clamp-2">
                            {p.description || "—"}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center justify-between text-[11px] text-white/40 border-t border-white/5 pt-3">
                        <HealthDot status={p.health_status} />
                        <span className="tabular-nums">
                          {p.last_test_at
                            ? `testado ${new Date(p.last_test_at).toLocaleTimeString("pt-BR")}`
                            : "nunca testado"}
                        </span>
                      </div>

                      {p.last_error && (
                        <p className="text-[11px] text-red-300/80 border border-red-500/20 bg-red-500/5 rounded px-2 py-1.5 line-clamp-2">
                          {p.last_error}
                        </p>
                      )}

                      <div className="flex items-center gap-2 mt-auto" onClick={(e) => e.stopPropagation()}>
                        <button
                          onClick={() => testConnection.mutate(p)}
                          disabled={testing}
                          className="flex-1 flex items-center justify-center gap-2 px-3 py-2 text-[11px] uppercase tracking-wider rounded-lg border border-white/15 hover:bg-white/5 disabled:opacity-50"
                        >
                          {testing ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Zap className="w-3.5 h-3.5" />}
                          Testar
                        </button>
                        <button
                          onClick={() => toggleActive.mutate({ id: p.id, active: !p.is_active })}
                          className={`px-3 py-2 text-[11px] uppercase tracking-wider rounded-lg border transition-colors ${
                            p.is_active ? "bg-white/90 text-black border-white" : "border-white/15 hover:bg-white/5"
                          }`}
                        >
                          {p.is_active ? "Ativo" : "Ativar"}
                        </button>
                      </div>
                    </GlassCard>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </section>
        ))}
      </div>

      {filtered.length === 0 && !list.isLoading && (
        <div className="text-center py-20 text-white/40">
          <Webhook className="w-8 h-8 mx-auto mb-3 opacity-50" />
          <p className="text-sm">Nenhuma integração encontrada</p>
        </div>
      )}

      {selected && <IntegrationDetailsModal provider={selected} onClose={() => setSelected(null)} />}
      <IntegrationMarketplaceModal open={marketOpen} onClose={() => setMarketOpen(false)} />
    </AdminPageShell>
  );
}
