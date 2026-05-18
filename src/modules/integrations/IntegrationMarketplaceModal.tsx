/**
 * 🧠 IntegrationMarketplaceModal — Catálogo + criação custom
 */
import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { X, Search, Plus, Sparkles } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

type Item = { id: string; name: string; category: string; description: string; color: string };

const CATALOG: Item[] = [
  { id: "openai", name: "OpenAI", category: "ia", description: "GPT-5, embeddings, vision", color: "#10A37F" },
  { id: "gemini", name: "Google Gemini", category: "ia", description: "Gemini 2.5 / 3 Pro", color: "#4285F4" },
  { id: "supabase", name: "Supabase", category: "banco_dados", description: "Postgres + Auth + Storage", color: "#3ECF8E" },
  { id: "firebase", name: "Firebase", category: "banco_dados", description: "Realtime DB + Auth", color: "#FFCA28" },
  { id: "stripe", name: "Stripe", category: "payments", description: "Pagamentos globais", color: "#635BFF" },
  { id: "mercadopago", name: "Mercado Pago", category: "payments", description: "Pagamentos LATAM", color: "#00B1EA" },
  { id: "resend", name: "Resend", category: "comunicacao", description: "Email transacional", color: "#000000" },
  { id: "sentry", name: "Sentry", category: "monitoring", description: "Error tracking & APM", color: "#362D59" },
  { id: "datadog", name: "Datadog", category: "monitoring", description: "Observability platform", color: "#632CA6" },
  { id: "cloudflare", name: "Cloudflare", category: "cloud", description: "CDN + Workers + R2", color: "#F38020" },
  { id: "aws", name: "AWS", category: "cloud", description: "S3, Lambda, SES", color: "#FF9900" },
  { id: "railway", name: "Railway", category: "deploy", description: "Container deploys", color: "#0B0D0E" },
  { id: "docker", name: "Docker Hub", category: "devops", description: "Registry + images", color: "#2496ED" },
  { id: "mongodb", name: "MongoDB Atlas", category: "banco_dados", description: "Document database", color: "#47A248" },
  { id: "redis", name: "Redis", category: "banco_dados", description: "Cache & pub/sub", color: "#DC382D" },
  { id: "clerk", name: "Clerk", category: "comunicacao", description: "Auth & user mgmt", color: "#6C47FF" },
];

const CATS = [
  ["all", "Tudo"], ["ia", "IA"], ["banco_dados", "Banco de dados"], ["payments", "Pagamentos"],
  ["comunicacao", "Comunicação"], ["monitoring", "Monitoring"], ["cloud", "Cloud"], ["deploy", "Deploy"], ["devops", "DevOps"],
];

