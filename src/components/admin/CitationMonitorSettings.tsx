/**
 * ⚙️ CitationMonitorSettings — pausa/retoma, edita queries e modelos do Citation Monitor.
 * Consome créditos de Lovable AI a cada execução, por isso o controle é importante.
 */
import { useEffect, useState } from "react";
import { Settings2, Save, Plus, Trash2, Pause, Play, Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import GlassCard from "@/components/GlassCard";
import { toast } from "sonner";

const AVAILABLE_MODELS = [
  { id: "google/gemini-2.5-flash", label: "Gemini 2.5 Flash (barato)" },
  { id: "google/gemini-2.5-pro", label: "Gemini 2.5 Pro (caro)" },
  { id: "openai/gpt-5-mini", label: "GPT-5 Mini (barato)" },
  { id: "openai/gpt-5", label: "GPT-5 (caro)" },
];

interface Settings {
  enabled: boolean;
  only_save_mentions: boolean;
  models: string[];
  queries: string[];
  last_run_at: string | null;
  last_run_mentions: number | null;
  last_run_total: number | null;
}

export default function CitationMonitorSettings() {
  const [s, setS] = useState<Settings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const load = async () => {
    setLoading(true);
    const { data } = await supabase
      .from("citation_monitor_settings" as any)
      .select("*")
      .eq("singleton", true)
      .maybeSingle();
    setS((data as any) ?? null);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const save = async (patch: Partial<Settings>) => {
    if (!s) return;
    setSaving(true);
    const next = { ...s, ...patch };
    setS(next);
    const { error } = await supabase
      .from("citation_monitor_settings" as any)
      .update(patch)
      .eq("singleton", true);
    setSaving(false);
    if (error) { toast.error("Erro ao salvar: " + error.message); load(); return; }
    toast.success("Configuração salva");
  };

  if (loading || !s) {
    return (
      <GlassCard className="p-6 flex items-center gap-2 text-sm text-muted-foreground">
        <Loader2 className="w-4 h-4 animate-spin" /> Carregando configurações…
      </GlassCard>
    );
  }

  const toggleModel = (id: string) => {
    const next = s.models.includes(id) ? s.models.filter((m) => m !== id) : [...s.models, id];
    if (!next.length) return toast.error("Selecione ao menos 1 modelo");
    save({ models: next });
  };

  const updateQuery = (i: number, v: string) => {
    const next = [...s.queries];
    next[i] = v;
    setS({ ...s, queries: next });
  };

  const removeQuery = (i: number) => save({ queries: s.queries.filter((_, idx) => idx !== i) });
  const addQuery = () => setS({ ...s, queries: [...s.queries, ""] });

  return (
    <motion.div initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }}>
      <GlassCard className="p-6 space-y-5">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-2">
            <Settings2 className="w-4 h-4 text-primary" />
            <h3 className="font-semibold">Citation Monitor — configurações</h3>
          </div>
          <button
            onClick={() => save({ enabled: !s.enabled })}
            disabled={saving}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-medium ${
              s.enabled
                ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-400"
                : "border-amber-500/30 bg-amber-500/10 text-amber-400"
            }`}
          >
            {s.enabled ? <><Play className="w-3.5 h-3.5" /> Ativo</> : <><Pause className="w-3.5 h-3.5" /> Pausado</>}
          </button>
        </div>

        <p className="text-xs text-muted-foreground leading-relaxed">
          ⚠️ Cada execução consome créditos de Lovable AI (1 chamada por query × por modelo).
          Com {s.queries.length} queries × {s.models.length} modelos = <strong>{s.queries.length * s.models.length} chamadas</strong> por rodada.
          {s.last_run_at && (
            <> Última rodada: {new Date(s.last_run_at).toLocaleString("pt-BR")} — {s.last_run_mentions}/{s.last_run_total} menções.</>
          )}
        </p>

        <label className="flex items-center gap-2 text-sm cursor-pointer">
          <input
            type="checkbox"
            checked={s.only_save_mentions}
            onChange={(e) => save({ only_save_mentions: e.target.checked })}
            className="rounded border-white/20"
          />
          <span>Salvar apenas respostas que mencionam a SevenDevX (reduz ruído)</span>
        </label>

        <div>
          <p className="text-xs uppercase tracking-widest text-muted-foreground mb-2">Modelos consultados</p>
          <div className="flex flex-wrap gap-2">
            {AVAILABLE_MODELS.map((m) => {
              const active = s.models.includes(m.id);
              return (
                <button
                  key={m.id}
                  onClick={() => toggleModel(m.id)}
                  className={`px-3 py-1.5 rounded-lg border text-xs ${
                    active
                      ? "border-primary/40 bg-primary/10 text-primary"
                      : "border-white/10 text-muted-foreground hover:bg-white/5"
                  }`}
                >
                  {m.label}
                </button>
              );
            })}
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs uppercase tracking-widest text-muted-foreground">Queries que o monitor pergunta</p>
            <button
              onClick={addQuery}
              className="inline-flex items-center gap-1 text-xs px-2 py-1 rounded-md border border-white/10 hover:bg-white/5"
            >
              <Plus className="w-3 h-3" /> Adicionar
            </button>
          </div>
          <div className="space-y-2">
            {s.queries.map((q, i) => (
              <div key={i} className="flex gap-2">
                <input
                  value={q}
                  onChange={(e) => updateQuery(i, e.target.value)}
                  onBlur={() => save({ queries: s.queries })}
                  placeholder="Pergunta a fazer para a IA..."
                  className="flex-1 px-3 py-2 rounded-lg bg-background border border-white/10 text-sm"
                />
                <button
                  onClick={() => removeQuery(i)}
                  className="p-2 rounded-lg border border-white/10 hover:bg-red-500/10 hover:text-red-400"
                  title="Remover"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
          <button
            onClick={() => save({ queries: s.queries })}
            disabled={saving}
            className="mt-3 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary text-primary-foreground text-xs"
          >
            <Save className="w-3.5 h-3.5" /> Salvar queries
          </button>
        </div>
      </GlassCard>
    </motion.div>
  );
}