export default function IntegrationMarketplaceModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [q, setQ] = useState(""); const [cat, setCat] = useState("all");
  const [tab, setTab] = useState<"catalog" | "custom">("catalog");
  const [custom, setCustom] = useState({ id: "", name: "", category: "automacao", description: "", baseUrl: "" });

  const items = CATALOG.filter((i) => (cat === "all" || i.category === cat) && (!q || i.name.toLowerCase().includes(q.toLowerCase())));

  const add = async (item: Item) => {
    const { error } = await supabase.from("integration_providers" as any).insert({
      id: item.id, name: item.name, category: item.category, description: item.description,
      color: item.color, is_connected: false, is_active: false, health_status: "unknown",
    } as any);
    if (error) return toast.error(error.message);
    toast.success(`${item.name} adicionada`); onClose();
  };

  const addCustom = async () => {
    if (!custom.id || !custom.name) return toast.error("ID e nome obrigatórios");
    const { error } = await supabase.from("integration_providers" as any).insert({
      id: custom.id.toLowerCase().replace(/\s+/g, "_"),
      name: custom.name, category: custom.category, description: custom.description,
      color: "#8B5CF6", is_connected: false, is_active: false, health_status: "unknown",
      config: { base_url: custom.baseUrl, custom: true },
    } as any);
    if (error) return toast.error(error.message);
    toast.success("Integração customizada criada"); onClose();
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-stretch sm:items-center justify-center sm:p-6"
          onClick={onClose}>
          <motion.div initial={{ y: 30, scale: 0.97, opacity: 0 }} animate={{ y: 0, scale: 1, opacity: 1 }} exit={{ y: 30, opacity: 0 }}
            transition={{ type: "spring", stiffness: 280, damping: 28 }}
            className="relative w-full sm:max-w-3xl sm:max-h-[85vh] h-full sm:h-auto bg-[#0a0a0a] sm:rounded-2xl border border-white/10 flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <header className="p-5 border-b border-white/10">
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2 text-xs uppercase tracking-[0.3em] text-white/40">
                    <Sparkles className="w-3.5 h-3.5" /> Marketplace
                  </div>
                  <h2 className="text-xl font-bold mt-1">Adicionar nova integração</h2>
                </div>
                <button onClick={onClose} className="p-2 rounded-lg hover:bg-white/5"><X className="w-4 h-4" /></button>
              </div>
              <div className="flex gap-1 mt-4">
                {(["catalog", "custom"] as const).map((t) => (
                  <button key={t} onClick={() => setTab(t)}
                    className={`px-3 py-1.5 text-xs uppercase tracking-wider rounded-lg border ${tab === t ? "bg-white text-black border-white" : "border-white/10 text-white/60 hover:bg-white/5"}`}>
                    {t === "catalog" ? "Catálogo" : "Customizada"}
                  </button>
                ))}
              </div>
            </header>

            {tab === "catalog" ? (
              <>
                <div className="p-4 border-b border-white/5 flex flex-col gap-3">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                    <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Buscar..."
                      className="w-full bg-black/40 border border-white/10 rounded-lg pl-9 pr-3 py-2 text-sm focus:outline-none focus:border-white/30" />
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {CATS.map(([k, label]) => (
                      <button key={k} onClick={() => setCat(k)}
                        className={`px-2.5 py-1 text-[10px] uppercase tracking-wider rounded border ${cat === k ? "bg-white text-black border-white" : "border-white/10 text-white/60 hover:bg-white/5"}`}>
                        {label}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="flex-1 overflow-y-auto p-4 grid sm:grid-cols-2 gap-3">
                  {items.map((i) => (
                    <button key={i.id} onClick={() => add(i)} className="text-left p-4 rounded-xl border border-white/10 bg-white/[0.02] hover:border-white/30 hover:bg-white/5 transition-all group">
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 rounded-lg border border-white/10 flex items-center justify-center font-bold shrink-0"
                          style={{ background: `${i.color}22`, color: i.color }}>{i.name.charAt(0)}</div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center justify-between">
                            <h4 className="font-semibold">{i.name}</h4>
                            <Plus className="w-4 h-4 text-white/30 group-hover:text-white transition-colors" />
                          </div>
                          <p className="text-xs text-white/50 mt-0.5">{i.description}</p>
                        </div>
                      </div>
                    </button>
                  ))}
                  {items.length === 0 && <p className="sm:col-span-2 text-center text-white/40 text-sm py-8">Nenhum resultado.</p>}
                </div>
              </>
            ) : (
              <div className="flex-1 overflow-y-auto p-5 space-y-3">
                <p className="text-sm text-white/60">Conecte qualquer API REST/Webhook customizado.</p>
                <input value={custom.id} onChange={(e) => setCustom({ ...custom, id: e.target.value })}
                  placeholder="ID único (ex: minha_api)"
                  className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-white/30" />
                <input value={custom.name} onChange={(e) => setCustom({ ...custom, name: e.target.value })}
                  placeholder="Nome de exibição"
                  className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-white/30" />
                <select value={custom.category} onChange={(e) => setCustom({ ...custom, category: e.target.value })}
                  className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-white/30">
                  {CATS.slice(1).map(([k, l]) => <option key={k} value={k}>{l}</option>)}
                </select>
                <input value={custom.baseUrl} onChange={(e) => setCustom({ ...custom, baseUrl: e.target.value })}
                  placeholder="Base URL da API (https://...)"
                  className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-white/30" />
                <textarea value={custom.description} onChange={(e) => setCustom({ ...custom, description: e.target.value })}
                  placeholder="Descrição curta" rows={2}
                  className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-white/30" />
                <button onClick={addCustom} className="w-full px-4 py-2.5 rounded-lg bg-white text-black font-medium text-sm hover:bg-white/90">
                  Criar integração customizada
                </button>
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
